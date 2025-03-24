import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify SendGrid API key at the start
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key is missing');
    return res.status(500).json({
      message: 'Email service configuration error',
      error: 'Missing API key'
    });
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const { name, email, pdfData } = req.body;

    // Validate required fields
    if (!name || !email || !pdfData) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          pdf: !pdfData ? 'PDF data is required' : null
        }
      });
    }

    const sendEmailWithRetry = async (emailConfig, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Attempt ${i + 1} to send email to ${emailConfig.to}`);
          const result = await sgMail.send(emailConfig);
          console.log(`Successfully sent email to ${emailConfig.to}`);
          return result;
        } catch (error) {
          console.error(`Attempt ${i + 1} failed:`, {
            error: error.message,
            response: error.response?.body,
            code: error.code,
            to: emailConfig.to
          });
          if (i === retries - 1) throw error;
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
      }
    };

    const msg = {
      to: 'partners@convert2freedom.com',
      from: {
        email: 'partners@convert2freedom.com',
        name: 'Nick Torson'
      },
      subject: `New Signed Media Buyer Contract - ${name}`,
      html: `
        <h2>New Signed Media Buyer Contract</h2>
        <p>A new Signed Media Buyer Contract has been received from ${name}.</p>
        <p>Email: ${email}</p>
      `,
      attachments: [{
        content: pdfData,
        filename: `${name}-signed-media-buyer-contract.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }]
    };

    const applicantMsg = {
      to: email,
      from: {
        email: 'partners@convert2freedom.com',
        name: 'Nick Torson'
      },
      subject: 'Your Signed Media Buyer Contract - Convert 2 Freedom',
      html: `
        <h2>Thank you for signing the Media Buyer Contract</h2>
        <p>Dear ${name},</p>
        <p>Thank you for signing the Media Buyer Contract with Convert 2 Freedom. We have received your signed contract and will review it shortly.</p>
        <p>You will find a copy of your Signed Media Buyer Contract attached to this email.</p>
        <p>Next Steps:</p>
        <ul>
          <li>Our team will review your signed contract</li>
          <li>We will contact you to schedule an onboarding call</li>
          <li>You will receive access to our training materials</li>
        </ul>
      `,
      attachments: [{
        content: pdfData,
        filename: `${name}-signed-media-buyer-contract.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }]
    };

    try {
      // Send both emails with retry logic
      await sendEmailWithRetry(msg);
      await sendEmailWithRetry(applicantMsg);
      
      res.status(200).json({ message: 'Contract submitted successfully' });
    } catch (error) {
      console.error('Final SendGrid error:', {
        message: error.message,
        response: error.response?.body,
        code: error.code
      });
      res.status(500).json({
        message: 'Failed to send email',
        error: error.response?.body?.errors?.[0]?.message || error.message
      });
    }
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      message: 'Failed to process submission',
      error: error.message
    });
  }
} 