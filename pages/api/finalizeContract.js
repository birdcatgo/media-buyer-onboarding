import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';
import sgMail from '@sendgrid/mail';

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

    // Send confirmation emails
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const emails = [
      {
        to: form.formData.email,
        subject: 'Your Signed Media Buyer Contract',
        html: `
          <h2>Contract Signed Successfully</h2>
          <p>Dear ${form.formData.name},</p>
          <p>Your Media Buyer Contract has been signed successfully.</p>
          <p>Welcome to Convert 2 Freedom!</p>
        `
      },
      {
        to: 'partners@convert2freedom.com',
        subject: `Media Buyer Contract Signed - ${form.formData.name}`,
        html: `
          <h2>New Contract Signed</h2>
          <p>The Media Buyer Contract for ${form.formData.name} has been signed.</p>
        `
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