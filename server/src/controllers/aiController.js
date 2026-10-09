import { z } from 'zod';
import { AIConversation } from '../models/AIConversation.js';
import { AIMessage } from '../models/AIMessage.js';
import { processFinancialQuery } from '../services/aiService.js';

export const aiChatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required').max(1000),
    conversationId: z.string().optional().nullable()
  })
});

export const STARTER_PROMPTS = [
  {
    id: 'affordability_phone',
    title: 'Check Purchase Affordability',
    prompt: 'Can I afford a ₹75,000 phone in 3 months?'
  },
  {
    id: 'invest_surplus',
    title: 'Surplus Investment Options',
    prompt: 'I have ₹75,000 savings, where should I invest in India?'
  },
  {
    id: 'monthly_summary',
    title: 'Monthly Cash Flow Review',
    prompt: 'How is my financial cash flow looking this month?'
  },
  {
    id: 'emergency_buffer',
    title: 'Emergency Reserve Check',
    prompt: 'How much emergency fund do I need based on my expenses?'
  }
];

export async function getStarterPrompts(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      prompts: STARTER_PROMPTS
    }
  });
}

export async function getConversations(req, res, next) {
  try {
    const conversations = await AIConversation.find({ userId: req.userId }).sort({ updatedAt: -1 }).limit(20);
    return res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (err) {
    next(err);
  }
}

export async function getConversationMessages(req, res, next) {
  try {
    const conversation = await AIConversation.findOne({ _id: req.params.id, userId: req.userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found' }
      });
    }

    const messages = await AIMessage.find({ conversationId: conversation._id, userId: req.userId }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: {
        conversation,
        messages
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function sendChatMessage(req, res, next) {
  try {
    const { message, conversationId } = req.body;

    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId: req.userId });
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        userId: req.userId,
        title: message.slice(0, 40) + (message.length > 40 ? '...' : '')
      });
    }

    // Save user message
    const userMsg = await AIMessage.create({
      conversationId: conversation._id,
      userId: req.userId,
      role: 'user',
      content: message
    });

    // Process deterministic financial AI answer
    const aiResult = await processFinancialQuery({
      userId: req.userId,
      prompt: message
    });

    // Save assistant response
    const assistantMsg = await AIMessage.create({
      conversationId: conversation._id,
      userId: req.userId,
      role: 'assistant',
      content: aiResult.content,
      intent: aiResult.intent,
      structuredData: aiResult.structuredData,
      providerMeta: aiResult.providerMeta
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        userMessage: userMsg,
        assistantMessage: assistantMsg
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const conversation = await AIConversation.findOne({ _id: req.params.id, userId: req.userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found' }
      });
    }

    await Promise.all([
      AIConversation.deleteOne({ _id: conversation._id }),
      AIMessage.deleteMany({ conversationId: conversation._id })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Conversation and message history deleted'
    });
  } catch (err) {
    next(err);
  }
}
