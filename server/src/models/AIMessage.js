import mongoose from 'mongoose';

const aiMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIConversation',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    intent: {
      type: String,
      default: 'general_query'
    },
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    providerMeta: {
      provider: { type: String, default: 'mock' },
      tokensUsed: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

aiMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const AIMessage = mongoose.model('AIMessage', aiMessageSchema);
