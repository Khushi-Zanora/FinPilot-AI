import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer', 'goal_contribution', 'loan_payment', 'investment_buy'],
      required: true,
      index: true
    },
    amountPaise: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1 paisa'],
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be an integer (in paise)'
      }
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true
    },
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
      validate: {
        validator: function (val) {
          if (this.type === 'transfer' && !val) {
            return false;
          }
          return true;
        },
        message: 'Destination account is required for transfers'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    tags: [{
      type: String,
      trim: true
    }],
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTransaction',
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, accountId: 1, date: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
