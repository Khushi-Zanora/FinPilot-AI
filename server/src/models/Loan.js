import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Loan name is required'],
      trim: true,
      maxlength: 100
    },
    lender: {
      type: String,
      trim: true,
      default: ''
    },
    loanType: {
      type: String,
      enum: ['home', 'personal', 'auto', 'education', 'gold', 'credit_card_emi', 'other'],
      default: 'personal'
    },
    originalPrincipalPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Principal must be an integer (in paise)'
      }
    },
    annualInterestRatePercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    tenureMonths: {
      type: Number,
      required: true,
      min: 1
    },
    startDate: {
      type: Date,
      required: true
    },
    emiPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'EMI must be an integer (in paise)'
      }
    },
    remainingPrincipalPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Remaining principal must be an integer (in paise)'
      }
    },
    totalInterestPaise: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'refinanced'],
      default: 'active',
      index: true
    },
    nextDueDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

loanSchema.virtual('principalPaise').get(function () {
  return this.originalPrincipalPaise;
});

loanSchema.virtual('outstandingBalancePaise').get(function () {
  return this.remainingPrincipalPaise;
});

loanSchema.virtual('annualInterestRate').get(function () {
  return this.annualInterestRatePercent;
});

loanSchema.index({ userId: 1, status: 1 });

export const Loan = mongoose.model('Loan', loanSchema);
