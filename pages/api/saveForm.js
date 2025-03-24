import { nanoid } from 'nanoid';
import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';
import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Starting form save process...'); // Debug log

  try {
    console.log('Connecting to MongoDB...'); // Debug log
    await dbConnect();
    console.log('MongoDB connected'); // Debug log

    const formId = nanoid();
    const { formData, c2fSignature } = req.body;

    // Validate required data
    if (!formData || !c2fSignature) {
      console.error('Missing required data:', { formData: !!formData, c2fSignature: !!c2fSignature });
      return res.status(400).json({
        success: false,
        message: 'Missing required form data or signature'
      });
    }

    console.log('Creating form document...'); // Debug log
    
    // Create new form document
    const form = new Form({
      formId,
      formData,
      c2fSignature,
      status: 'awaiting_signature'
    });

    console.log('Saving form to database...'); // Debug log
    await form.save();
    console.log('Form saved successfully'); // Debug log

    const baseUrl = 'https://media-buyer-onboarding.vercel.app';
    const signatureLink = `${baseUrl}/sign/${formId}`;

    console.log('Sending email...'); // Debug log
    
    // Send email to contractor
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: formData.email,
      from: {
        email: 'partners@convert2freedom.com',
        name: 'Nick Torson'
      },
      subject: 'Please Sign Your Media Buyer Contract',
      html: `
        <h2>Media Buyer Contract Signature Required</h2>
        <p>Dear ${formData.name},</p>
        <p>Thank you for your interest in joining Convert 2 Freedom. Please review and sign your contract using the link below:</p>
        <p><a href="${signatureLink}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Sign Your Contract</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">${signatureLink}</p>
        <p>This link will expire in 7 days.</p>
        <p>If you have any issues, please contact us at partners@convert2freedom.com</p>
      `
    };

    await sgMail.send(msg);
    console.log('Email sent successfully'); // Debug log

    res.status(200).json({ 
      success: true,
      message: 'Form saved and email sent',
      formId,
      signatureLink
    });
  } catch (error) {
    console.error('Detailed save form error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save form',
      error: error.message,
      errorDetails: {
        name: error.name,
        code: error.code
      }
    });
  }
} 