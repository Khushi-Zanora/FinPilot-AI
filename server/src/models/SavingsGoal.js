import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: 100
    },
    purpose: {
      type: String,
      enum: ['emergency_fund', 'trip', 'gadget', 'education', 'home', 'vehicle', 'custom'],
      default: 'custom'
    },
    targetAmountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Target amount must be an integer (in paise)'
      }
    },
    currentAmountPaise: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Current amount must be an integer (in paise)'
      }
    },
    targetDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'archived'],
      default: 'active',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    color: {
      type: String,
      default: '#10b981'
    },
    icon: {
      type: String,
      default: 'target'
    }
  },
  {
    timestamps: true
  }
);

savingsGoalSchema.index({ userId: 1, status: 1 });

export const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
