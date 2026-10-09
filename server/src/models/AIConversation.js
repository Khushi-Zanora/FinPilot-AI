import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'New Financial Analysis'
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

aiConversationSchema.index({ userId: 1, updatedAt: -1 });

export const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
