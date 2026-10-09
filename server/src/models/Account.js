import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: 100
    },
    type: {
      type: String,
      enum: ['bank', 'cash', 'wallet', 'credit_card', 'investment', 'other'],
      default: 'bank'
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    },
    openingBalancePaise: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Opening balance must be an integer (in paise)'
      }
    },
    color: {
      type: String,
      default: '#3b82f6'
    },
    icon: {
      type: String,
      default: 'wallet'
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

accountSchema.index({ userId: 1, isArchived: 1 });

export const Account = mongoose.model('Account', accountSchema);
