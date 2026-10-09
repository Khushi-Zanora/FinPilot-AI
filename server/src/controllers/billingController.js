import { z } from 'zod';
import {
  PLANS,
  createBillingOrder,
  verifyAndActivateSubscription,
  handleRazorpayWebhook
} from '../services/billingService.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';

export const createOrderSchema = z.object({
  body: z.object({
    planId: z.enum(['premium_monthly', 'premium_yearly'])
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().optional().default(''),
    razorpaySignature: z.string().optional().default(''),
    planId: z.enum(['premium_monthly', 'premium_yearly'])
  })
});

export async function getPlans(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      plans: Object.values(PLANS)
    }
  });
}

export async function getSubscription(req, res, next) {
  try {
    const subscription = await Subscription.findOne({ userId: req.userId }).populate('lastPaymentId');
    return res.status(200).json({
      success: true,
      data: {
        plan: req.user.plan,
        subscription
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    const { planId } = req.body;
    const orderData = await createBillingOrder({
      userId: req.userId,
      planId
    });

    return res.status(200).json({
      success: true,
      data: orderData
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = req.body;
    const result = await verifyAndActivateSubscription({
      userId: req.userId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      planId
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription activated successfully! Welcome to FinPilot Premium.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelSubscription(req, res, next) {
  try {
    const subscription = await Subscription.findOne({ userId: req.userId, status: 'active' });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No active subscription found' }
      });
    }

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription will not renew at the end of the current billing cycle.'
    });
  } catch (err) {
    next(err);
  }
}

export async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const event = req.body;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await handleRazorpayWebhook({
      eventId: event.id || `evt_${Date.now()}`,
      eventType: event.event || 'payment.captured',
      rawBody,
      signature,
      payload: event.payload || event
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(400).json({ success: false, error: { message: err.message } });
  }
}
