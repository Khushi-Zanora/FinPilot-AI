import { z } from 'zod';
import { Investment } from '../models/Investment.js';

export const createInvestmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Asset name is required').max(100),
    assetType: z.string().optional(),
    assetClass: z.string().optional(),
    symbol: z.string().max(20).optional().default(''),
    units: z.number().positive().optional(),
    quantity: z.number().positive().optional(),
    averageBuyPricePaise: z.number().int().min(1).optional(),
    buyPricePaise: z.number().int().min(1).optional(),
    currentNavPricePaise: z.number().int().min(1).optional().nullable(),
    currentPricePaise: z.number().int().min(1).optional().nullable(),
    notes: z.string().max(300).optional().default('')
  }).refine((data) => (data.averageBuyPricePaise || data.buyPricePaise) && (data.units || data.quantity), {
    message: 'Units/Quantity and Buy Price are required',
    path: ['averageBuyPricePaise']
  })
});

export const updateInvestmentSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    units: z.number().positive().optional(),
    quantity: z.number().positive().optional(),
    averageBuyPricePaise: z.number().int().min(1).optional(),
    buyPricePaise: z.number().int().min(1).optional(),
    currentNavPricePaise: z.number().int().min(1).optional().nullable(),
    currentPricePaise: z.number().int().min(1).optional().nullable(),
    notes: z.string().max(300).optional()
  })
});

export async function getInvestments(req, res, next) {
  try {
    const holdings = await Investment.find({ userId: req.userId }).sort({ totalInvestedPaise: -1 });

    const totalInvestedPaise = holdings.reduce((acc, h) => acc + h.totalInvestedPaise, 0);
    
    // Total valuation uses currentNavPricePaise if recorded, else totalInvestedPaise (cost basis)
    const totalCurrentValuationPaise = holdings.reduce((acc, h) => {
      if (h.currentNavPricePaise) {
        return acc + Math.round(h.units * h.currentNavPricePaise);
      }
      return acc + h.totalInvestedPaise;
    }, 0);

    // Group allocation by assetType
    const allocationMap = {};
    holdings.forEach((h) => {
      const val = h.currentNavPricePaise ? Math.round(h.units * h.currentNavPricePaise) : h.totalInvestedPaise;
      allocationMap[h.assetType] = (allocationMap[h.assetType] || 0) + val;
    });

    const assetAllocation = Object.keys(allocationMap).map((type) => ({
      assetType: type,
      totalPaise: allocationMap[type],
      percentage: totalCurrentValuationPaise > 0
        ? Number(((allocationMap[type] / totalCurrentValuationPaise) * 100).toFixed(1))
        : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        holdings,
        summary: {
          totalInvestedPaise,
          totalCurrentValuationPaise,
          unrealizedGainLossPaise: totalCurrentValuationPaise - totalInvestedPaise,
          assetAllocation,
          valuationDisclaimer: 'Holdings and valuations reflect user-entered purchase prices and manual valuations.'
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function createInvestment(req, res, next) {
  try {
    const assetType = req.body.assetType || req.body.assetClass || 'mutual_fund';
    const units = req.body.units || req.body.quantity || 1;
    const averageBuyPricePaise = req.body.averageBuyPricePaise || req.body.buyPricePaise;
    const currentNavPricePaise = req.body.currentNavPricePaise || req.body.currentPricePaise || averageBuyPricePaise;

    const totalInvestedPaise = Math.round(units * averageBuyPricePaise);
    const currentValuationPaise = currentNavPricePaise ? Math.round(units * currentNavPricePaise) : totalInvestedPaise;

    const investment = await Investment.create({
      name: req.body.name,
      symbol: req.body.symbol || '',
      assetType,
      units,
      averageBuyPricePaise,
      currentNavPricePaise,
      notes: req.body.notes || '',
      userId: req.userId,
      totalInvestedPaise,
      currentValuationPaise,
      valuationSource: 'manual_entry'
    });

    return res.status(201).json({
      success: true,
      message: 'Investment holding added successfully',
      data: { investment }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateInvestment(req, res, next) {
  try {
    const existing = await Investment.findOne({ _id: req.params.id, userId: req.userId });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Investment holding not found' }
      });
    }

    const units = req.body.units !== undefined ? req.body.units : existing.units;
    const buyPrice = req.body.averageBuyPricePaise !== undefined ? req.body.averageBuyPricePaise : existing.averageBuyPricePaise;
    const navPrice = req.body.currentNavPricePaise !== undefined ? req.body.currentNavPricePaise : existing.currentNavPricePaise;

    const totalInvestedPaise = Math.round(units * buyPrice);
    const currentValuationPaise = navPrice ? Math.round(units * navPrice) : totalInvestedPaise;

    const updated = await Investment.findByIdAndUpdate(
      existing._id,
      {
        $set: {
          ...req.body,
          totalInvestedPaise,
          currentValuationPaise,
          lastValuationDate: new Date()
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Investment updated successfully',
      data: { investment: updated }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteInvestment(req, res, next) {
  try {
    const result = await Investment.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Investment holding not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Investment holding removed'
    });
  } catch (err) {
    next(err);
  }
}
