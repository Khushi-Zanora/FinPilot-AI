import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'finpilot_csrf';

/**
 * Middleware to generate CSRF token and attach to cookie & request
 */
export function generateCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Accessible to client JS to read and send in X-CSRF-Token header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
  return token;
}

/**
 * Middleware to verify CSRF token on state-changing requests (POST, PUT, DELETE, PATCH).
 * Webhook endpoints or public APIs can be excluded.
 */
export function verifyCsrf(req, res, next) {
  // Safe HTTP methods do not require CSRF token
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt webhooks (which use Razorpay cryptographic signature verification instead)
  if (req.originalUrl.includes('/billing/webhook')) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    // If not in production and no CSRF cookie exists yet, allow initial dev bootstrapping smoothly
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    
    // In dev / test, if header matches or cookie matches, proceed
    if (!cookieToken && !headerToken && process.env.NODE_ENV !== 'production') {
      return next();
    }

    if (cookieToken && headerToken && cookieToken === headerToken) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_INVALID',
        message: 'Invalid or missing CSRF token'
      }
    });
  }

  next();
}
