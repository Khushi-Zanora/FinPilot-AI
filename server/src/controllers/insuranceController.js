import { z } from 'zod';
import { InsurancePolicy } from '../models/InsurancePolicy.js';

export const createPolicySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    providerName: z.string().optional(),
    provider: z.string().optional(),
    policyType: z.string().optional(),
    type: z.string().optional(),
    policyNumberMasked: z.string().max(50).optional(),
    policyNumber: z.string().max(50).optional(),
    premiumAmountPaise: z.number().int().min(0).optional().default(0),
    premiumFrequency: z.string().optional().default('annual'),
    sumInsuredPaise: z.number().int().min(0).optional(),
    sumAssuredPaise: z.number().int().min(0).optional(),
    startDate: z.string().datetime().optional().default(() => new Date().toISOString()),
    renewalDate: z.string().datetime().optional().nullable(),
    notes: z.string().max(300).optional().default('')
  })
});

export const updatePolicySchema = z.object({
  body: z.object({
    providerName: z.string().min(1).max(100).optional(),
    provider: z.string().optional(),
    premiumAmountPaise: z.number().int().min(1).optional(),
    sumInsuredPaise: z.number().int().min(0).optional(),
    sumAssuredPaise: z.number().int().min(0).optional(),
    renewalDate: z.string().datetime().optional(),
    status: z.enum(['active', 'grace_period', 'lapsed', 'matured', 'surrendered']).optional(),
    notes: z.string().max(300).optional()
  })
});

export async function getPolicies(req, res, next) {
  try {
    const policies = await InsurancePolicy.find({ userId: req.userId }).sort({ renewalDate: 1 });

    const totalSumInsuredPaise = policies.reduce((acc, p) => p.status === 'active' ? acc + (p.sumInsuredPaise || 0) : acc, 0);
    const totalAnnualizedPremiumsPaise = policies.reduce((acc, p) => {
      if (p.status !== 'active') return acc;
      let multiplier = 1;
      if (p.premiumFrequency === 'monthly') multiplier = 12;
      if (p.premiumFrequency === 'quarterly') multiplier = 4;
      if (p.premiumFrequency === 'half_yearly') multiplier = 2;
      return acc + (p.premiumAmountPaise * multiplier);
    }, 0);

    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const upcomingRenewalsCount = policies.filter(p => p.status === 'active' && p.renewalDate >= now && p.renewalDate <= in30Days).length;

    return res.status(200).json({
      success: true,
      data: {
        policies: policies.map(p => ({
          ...p.toObject(),
          name: p.providerName,
          type: p.policyType,
          provider: p.providerName,
          sumAssuredPaise: p.sumInsuredPaise
        })),
        summary: {
          totalPolicies: policies.length,
          totalSumInsuredPaise,
          totalAnnualizedPremiumsPaise,
          upcomingRenewalsCount
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createPolicy(req, res, next) {
  try {
    const providerName = req.body.name || req.body.providerName || req.body.provider || 'Insurance Provider';
    let policyType = req.body.policyType || req.body.type || 'health';
    if (!['term_life', 'health', 'motor_vehicle', 'home', 'travel', 'critical_illness', 'other'].includes(policyType)) {
      policyType = 'health';
    }
    let premiumFrequency = req.body.premiumFrequency || 'yearly';
    if (premiumFrequency === 'annual') premiumFrequency = 'yearly';

    const sumInsuredPaise = req.body.sumInsuredPaise !== undefined ? req.body.sumInsuredPaise : (req.body.sumAssuredPaise || 0);
    const policyNumberMasked = req.body.policyNumberMasked || req.body.policyNumber || '';
    const renewalDate = req.body.renewalDate ? new Date(req.body.renewalDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();

    const policy = await InsurancePolicy.create({
      providerName,
      policyType,
      policyNumberMasked,
      premiumAmountPaise: req.body.premiumAmountPaise,
      premiumFrequency,
      sumInsuredPaise,
      startDate,
      renewalDate,
      notes: req.body.notes || '',
      userId: req.userId
    });

    return res.status(201).json({
      success: true,
      message: 'Insurance policy added successfully',
      data: {
        policy: {
          ...policy.toObject(),
          name: policy.providerName,
          type: policy.policyType,
          provider: policy.providerName,
          sumAssuredPaise: policy.sumInsuredPaise
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePolicy(req, res, next) {
  try {
    const policy = await InsurancePolicy.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Insurance policy not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Insurance policy updated',
      data: { policy }
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePolicy(req, res, next) {
  try {
    const result = await InsurancePolicy.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Insurance policy not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Insurance policy deleted'
    });
  } catch (err) {
    next(err);
  }
}
