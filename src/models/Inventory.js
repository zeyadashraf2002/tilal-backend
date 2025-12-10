// backend/src/models/Inventory.js - ✅ SIMPLIFIED
import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'liter', 'piece'], // ✅ Only 3 units
    default: 'piece'
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  quantity: {
    current: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    minimum: {
      type: Number,
      required: true,
      default: 10
    }
    // ❌ REMOVED: maximum
  },
  description: {
    type: String,
    maxlength: 500
  },
  lastRestocked: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Low stock alert
  lowStockAlert: {
    enabled: {
      type: Boolean,
      default: true
    },
    lastAlertSent: Date
  }
  
  // ❌ REMOVED FIELDS:
  // - sku
  // - category
  // - price { cost, selling }
  // - supplier { name, contact, email }
  // - expiryDate
  
}, {
  timestamps: true
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.quantity.current === 0) return 'out-of-stock';
  if (this.quantity.current <= this.quantity.minimum) return 'low-stock';
  return 'in-stock';
});

// Method to deduct quantity
inventorySchema.methods.deduct = async function(amount) {
  if (this.quantity.current < amount) {
    throw new Error('Insufficient stock');
  }
  this.quantity.current -= amount;
  return await this.save();
};

// Method to add quantity
inventorySchema.methods.restock = async function(amount) {
  this.quantity.current += amount;
  this.lastRestocked = new Date();
  return await this.save();
};

// Indexes
inventorySchema.index({ branch: 1 });
inventorySchema.index({ name: 'text' });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;