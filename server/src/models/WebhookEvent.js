import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      index: true
    },
    provider: {
      type: String,
      default: 'razorpay'
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ['received', 'processed', 'failed', 'ignored'],
      default: 'received'
    },
    processedAt: {
      type: Date,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);
