import { RecurringTransaction } from '../models/RecurringTransaction.js';
import { Transaction } from '../models/Transaction.js';
import { Account } from '../models/Account.js';

/**
 * Computes the next scheduled due date based on frequency and original start day.
 * Correctly handles variable month lengths (28, 29, 30, 31 days) and leap years.
 */
export function computeNextOccurrence(currentDate, frequency = 'monthly', originalDayOfMonth = null) {
  const d = new Date(currentDate);
  const targetDay = originalDayOfMonth || d.getDate();

  switch (frequency) {
    case 'daily': {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    }
    case 'weekly': {
      const next = new Date(d);
      next.setDate(next.getDate() + 7);
      return next;
    }
    case 'biweekly': {
      const next = new Date(d);
      next.setDate(next.getDate() + 14);
      return next;
    }
    case 'monthly': {
      const year = d.getFullYear();
      const nextMonth = d.getMonth() + 1;
      const lastDayOfNextMonth = new Date(year, nextMonth + 1, 0).getDate();
      const dayToSet = Math.min(targetDay, lastDayOfNextMonth);
      return new Date(year, nextMonth, dayToSet, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    }
    case 'quarterly': {
      const year = d.getFullYear();
      const nextQuarterMonth = d.getMonth() + 3;
      const lastDayOfQuarterMonth = new Date(year, nextQuarterMonth + 1, 0).getDate();
      const dayToSet = Math.min(targetDay, lastDayOfQuarterMonth);
      return new Date(year, nextQuarterMonth, dayToSet, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    }
    case 'yearly': {
      const nextYear = d.getFullYear() + 1;
      const month = d.getMonth();
      const lastDayOfYearMonth = new Date(nextYear, month + 1, 0).getDate();
      const dayToSet = Math.min(targetDay, lastDayOfYearMonth);
      return new Date(nextYear, month, dayToSet, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
    }
    default: {
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      return next;
    }
  }
}

/**
 * Evaluates and records any due recurring income and expense transactions.
 * Processes each missed due occurrence up to asOfDate in sequential order.
 * Ensures transaction creation is recorded before schedule advancement to prevent lost occurrences.
 *
 * @param {Object} options
 * @param {Date} [options.asOfDate=new Date()] The reference timestamp for evaluation
 * @param {string} [options.userId] Optional filter to process for a single user
 * @returns {Promise<{ processedCount: number, generatedTransactions: Array }>}
 */
export async function processDueRecurringTransactions({ asOfDate = new Date(), userId = null } = {}) {
  const query = {
    isActive: true,
    nextDueDate: { $lte: asOfDate }
  };

  if (userId) {
    query.userId = userId;
  }

  const dueRules = await RecurringTransaction.find(query);
  const generatedTransactions = [];

  for (const rule of dueRules) {
    // Process any due occurrences up to asOfDate (handles catch-up after server restart)
    while (rule.isActive && new Date(rule.nextDueDate) <= asOfDate) {
      if (rule.endDate && new Date(rule.nextDueDate) > new Date(rule.endDate)) {
        await RecurringTransaction.updateOne({ _id: rule._id }, { $set: { isActive: false } });
        rule.isActive = false;
        break;
      }

      // If accountId is specified, verify account still exists
      if (rule.accountId) {
        const account = await Account.findOne({ _id: rule.accountId, userId: rule.userId });
        if (!account) {
          console.warn(`[RecurringEngine] Skipping recurring rule ${rule._id}: Account ${rule.accountId} not found.`);
          break;
        }
      }

      const scheduledDate = new Date(rule.nextDueDate);
      const startDay = rule.startDate ? new Date(rule.startDate).getDate() : scheduledDate.getDate();
      const nextOccurrence = computeNextOccurrence(scheduledDate, rule.frequency, startDay);
      const shouldDeactivate = rule.endDate ? nextOccurrence > new Date(rule.endDate) : false;

      // Idempotency check: Ensure an exact transaction hasn't already been created for this schedule and occurrence date
      const existingTx = await Transaction.findOne({
        userId: rule.userId,
        'metadata.recurringScheduleId': rule._id,
        'metadata.scheduledDueDate': scheduledDate.toISOString()
      });

      if (existingTx) {
        // Occurrence already recorded; advance schedule safely
        await RecurringTransaction.updateOne(
          { _id: rule._id, nextDueDate: rule.nextDueDate },
          { $set: { nextDueDate: nextOccurrence, isActive: !shouldDeactivate } }
        );
        rule.nextDueDate = nextOccurrence;
        rule.isActive = !shouldDeactivate;
        continue;
      }

      // Create transaction record
      let tx;
      try {
        tx = await Transaction.create({
          userId: rule.userId,
          type: rule.type, // 'income' or 'expense'
          amountPaise: rule.amountPaise,
          accountId: rule.accountId || null,
          category: rule.category,
          description: rule.description || (rule.type === 'income' ? 'Recurring monthly income' : 'Recurring expense'),
          date: scheduledDate,
          isRecurring: true,
          metadata: {
            recurringScheduleId: rule._id,
            frequency: rule.frequency,
            scheduledDueDate: scheduledDate.toISOString()
          }
        });
      } catch (txErr) {
        console.error(`[RecurringEngine] Failed to create transaction for recurring rule ${rule._id}:`, txErr);
        break; // Do not advance schedule if transaction creation failed, allowing safe retry
      }

      // Advance schedule and record lastGeneratedDate
      await RecurringTransaction.updateOne(
        { _id: rule._id },
        {
          $set: {
            lastGeneratedDate: asOfDate,
            nextDueDate: nextOccurrence,
            isActive: !shouldDeactivate
          }
        }
      );

      rule.nextDueDate = nextOccurrence;
      rule.isActive = !shouldDeactivate;
      generatedTransactions.push(tx);
    }
  }

  return {
    processedCount: generatedTransactions.length,
    generatedTransactions
  };
}
