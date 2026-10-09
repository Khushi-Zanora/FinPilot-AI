import mongoose from 'mongoose';

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be an integer (in paise)'
      }
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      required: true,
      default: 'monthly'
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    nextDueDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastGeneratedDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

recurringTransactionSchema.index({ userId: 1, nextDueDate: 1, isActive: 1 });

export const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);
