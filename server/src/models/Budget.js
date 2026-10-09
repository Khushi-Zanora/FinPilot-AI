import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Budget amount must be an integer (in paise)'
      }
    },
    period: {
      type: String,
      enum: ['monthly', 'weekly', 'yearly'],
      default: 'monthly'
    },
    month: {
      type: Number, // 1 - 12
      default: null
    },
    year: {
      type: Number,
      default: null
    },
    alertThresholdPercent: {
      type: Number,
      default: 80,
      min: 1,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 });

export const Budget = mongoose.model('Budget', budgetSchema);
