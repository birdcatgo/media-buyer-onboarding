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

    // Create HTML content for the email with full contract
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
          <h3>1. SERVICES</h3>
          <p>The Contractor agrees to provide media buying services for the Company. These services include:</p>
          <ul>
            <li>Managing and optimizing paid advertising campaigns across multiple platforms</li>
            <li>Creating and implementing media buying strategies aligned with company goals</li>
            <li>Conducting market research and competitor analysis</li>
            <li>Monitoring campaign performance and making data-driven optimizations</li>
            <li>Providing detailed reports on campaign performance and ROI</li>
            <li>Managing advertising budgets effectively</li>
            <li>Identifying and targeting relevant audience segments</li>
            <li>Maintaining up-to-date knowledge of industry trends and best practices</li>
          </ul>
          <p>The Contractor shall perform these services with professional skill and diligence, maintaining regular communication with the Company regarding campaign status and performance.</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>2. COMPENSATION</h3>
          <p>2.1 Base Compensation</p>
          <p>The Contractor shall receive a monthly salary of ${form.formData.monthlySalary || 'N/A'}.</p>
          
          <p>2.2 Commission Structure</p>
          <p>${form.formData.commission}</p>
          
          <p>2.3 Payment Terms</p>
          <p>Payments will be made monthly, with commissions calculated and paid based on the previous month's performance. All payments are subject to the Contractor submitting accurate and timely reports of their activities.</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>3. TERM AND TERMINATION</h3>
          <p>3.1 Term</p>
          <p>This Agreement shall commence on ${form.formData.contractDetails?.startDate || form.contractorSignature.date} and shall continue until terminated by either party as provided herein.</p>
          
          <p>3.2 Termination</p>
          <p>Either party may terminate this Agreement with thirty (30) days written notice to the other party. The Company may terminate this Agreement immediately for cause, including but not limited to:</p>
          <ul>
            <li>Breach of any material term of this Agreement</li>
            <li>Failure to perform services as required</li>
            <li>Violation of Company policies or procedures</li>
            <li>Engaging in conduct harmful to the Company's interests</li>
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h3>4. CONFIDENTIALITY</h3>
          <p>4.1 Definition</p>
          <p>Confidential Information includes all information, whether written, oral, or electronic, relating to the Company's business, including but not limited to:</p>
          <ul>
            <li>Marketing strategies and plans</li>
            <li>Customer and client information</li>
            <li>Financial data and projections</li>
            <li>Trade secrets and proprietary information</li>
            <li>Operating procedures and methods</li>
            <li>Technical information and know-how</li>
          </ul>
          
          <p>4.2 Obligations</p>
          <p>The Contractor agrees to:</p>
          <ul>
            <li>Maintain strict confidentiality of all Confidential Information</li>
            <li>Use Confidential Information solely for performing services under this Agreement</li>
            <li>Not disclose Confidential Information to any third party without prior written consent</li>
            <li>Return or destroy all Confidential Information upon termination of this Agreement</li>
          </ul>
          
          <p>4.3 Duration</p>
          <p>The confidentiality obligations shall survive the termination of this Agreement indefinitely.</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>5. INTELLECTUAL PROPERTY</h3>
          <p>5.1 Ownership</p>
          <p>All work product, including but not limited to advertising campaigns, creative materials, strategies, and analyses created by the Contractor during the term of this Agreement shall be the sole and exclusive property of the Company.</p>
          
          <p>5.2 Assignment</p>
          <p>The Contractor hereby assigns to the Company all right, title, and interest in any intellectual property created in the course of providing services under this Agreement.</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>6. NON-COMPETE</h3>
          <p>6.1 Duration and Scope</p>
          <p>During the term of this Agreement and for twelve (12) months following its termination, the Contractor agrees not to:</p>
          <ul>
            <li>Engage in any business directly competing with the Company</li>
            <li>Solicit any clients or customers of the Company</li>
            <li>Provide similar services to competing businesses in the same market</li>
          </ul>
          
          <p>6.2 Geographic Area</p>
          <p>This non-compete provision applies to all territories where the Company conducts business.</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>7. INDEPENDENT CONTRACTOR STATUS</h3>
          <p>7.1 Relationship</p>
          <p>The Contractor is an independent contractor and not an employee of the Company. Nothing in this Agreement shall be construed as creating an employer-employee relationship.</p>
          
          <p>7.2 Responsibilities</p>
          <p>The Contractor is responsible for:</p>
          <ul>
            <li>Payment of all applicable taxes</li>
            <li>Providing their own insurance coverage</li>
            <li>Maintaining their own business licenses and permits</li>
            <li>Providing their own equipment and materials</li>
          </ul>
        </div>

        <div style="margin: 20px 0; border-top: 1px solid #000; padding-top: 20px;">
          <h3>SIGNATURES</h3>
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
          <p>Your Media Buyer Contract has been signed successfully. The complete contract is below.</p>
          <p>Welcome to Convert 2 Freedom!</p>
          ${contractHtml}
        `
      },
      {
        to: 'partners@convert2freedom.com',
        subject: `Media Buyer Contract Signed - ${form.formData.name}`,
        html: `
          <h2>New Contract Signed</h2>
          <p>The Media Buyer Contract for ${form.formData.name} has been signed. The complete contract is below.</p>
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