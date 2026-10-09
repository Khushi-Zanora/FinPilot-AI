import mongoose from 'mongoose';

const loanPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
      index: true
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    totalAmountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Payment amount must be an integer (in paise)'
      }
    },
    principalPaidPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Principal paid must be an integer (in paise)'
      }
    },
    interestPaidPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Interest paid must be an integer (in paise)'
      }
    },
    paymentType: {
      type: String,
      enum: ['regular_emi', 'prepayment', 'foreclosure'],
      default: 'regular_emi'
    },
    note: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

loanPaymentSchema.index({ loanId: 1, paymentDate: -1 });

export const LoanPayment = mongoose.model('LoanPayment', loanPaymentSchema);
