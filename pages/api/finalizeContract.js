import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';
import sgMail from '@sendgrid/mail';
import { jsPDF } from 'jspdf';

// Backup PDF generation function using plain text
const generateBackupPDF = (form, signature, date) => {
  try {
    const doc = new jsPDF();
    
    // Simple text-based layout with minimal formatting
    doc.setFontSize(12);
    
    const content = [
      'MEDIA BUYER CONTRACT',
      'Convert 2 Freedom',
      '',
      'CONTRACTOR INFORMATION',
      `Name: ${form.formData.name}`,
      `Email: ${form.formData.email}`,
      `Start Date: ${form.formData.contractDetails?.startDate || date}`,
      `Commission: ${form.formData.commission}`,
      '',
      'CONTRACT TERMS',
      form.formData.contractTerms || '',
      '',
      'SIGNATURES',
      `Contractor: ${signature}`,
      `Date: ${date}`,
      '',
      'Convert 2 Freedom Representative: Nick Torson',
      `Date: ${form.formData.c2fSignatureDate || date}`
    ];

    let y = 20;
    content.forEach(line => {
      if (y > 280) { // Check if we need a new page
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 10;
    });

    return doc.output('base64');
  } catch (error) {
    console.error('Backup PDF generation failed:', error);
    throw error;
  }
};

// Primary PDF generation function
const generatePrimaryPDF = (form, signature, date) => {
  try {
    const doc = new jsPDF();
    
    // Add content to PDF with proper formatting
    doc.setFontSize(20);
    doc.text('Media Buyer Contract', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Convert 2 Freedom', 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Contractor Information', 20, 50);
    doc.text(`Name: ${form.formData.name}`, 20, 60);
    doc.text(`Email: ${form.formData.email}`, 20, 70);
    doc.text(`Start Date: ${form.formData.contractDetails?.startDate || date}`, 20, 80);
    doc.text(`Commission: ${form.formData.commission}`, 20, 90);

    doc.text('Contract Terms', 20, 110);
    const terms = doc.splitTextToSize(form.formData.contractTerms || '', 170);
    doc.text(terms, 20, 120);

    // Add signatures at the bottom
    doc.text('Signatures', 20, 220);
    doc.line(20, 225, 190, 225);
    
    doc.text(`Contractor Signature: ${signature}`, 20, 235);
    doc.text(`Date Signed: ${date}`, 20, 245);
    
    doc.text('Convert 2 Freedom Representative: Nick Torson', 20, 260);
    doc.text(`Date: ${form.formData.c2fSignatureDate || date}`, 20, 270);

    return doc.output('base64');
  } catch (error) {
    console.error('Primary PDF generation failed:', error);
    throw error;
  }
};

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

    // Just update form with contractor signature
    try {
      form.contractorSignature = { signature, date };
      form.status = 'completed';
      await form.save();
      console.log('Form updated successfully');

      // Return success with redirect URL
      res.status(200).json({ 
        message: 'Contract signed successfully',
        redirectUrl: `/generate-pdf/${formId}` // New page we'll create for PDF generation
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      throw new Error('Failed to update form in database');
    }
  } catch (error) {
    console.error('Contract finalization error:', error);
    res.status(500).json({ 
      message: 'Failed to finalize contract', 
      error: error.message
    });
  }
} 