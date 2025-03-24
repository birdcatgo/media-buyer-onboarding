import dbConnect from '../../lib/mongodb';
import Form from '../../models/Form';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { formId } = req.query;
    console.log('Fetching form with ID:', formId);

    const form = await Form.findOne({ formId });
    
    if (!form) {
      console.log('Form not found:', formId);
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if form has expired
    if (form.expiresAt < new Date()) {
      console.log('Form expired:', formId);
      return res.status(400).json({ message: 'This signature link has expired' });
    }

    console.log('Form found:', formId);
    res.status(200).json(form);
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ message: 'Failed to get form', error: error.message });
  }
} 