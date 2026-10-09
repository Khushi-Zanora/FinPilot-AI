/**
 * Middleware to check if the authenticated user has premium plan access.
 * Server is the sole authority for access.
 */
export function requirePremium(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  if (req.user.plan !== 'premium') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'PLAN_LIMIT_EXCEEDED',
        message: 'This feature requires a FinPilot Premium subscription.',
        details: {
          requiredPlan: 'premium',
          currentPlan: req.user.plan,
          upgradeUrl: '/billing/upgrade'
        }
      }
    });
  }

  next();
}

/**
 * Check maximum goals limit for free tier users.
 */
export const FREE_TIER_MAX_GOALS = 3;
export const FREE_TIER_MAX_BUDGETS = 5;
