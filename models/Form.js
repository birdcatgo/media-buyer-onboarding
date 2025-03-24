import mongoose from 'mongoose';

const FormSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
    unique: true
  },
  formData: {
    name: String,
    email: String,
    phone: String,
    commission: String,
    monthlySalary: String,
    networks: String,
    trafficSources: String,
    verticals: String,
    kpiGoals: String,
    // ... other form fields
  },
  c2fSignature: {
    name: String,
    title: String,
    signature: String,
    date: String
  },
  contractorSignature: {
    signature: String,
    date: String
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

export default mongoose.models.Form || mongoose.model('Form', FormSchema); 