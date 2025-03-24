import mongoose from 'mongoose';

// Check if the model is already defined to prevent overwriting
const FormSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
    unique: true
  },
  formData: {
    type: Object,
    required: true
  },
  c2fSignature: {
    type: Object,
    required: true
  },
  contractorSignature: {
    type: Object,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'awaiting_signature', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days from now
  }
});

// Use mongoose.models.Form || mongoose.model('Form', FormSchema) pattern
const Form = mongoose.models.Form || mongoose.model('Form', FormSchema);

export default Form; 