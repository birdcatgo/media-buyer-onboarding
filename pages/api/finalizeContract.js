import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';
import sgMail from '@sendgrid/mail';
import html2pdf from 'html2pdf.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { formId, signature, date } = req.body;
    
    // Validate inputs
    if (!formId || !signature) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find and update form
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

    // Generate PDF HTML content
    const pdfContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #333;">MEDIA BUYER CONTRACTOR AGREEMENT</h1>
        
        <div style="margin-bottom: 20px;">
          <p>This Independent Contractor Agreement ("Agreement") is entered into as of ${date} by and between:</p>
          <p>Company: Convert 2 Freedom LLC ("Company")<br />
          Contractor: ${form.formData.name} ("Media Buyer")</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2>Contract Details</h2>
          <p><strong>Commission:</strong> ${form.formData.commission}</p>
          <p><strong>Monthly Salary:</strong> $${form.formData.monthlySalary} USD</p>
          <p><strong>Networks:</strong> ${form.formData.networks}</p>
          <p><strong>Traffic Sources:</strong> ${form.formData.trafficSources}</p>
          <p><strong>Verticals:</strong> ${form.formData.verticals}</p>
          <p><strong>KPI Goals:</strong> ${form.formData.kpiGoals}</p>
        </div>

        <!-- Contract Terms -->
        <div style="margin-bottom: 20px;">
          <h2>1.0 Scope of Work</h2>
          <p>The Media Buyer agrees to provide media buying and advertising services for the Company...</p>
          <!-- Add all contract terms here -->
        </div>

        <!-- Signatures -->
        <div style="margin-top: 40px; page-break-inside: avoid;">
          <h2>Signatures</h2>
          
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div style="flex: 1; margin-right: 20px;">
              <h3>Company Representative:</h3>
              <p>Name: Nick Torson</p>
              <p>Title: CEO</p>
              <p>Signature: ${form.c2fSignature.signature}</p>
              <p>Date: ${form.c2fSignature.date}</p>
            </div>
            
            <div style="flex: 1;">
              <h3>Media Buyer (Contractor):</h3>
              <p>Name: ${form.formData.name}</p>
              <p>Title: Freelance Media Buyer</p>
              <p>Signature: ${signature}</p>
              <p>Date: ${date}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Convert HTML to PDF
    const options = {
      margin: 1,
      filename: `${form.formData.name}-media-buyer-contract.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait'
      }
    };

    // Generate PDF using html2pdf
    const pdfBlob = await html2pdf()
      .from(pdfContent)
      .set(options)
      .output('blob');

    // Convert blob to base64
    const pdfBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(pdfBlob);
    });

    // Send emails to both parties
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
        `
      },
      {
        to: 'partners@convert2freedom.com',
        subject: `Media Buyer Contract Signed - ${form.formData.name}`,
        html: `
          <h2>New Contract Signed</h2>
          <p>The Media Buyer Contract for ${form.formData.name} has been signed.</p>
          <p>Please find the signed contract attached.</p>
        `
      }
    ];

    // Send emails with PDF attachment
    for (const email of emails) {
      await sgMail.send({
        ...email,
        from: {
          email: 'partners@convert2freedom.com',
          name: 'Nick Torson'
        },
        attachments: [{
          content: pdfBase64,
          filename: `${form.formData.name}-signed-contract.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }]
      });
    }

    res.status(200).json({ message: 'Contract finalized successfully' });
  } catch (error) {
    console.error('Finalize contract error:', error);
    res.status(500).json({ message: 'Failed to finalize contract', error: error.message });
  }
} 