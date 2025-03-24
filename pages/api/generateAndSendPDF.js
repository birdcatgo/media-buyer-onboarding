import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';
import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { formId } = req.body;
    console.log('Processing formId:', formId);

    const form = await Form.findOne({ formId });
    if (!form) {
      console.log('Form not found:', formId);
      return res.status(404).json({ message: 'Form not found' });
    }

    // Create HTML content for the email
    const contractHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center;">Media Buyer Contract</h1>
        <h2 style="text-align: center;">Convert 2 Freedom</h2>
        
        <div style="margin: 20px 0;">
          <h3>Contractor Information</h3>
          <p><strong>Name:</strong> ${form.formData.name}</p>
          <p><strong>Email:</strong> ${form.formData.email}</p>
          <p><strong>Start Date:</strong> ${form.formData.contractDetails?.startDate || form.contractorSignature.date}</p>
          <p><strong>Commission:</strong> ${form.formData.commission}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>Contract Terms</h3>
          <p>${form.formData.contractTerms || ''}</p>
        </div>

        <div style="margin: 20px 0; border-top: 1px solid #000; padding-top: 20px;">
          <p><strong>Contractor Signature:</strong> ${form.contractorSignature.signature}</p>
          <p><strong>Date Signed:</strong> ${form.contractorSignature.date}</p>
        </div>

        <div style="margin: 20px 0; border-top: 1px solid #000; padding-top: 20px;">
          <p><strong>Convert 2 Freedom Representative:</strong> Nick Torson</p>
          <p><strong>Date:</strong> ${form.formData.c2fSignatureDate || form.contractorSignature.date}</p>
        </div>
      </div>
    `;

    // Send emails
    console.log('Setting up SendGrid');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const emails = [
      {
        to: form.formData.email,
        subject: 'Your Signed Media Buyer Contract',
        html: `
          <h2>Contract Signed Successfully</h2>
          <p>Dear ${form.formData.name},</p>
          <p>Your Media Buyer Contract has been signed successfully. The contract details are below.</p>
          <p>Welcome to Convert 2 Freedom!</p>
          ${contractHtml}
        `
      },
      {
        to: 'partners@convert2freedom.com',
        subject: `Media Buyer Contract Signed - ${form.formData.name}`,
        html: `
          <h2>New Contract Signed</h2>
          <p>The Media Buyer Contract for ${form.formData.name} has been signed.</p>
          ${contractHtml}
        `
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
        console.error('Failed to send email to:', email.to, emailError);
        throw new Error(`Failed to send email to ${email.to}: ${emailError.message}`);
      }
    }

    res.status(200).json({ message: 'Contract sent successfully' });
  } catch (error) {
    console.error('Contract sending error:', error);
    res.status(500).json({ 
      message: 'Failed to generate and send PDF', 
      error: error.message 
    });
  }
} 