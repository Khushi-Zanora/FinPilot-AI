import { Transaction } from '../models/Transaction.js';
import { toMajorUnits } from '../services/financeEngine.js';

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
