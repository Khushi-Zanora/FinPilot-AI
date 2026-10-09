import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assetType: {
      type: String,
      enum: ['mutual_fund', 'equity_stock', 'etf', 'fixed_deposit', 'recurring_deposit', 'gold_sgb', 'govt_securities', 'crypto', 'other'],
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true
    },
    symbol: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    units: {
      type: Number,
      required: true,
      min: 0.0001
    },
    averageBuyPricePaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Average buy price must be an integer (in paise)'
      }
    },
    totalInvestedPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Total invested must be an integer (in paise)'
      }
    },
    currentNavPricePaise: {
      type: Number,
      default: null
    },
    currentValuationPaise: {
      type: Number,
      default: null
    },
    valuationSource: {
      type: String,
      enum: ['manual_entry', 'mock_provider', 'verified_feed'],
      default: 'manual_entry'
    },
    lastValuationDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

investmentSchema.index({ userId: 1, assetType: 1 });

export const Investment = mongoose.model('Investment', investmentSchema);
