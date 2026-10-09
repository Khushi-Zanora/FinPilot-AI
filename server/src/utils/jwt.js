import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const COOKIE_NAME = 'finpilot_session';

export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function setAuthCookie(res, token) {
  const isProduction = config.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function clearAuthCookie(res) {
  const isProduction = config.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  });
}
