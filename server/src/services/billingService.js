import crypto from 'crypto';
import { config } from '../config/index.js';
import { Subscription } from '../models/Subscription.js';
import { Payment } from '../models/Payment.js';
import { WebhookEvent } from '../models/WebhookEvent.js';
import { User } from '../models/User.js';

export const PLANS = {
  free: {
    id: 'free',
    name: 'FinPilot Free',
    pricePaise: 0,
    interval: 'lifetime',
    features: [
      'Core income and expense tracking',
      'Basic dashboard and tracked cash summary',
      'Up to 3 savings goals',
      'Up to 5 category budgets',
      'Basic charts and transaction filters'
    ]
  },
  premium_monthly: {
    id: 'premium_monthly',
    name: 'FinPilot Premium Monthly',
    pricePaise: 9900, // ₹99.00
    interval: 'month',
    features: [
      'Unlimited savings goals & advanced projections',
      'Loan & EMI amortization schedules & tracking',
      'Investment portfolio & asset allocation',
      'Insurance policies & renewal alerts',
      'AI Financial Analyst with personalized insights',
      'Advanced reports & CSV exports',
      'Priority reminders'
    ]
  },
  premium_yearly: {
    id: 'premium_yearly',
    name: 'FinPilot Premium Yearly',
    pricePaise: 79900, // ₹799.00 (Save ~33%)
    interval: 'year',
    features: [
      'Everything in Premium Monthly',
      'Best value — 2 months free equivalent',
      'Early access to new AI financial models'
    ]
  }
};

function resolvePlan(planId) {
  if (!planId) return PLANS.premium_monthly;
  if (PLANS[planId]) return PLANS[planId];
  if (planId === 'pro_annual' || planId === 'yearly' || planId === 'annual') return PLANS.premium_yearly;
  if (planId === 'pro_monthly' || planId === 'monthly') return PLANS.premium_monthly;
  return null;
}

/**
 * Create an order for checkout.
 * If mock mode is enabled or test mode without live keys, returns mock order.
 */
export async function createBillingOrder({ userId, planId }) {
  const plan = resolvePlan(planId);
  if (!plan || plan.pricePaise === 0) {
    throw new Error('Invalid plan selected for checkout');
  }

  const receiptNumber = `rcpt_${userId.toString().slice(-6)}_${Date.now().toString().slice(-6)}`;
  const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;

  const payment = await Payment.create({
    userId,
    razorpayOrderId: orderId,
    amountPaise: plan.pricePaise,
    currency: 'INR',
    status: 'created',
    receiptNumber
  });

  return {
    orderId,
    amountPaise: plan.pricePaise,
    currency: 'INR',
    receiptNumber,
    keyId: config.RAZORPAY_KEY_ID,
    planName: plan.name,
    isMock: config.ENABLE_MOCK_PAYMENTS
  };
}

/**
 * Verify payment signature and activate subscription.
 */
export async function verifyAndActivateSubscription({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  planId
}) {
  const plan = resolvePlan(planId) || PLANS.premium_monthly;
  if (!plan) {
    throw new Error('Invalid plan specified');
  }

  const payment = await Payment.findOne({ razorpayOrderId, userId });
  if (!payment) {
    throw new Error('Order not found');
  }

  if (payment.status === 'captured') {
    // Already processed idempotently
    return { alreadyActivated: true };
  }

  // Signature verification
  if (!config.ENABLE_MOCK_PAYMENTS) {
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      payment.status = 'failed';
      payment.errorMessage = 'Invalid payment signature';
      await payment.save();
      throw new Error('Payment signature verification failed');
    }
  }

  // Update payment status
  payment.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
  payment.razorpaySignature = razorpaySignature || 'mock_signature';
  payment.status = 'captured';
  await payment.save();

  // Compute period end
  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  if (plan.interval === 'month') {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else if (plan.interval === 'year') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  // Activate or update subscription
  let subscription = await Subscription.findOne({ userId });
  if (subscription) {
    subscription.planId = plan.id;
    subscription.status = 'active';
    subscription.currentPeriodStart = periodStart;
    subscription.currentPeriodEnd = periodEnd;
    subscription.lastPaymentId = payment._id;
    await subscription.save();
  } else {
    subscription = await Subscription.create({
      userId,
      planId: plan.id,
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      lastPaymentId: payment._id
    });
  }

  // Update user plan
  await User.findByIdAndUpdate(userId, {
    plan: 'premium',
    subscriptionId: subscription._id
  });

  return { subscription, payment };
}

/**
 * Handle incoming webhooks idempotently
 */
export async function handleRazorpayWebhook({ eventId, eventType, rawBody, signature, payload }) {
  // Idempotency check: check if event was already processed
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent && existingEvent.status === 'processed') {
    return { status: 'already_processed' };
  }

  // Verify webhook signature if secret configured and not mock
  if (!config.ENABLE_MOCK_PAYMENTS && config.RAZORPAY_WEBHOOK_SECRET) {
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid webhook signature');
    }
  }

  const webhookRecord = existingEvent || await WebhookEvent.create({
    eventId,
    eventType,
    provider: 'razorpay',
    payload,
    status: 'received'
  });

  try {
    if (eventType === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'captured') {
        payment.status = 'captured';
        payment.razorpayPaymentId = paymentEntity.id;
        await payment.save();
      }
    } else if (eventType === 'subscription.cancelled') {
      const subEntity = payload.subscription.entity;
      const sub = await Subscription.findOne({ razorpaySubscriptionId: subEntity.id });
      if (sub) {
        sub.status = 'cancelled';
        await sub.save();
        await User.findByIdAndUpdate(sub.userId, { plan: 'free' });
      }
    }

    webhookRecord.status = 'processed';
    webhookRecord.processedAt = new Date();
    await webhookRecord.save();

    return { status: 'success' };
  } catch (err) {
    webhookRecord.status = 'failed';
    webhookRecord.errorMessage = err.message;
    await webhookRecord.save();
    throw err;
  }
}
