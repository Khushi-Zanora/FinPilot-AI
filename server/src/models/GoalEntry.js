import mongoose from 'mongoose';

const goalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['contribution', 'withdrawal'],
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
    note: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

goalEntrySchema.index({ goalId: 1, date: -1 });

export const GoalEntry = mongoose.model('GoalEntry', goalEntrySchema);
