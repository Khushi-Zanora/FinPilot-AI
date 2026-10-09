import { verifyToken, COOKIE_NAME } from '../utils/jwt.js';
import { User } from '../models/User.js';

/**
 * Middleware to authenticate requests using HttpOnly session cookie or Bearer header.
 * Attaches req.user (sanitized) and req.userId to the request.
 */
export async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      req.user = null;
      req.userId = null;
      return next();
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    req.user = null;
    req.userId = null;
    next();
  }
}

/**
 * Middleware that strictly enforces authenticated session.
 */
export function requireAuth(req, res, next) {
  if (!req.user || !req.userId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource'
      }
    });
  }
  next();
}
