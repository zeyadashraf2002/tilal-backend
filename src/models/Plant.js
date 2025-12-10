// backend/src/models/Plant.js - FIXED
import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
  name: {
    ar: {
      type: String,
      required: [true, 'Arabic name is required'],
      trim: true
    },
    en: {
      type: String,
      required: [true, 'English name is required'],
      trim: true
    },
    bn: {
      type: String,
      trim: true
    }
  },
  scientificName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    // ✅ FIXED: Changed 'flowers' to 'flower'
    enum: ['flower', 'tree', 'shrub', 'grass', 'succulent', 'herb', 'vegetable', 'fruit', 'other'],
    default: 'other'
  },
  description: {
    ar: {
      type: String,
      maxlength: 2000
    },
    en: {
      type: String,
      maxlength: 2000
    },
    bn: {
      type: String,
      maxlength: 2000
    }
  },
  image: {
    type: String,
    default: null
  },
  cloudinaryId: {
    type: String,
    default: null
  },
  careInstructions: {
    watering: {
      type: String,
      default: ''
    },
    sunlight: {
      type: String,
      default: ''
    },
    soil: {
      type: String,
      default: ''
    },
    temperature: {
      type: String,
      default: ''
    }
  },
  growthRate: {
    type: String,
    enum: ['slow', 'moderate', 'fast'],
    default: 'moderate'
  },
  seasonality: {
    type: [String],
    enum: ['spring', 'summer', 'fall', 'winter', 'year-round'],
    default: ['year-round']
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    enum: ['piece', 'pot', 'kg', 'bundle', 'meter'],
    default: 'piece'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  timesUsed: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

plantSchema.index({ 'name.ar': 'text', 'name.en': 'text', 'name.bn': 'text' });
plantSchema.index({ category: 1 });
plantSchema.index({ isActive: 1 });

plantSchema.methods.getLocalizedName = function(language = 'en') {
  return this.name[language] || this.name.en || this.name.ar;
};

plantSchema.methods.getLocalizedDescription = function(language = 'en') {
  return this.description[language] || this.description.en || this.description.ar || '';
};

const Plant = mongoose.model('Plant', plantSchema);

export default Plant;