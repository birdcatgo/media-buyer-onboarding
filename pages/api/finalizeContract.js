import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';
import sgMail from '@sendgrid/mail';
import html_to_pdf from 'html-pdf-node';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { formId, signature, date } = req.body;
    console.log('Starting contract finalization for:', formId);

    if (!formId || !signature) {
      console.log('Missing required fields:', { formId, signature });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const form = await Form.findOne({ formId });
    console.log('Form found:', form ? 'yes' : 'no');
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.status === 'completed') {
      return res.status(400).json({ message: 'Contract has already been signed' });
    }

    // Update form with contractor signature
    try {
      form.contractorSignature = { signature, date };
      form.status = 'completed';
      await form.save();
      console.log('Form updated successfully');
    } catch (dbError) {
      console.error('Database update error:', dbError);
      throw new Error('Failed to update form in database');
    }

    // Generate PDF
    console.log('Starting PDF generation');
    const contractHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .section { 
            margin-bottom: 20px;
          }
          .signature { 
            margin-top: 40px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Media Buyer Contract</h1>
          <h2>Convert 2 Freedom</h2>
        </div>

        <div class="section">
          <h3>Contractor Information</h3>
          <p><strong>Name:</strong> ${form.formData.name}</p>
          <p><strong>Email:</strong> ${form.formData.email}</p>
          <p><strong>Start Date:</strong> ${form.formData.contractDetails?.startDate || date}</p>
          <p><strong>Commission:</strong> ${form.formData.commission}</p>
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

    const options = { format: 'A4' };
    const file = { content: contractHtml };
    
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);
    console.log('PDF generated');

    // Convert PDF buffer to base64
    const pdfBase64 = pdfBuffer.toString('base64');
    console.log('PDF converted to base64');

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

    console.log('Sending emails');
    for (const email of emails) {
      try {
        await sgMail.send({
          ...email,
          from: {
            email: 'partners@convert2freedom.com',
            name: 'Nick Torson'
          }
        });
        console.log('Email sent successfully to:', email.to);
      } catch (emailError) {
        console.error('Email send error:', emailError);
        throw new Error(`Failed to send email to ${email.to}`);
      }
    }

    res.status(200).json({ message: 'Contract finalized successfully' });
  } catch (error) {
    console.error('Contract finalization error:', error);
    res.status(500).json({ 
      message: 'Failed to finalize contract', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 