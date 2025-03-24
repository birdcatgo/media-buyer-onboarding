import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';
import sgMail from '@sendgrid/mail';
import { jsPDF } from 'jspdf';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { formId } = req.body;

    const form = await Form.findOne({ formId });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Generate PDF
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.setFontSize(20);
    doc.text('Media Buyer Contract', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Convert 2 Freedom', 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Contractor Information', 20, 50);
    doc.text(`Name: ${form.formData.name}`, 20, 60);
    doc.text(`Email: ${form.formData.email}`, 20, 70);
    doc.text(`Start Date: ${form.formData.contractDetails?.startDate || form.contractorSignature.date}`, 20, 80);
    doc.text(`Commission: ${form.formData.commission}`, 20, 90);

    doc.text('Contract Terms', 20, 110);
    const terms = doc.splitTextToSize(form.formData.contractTerms || '', 170);
    doc.text(terms, 20, 120);

    doc.text('Signatures', 20, 220);
    doc.line(20, 225, 190, 225);
    
    doc.text(`Contractor Signature: ${form.contractorSignature.signature}`, 20, 235);
    doc.text(`Date Signed: ${form.contractorSignature.date}`, 20, 245);
    
    doc.text('Convert 2 Freedom Representative: Nick Torson', 20, 260);
    doc.text(`Date: ${form.formData.c2fSignatureDate || form.contractorSignature.date}`, 20, 270);

    const pdfBase64 = doc.output('base64');

    // Send emails
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

    res.status(200).json({ message: 'PDF generated and sent successfully' });
  } catch (error) {
    console.error('Generate and send PDF error:', error);
    res.status(500).json({ 
      message: 'Failed to generate and send PDF', 
      error: error.message 
    });
  }
} 