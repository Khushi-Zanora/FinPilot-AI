import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    emailAlerts: {
      type: Boolean,
      default: true
    },
    upcomingBillReminders: {
      type: Boolean,
      default: true
    },
    loanEmiReminders: {
      type: Boolean,
      default: true
    },
    budgetThresholdAlerts: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: false
    },
    reminderLeadDays: {
      type: Number,
      default: 3,
      min: 1,
      max: 14
    }
  },
  {
    timestamps: true
  }
);

export const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);
