// backend/src/models/Task.js - ✅ UPDATED
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxlength: 2000
  },
  
  // ✅ UPDATED: Site & Section (both required now)
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: [true, 'Site is required']
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Section is required'] // ✅ Now required
  },
  
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'review', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
     required: false
  },
  category: {
    type: String,
    enum: ['lawn-mowing', 'tree-trimming', 'landscaping', 'irrigation', 'pest-control', 'other'],
    default: 'other',
     required: false
  },
  
  scheduledDate: {
    type: Date,
    required: true
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 2,
     required: false
  },
  actualDuration: {
    type: Number,
    default: 0
  },
  
  // GPS Tracking
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  startLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timestamp: Date
  },
  endLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timestamp: Date
  },
  
  // ✅ IMAGES: Before/After only (reference images come from Section)
  images: {
    before: [{
      url: String,
      cloudinaryId: String,
      thumbnail: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isVisibleToClient: {
        type: Boolean,
        default: false
      }
    }],
    after: [{
      url: String,
      cloudinaryId: String,
      thumbnail: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isVisibleToClient: {
        type: Boolean,
        default: false
      }
    }]
    // ❌ REMOVED: reference array (now comes from Section)
  },
  
  // ❌ REMOVED: plants array (not needed anymore)
  
  // Materials
  materials: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    name: String,
    quantity: Number,
    unit: String,
    confirmed: {
      type: Boolean,
      default: false
    },
    confirmedAt: Date,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Cost
  cost: {
    labor: {
      type: Number,
      default: 0
    },
    materials: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  
  // Timeline
  startedAt: Date,
  completedAt: Date,
  
  // Admin Review
  adminReview: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  
  // Client Feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
     imageNumber: Number, 
    image: String, 
    cloudinaryId: String, 
    submittedAt: Date
  },
  
  // Invoice
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ client: 1, status: 1 });
taskSchema.index({ worker: 1, status: 1 });
taskSchema.index({ site: 1, section: 1 }); // ✅ New index
taskSchema.index({ branch: 1, status: 1 });
taskSchema.index({ scheduledDate: 1 });
taskSchema.index({ status: 1, priority: 1 });

// Calculate actual duration when task is completed
taskSchema.pre('save', function(next) {
  if (this.startedAt && this.completedAt) {
    const duration = (this.completedAt - this.startedAt) / (1000 * 60 * 60);
    this.actualDuration = Math.round(duration * 100) / 100;
  }
  
  // Calculate total cost
  this.cost.total = this.cost.labor + this.cost.materials;
  
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task;