import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    planId: {
      type: String,
      enum: ['free', 'premium_monthly', 'premium_yearly'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'cancelled', 'expired', 'trialing', 'pending'],
      default: 'active',
      index: true
    },
    currentPeriodStart: {
      type: Date,
      required: true,
      default: Date.now
    },
    currentPeriodEnd: {
      type: Date,
      required: true
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    razorpaySubscriptionId: {
      type: String,
      default: null,
      index: true
    },
    razorpayCustomerId: {
      type: String,
      default: null
    },
    lastPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    }
  },
  {
    timestamps: true
  }
);

subscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
