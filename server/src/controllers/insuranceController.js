import { z } from 'zod';
import { InsurancePolicy } from '../models/InsurancePolicy.js';

export const createPolicySchema = z.object({
  body: z.object({
    policyType: z.enum(['term_life', 'health', 'motor_vehicle', 'home', 'travel', 'critical_illness', 'other']),
    providerName: z.string().min(1, 'Provider name is required').max(100),
    policyNumberMasked: z.string().max(50).optional().default(''),
    premiumAmountPaise: z.number().int().min(1, 'Premium must be at least 1 paisa'),
    premiumFrequency: z.enum(['monthly', 'quarterly', 'half_yearly', 'yearly', 'single']).default('yearly'),
    sumInsuredPaise: z.number().int().min(0).default(0),
    startDate: z.string().datetime().optional().default(() => new Date().toISOString()),
    renewalDate: z.string().datetime(),
    notes: z.string().max(300).optional().default('')
  })
});

export const updatePolicySchema = z.object({
  body: z.object({
    providerName: z.string().min(1).max(100).optional(),
    premiumAmountPaise: z.number().int().min(1).optional(),
    sumInsuredPaise: z.number().int().min(0).optional(),
    renewalDate: z.string().datetime().optional(),
    status: z.enum(['active', 'grace_period', 'lapsed', 'matured', 'surrendered']).optional(),
    notes: z.string().max(300).optional()
  })
});

export async function getPolicies(req, res, next) {
  try {
    const policies = await InsurancePolicy.find({ userId: req.userId }).sort({ renewalDate: 1 });

    const totalSumInsuredPaise = policies.reduce((acc, p) => p.status === 'active' ? acc + p.sumInsuredPaise : acc, 0);
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
        policies,
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
    const policy = await InsurancePolicy.create({
      ...req.body,
      userId: req.userId
    });

    return res.status(201).json({
      success: true,
      message: 'Insurance policy added successfully',
      data: { policy }
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
