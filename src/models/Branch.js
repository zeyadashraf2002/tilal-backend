import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Saudi Arabia'
    }
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Statistics
  totalWorkers: {
    type: Number,
    default: 0
  },
  totalClients: {
    type: Number,
    default: 0
  },
  activeTasks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;

