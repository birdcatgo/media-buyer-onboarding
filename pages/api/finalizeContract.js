import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';
import sgMail from '@sendgrid/mail';
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { formId, signature, date } = req.body;
    console.log('Finalizing contract:', formId);

    if (!formId || !signature) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const form = await Form.findOne({ formId });
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.status === 'completed') {
      return res.status(400).json({ message: 'Contract has already been signed' });
    }

    // Update form with contractor signature
    form.contractorSignature = { signature, date };
    form.status = 'completed';
    await form.save();

    // Generate PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const contractHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .signature { margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Media Buyer Contract</h1>
          <h2>Convert 2 Freedom</h2>
        </div>

        <div class="section">
          <h3>Contractor Information</h3>
          <p>Name: ${form.formData.name}</p>
          <p>Email: ${form.formData.email}</p>
          <p>Start Date: ${form.formData.contractDetails?.startDate}</p>
          <p>Commission: ${form.formData.commission}</p>
        </div>

        <div class="section">
          <h3>Contract Terms</h3>
          ${form.formData.contractTerms || ''}
        </div>

        <div class="signature">
          <p><strong>Contractor Signature:</strong> ${signature}</p>
          <p><strong>Date Signed:</strong> ${date}</p>
        </div>

        <div class="signature">
          <p><strong>Convert 2 Freedom Representative:</strong> Nick Torson</p>
          <p><strong>Date:</strong> ${form.formData.c2fSignatureDate || date}</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(contractHtml);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    // Convert PDF buffer to base64
    const pdfBase64 = pdfBuffer.toString('base64');

    // Send confirmation emails with PDF attachment
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const emails = [
      {
        to: form.formData.email,
        subject: 'Your Signed Media Buyer Contract',
        html: `
          <h2>Contract Signed Successfully</h2>
          <p>Dear ${form.formData.name},</p>
          <p>Your Media Buyer Contract has been signed successfully. Please find the signed contract attached.</p>
          <p>Welcome to Convert 2 Freedom!</p>
        `,
        attachments: [{
          content: pdfBase64,
          filename: 'Media_Buyer_Contract.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        }]
      },
      {
        to: 'partners@convert2freedom.com',
        subject: `Media Buyer Contract Signed - ${form.formData.name}`,
        html: `
          <h2>New Contract Signed</h2>
          <p>The Media Buyer Contract for ${form.formData.name} has been signed. Please find the signed contract attached.</p>
        `,
        attachments: [{
          content: pdfBase64,
          filename: `Media_Buyer_Contract_${form.formData.name.replace(/\s+/g, '_')}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }]
      }
    ];

    for (const email of emails) {
      await sgMail.send({
        ...email,
        from: {
          email: 'partners@convert2freedom.com',
          name: 'Nick Torson'
        }
      });
    }

    res.status(200).json({ message: 'Contract finalized successfully' });
  } catch (error) {
    console.error('Finalize contract error:', error);
    res.status(500).json({ message: 'Failed to finalize contract', error: error.message });
  }
} 