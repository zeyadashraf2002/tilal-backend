import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['withdrawal', 'return', 'restock', 'adjustment'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
inventoryTransactionSchema.index({ inventory: 1, createdAt: -1 });
inventoryTransactionSchema.index({ worker: 1, createdAt: -1 });
inventoryTransactionSchema.index({ task: 1 });
inventoryTransactionSchema.index({ type: 1 });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;

