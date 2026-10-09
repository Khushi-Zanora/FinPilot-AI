import mongoose from 'mongoose';

const insurancePolicySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    policyType: {
      type: String,
      enum: ['term_life', 'health', 'motor_vehicle', 'home', 'travel', 'critical_illness', 'other'],
      required: true
    },
    providerName: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true
    },
    policyNumberMasked: {
      type: String,
      trim: true,
      default: '' // Stored masked (e.g. *******1234) for privacy
    },
    premiumAmountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Premium amount must be an integer (in paise)'
      }
    },
    premiumFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'half_yearly', 'yearly', 'single'],
      default: 'yearly'
    },
    sumInsuredPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Sum insured must be an integer (in paise)'
      }
    },
    startDate: {
      type: Date,
      required: true
    },
    renewalDate: {
      type: Date,
      required: true,
      index: true
    },
    maturityDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'grace_period', 'lapsed', 'matured', 'surrendered'],
      default: 'active',
      index: true
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

insurancePolicySchema.index({ userId: 1, renewalDate: 1 });

export const InsurancePolicy = mongoose.model('InsurancePolicy', insurancePolicySchema);
