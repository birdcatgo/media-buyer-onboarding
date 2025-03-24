import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { formId } = req.query;
    console.log('Searching for form with ID:', formId); // Debug log

    const form = await Form.findOne({ formId });
    console.log('Form found:', form ? 'Yes' : 'No'); // Debug log
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if form has expired
    if (form.expiresAt < new Date()) {
      return res.status(400).json({ message: 'This signature link has expired' });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ message: 'Failed to get form', error: error.message });
  }
} 