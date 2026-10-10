import { z } from 'zod';
import { AIConversation } from '../models/AIConversation.js';
import { AIMessage } from '../models/AIMessage.js';
import { processFinancialQuery } from '../services/aiService.js';

export const aiChatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required').max(1000).optional(),
    query: z.string().min(1, 'Query is required').max(1000).optional(),
    conversationId: z.string().optional().nullable()
  }).refine((d) => d.message || d.query, {
    message: 'Either message or query is required',
    path: ['message']
  })
});

export const STARTER_PROMPTS = [
  {
    id: 'monthly_spending',
    title: 'Spending Breakdown',
    prompt: 'How much did I spend this month?'
  },
  {
    id: 'biggest_expenses',
    title: 'Biggest Expenses',
    prompt: 'What were my biggest expenses?'
  },
  {
    id: 'monthly_income',
    title: 'Income Received',
    prompt: 'How much money did I receive this month?'
  },
  {
    id: 'monthly_savings',
    title: 'Savings Overview',
    prompt: 'How much did I save this month?'
  },
  {
    id: 'budget_status',
    title: 'Budget Limits',
    prompt: 'Am I staying within my budgets?'
  },
  {
    id: 'goal_savings',
    title: 'Goal Targets',
    prompt: 'How much do I need to save each month to reach my goal?'
  },
  {
    id: 'affordability_phone',
    title: 'Purchase Affordability',
    prompt: 'Can I afford a purchase of ₹75,000 in three months?'
  },
  {
    id: 'upcoming_recurring',
    title: 'Upcoming Income & Bills',
    prompt: 'What recurring income and bills are coming up?'
  },
  {
    id: 'invest_options',
    title: 'Investment Guide (India)',
    prompt: 'Give me general information about investment options in India.'
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
    const userPrompt = req.body.message || req.body.query;
    const { conversationId } = req.body;

    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId: req.userId });
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        userId: req.userId,
        title: userPrompt.slice(0, 40) + (userPrompt.length > 40 ? '...' : '')
      });
    }

    // Save user message
    const userMsg = await AIMessage.create({
      conversationId: conversation._id,
      userId: req.userId,
      role: 'user',
      content: userPrompt
    });

    // Process genuine Gemini financial AI query grounded in verified records
    const aiResult = await processFinancialQuery({
      userId: req.userId,
      prompt: userPrompt,
      correlationId: req.correlationId
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
        assistantMessage: assistantMsg,
        answer: aiResult.content,
        response: aiResult.content,
        intent: aiResult.intent,
        structuredData: aiResult.structuredData,
        providerMeta: aiResult.providerMeta,
        correlationId: req.correlationId
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
