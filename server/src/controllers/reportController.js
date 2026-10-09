import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';
import { toMajorUnits, calculateNetCashFlow } from '../services/financeEngine.js';

/**
 * Sanitize a field to prevent CSV Formula Injection (CWE-1236)
 */
function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=\+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  // Escape double quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function getReportsSummary(req, res, next) {
  try {
    const rawUserId = req.userId || req.user?._id;
    const userObjId = mongoose.Types.ObjectId.isValid(rawUserId) ? new mongoose.Types.ObjectId(rawUserId) : rawUserId;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchQuery = { userId: userObjId };
    if (startDate || endDate) matchQuery.date = dateFilter;

    const [totalsAgg, countAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$type',
            totalPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 }
          }
        }
      ]),
      Transaction.countDocuments(matchQuery)
    ]);

    let incomePaise = 0;
    let expensePaise = 0;
    let transferPaise = 0;

    totalsAgg.forEach((t) => {
      if (t._id === 'income') incomePaise = t.totalPaise;
      if (t._id === 'expense') expensePaise = t.totalPaise;
      if (t._id === 'transfer') transferPaise = t.totalPaise;
    });

    const netCashFlowPaise = calculateNetCashFlow({ incomePaise, expensePaise });

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          incomePaise,
          expensePaise,
          transferPaise,
          netCashFlowPaise,
          transactionCount: countAgg,
          savingsRate: incomePaise > 0 ? Math.max(0, ((incomePaise - expensePaise) / incomePaise) * 100).toFixed(1) : 0
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getReportsCategories(req, res, next) {
  try {
    const rawUserId = req.userId || req.user?._id;
    const userObjId = mongoose.Types.ObjectId.isValid(rawUserId) ? new mongoose.Types.ObjectId(rawUserId) : rawUserId;
    const { startDate, endDate, type = 'expense' } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchQuery = { userId: userObjId, type };
    if (startDate || endDate) matchQuery.date = dateFilter;

    const agg = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalPaise: { $sum: '$amountPaise' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalPaise: -1 } }
    ]);

    const grandTotalPaise = agg.reduce((acc, c) => acc + c.totalPaise, 0);

    const categories = agg.map((c) => ({
      name: c._id || 'Uncategorized',
      totalPaise: c.totalPaise,
      count: c.count,
      percent: grandTotalPaise > 0 ? ((c.totalPaise / grandTotalPaise) * 100).toFixed(1) : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        grandTotalPaise,
        categories
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function exportTransactionsCsv(req, res, next) {
  try {
    const { startDate, endDate, type, category } = req.query;
    const query = { userId: req.userId };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('accountId', 'name')
      .populate('toAccountId', 'name')
      .sort({ date: -1 })
      .limit(5000); // Guard max rows

    const headers = ['Date', 'Type', 'Account', 'Destination Account', 'Category', 'Amount (INR)', 'Description', 'Tags'];
    const rows = [headers.join(',')];

    for (const t of transactions) {
      const dateStr = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
      const amountRupees = toMajorUnits(t.amountPaise).toFixed(2);
      const accountName = t.accountId?.name || '';
      const toAccountName = t.toAccountId?.name || '';
      const tagsStr = (t.tags || []).join('; ');

      const row = [
        sanitizeCsvCell(dateStr),
        sanitizeCsvCell(t.type),
        sanitizeCsvCell(accountName),
        sanitizeCsvCell(toAccountName),
        sanitizeCsvCell(t.category),
        sanitizeCsvCell(amountRupees),
        sanitizeCsvCell(t.description),
        sanitizeCsvCell(tagsStr)
      ];

      rows.push(row.join(','));
    }

    const csvContent = rows.join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="finpilot-transactions-${new Date().toISOString().split('T')[0]}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
}
