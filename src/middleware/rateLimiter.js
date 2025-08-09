import rateLimit from 'express-rate-limit';
import { APIError } from './errorHandler.js';

// Base rate limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for email verification resend
export const emailVerificationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // Limit each IP to 5 requests per day
  message: 'Maximum verification email requests reached. Please try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Use both IP and email for rate limiting
    return `${req.ip}-${req.body.email}`;
  },
});

// Middleware to enforce minimum time between email verification requests
export const emailCooldownMiddleware = () => {
  const cooldowns = new Map();
  const COOLDOWN_SECONDS = 60; // 60 seconds cooldown

  return (req, res, next) => {
    const key = `${req.ip}-${req.body.email}`;
    const now = Date.now();
    const lastAttempt = cooldowns.get(key);

    if (lastAttempt) {
      const timeElapsed = (now - lastAttempt) / 1000;
      if (timeElapsed < COOLDOWN_SECONDS) {
        throw new APIError(
          `Please wait ${Math.ceil(COOLDOWN_SECONDS - timeElapsed)} seconds before requesting another verification email`,
          429
        );
      }
    }

    cooldowns.set(key, now);
    // Cleanup old entries every hour
    if (cooldowns.size > 10000) {
      const hourAgo = now - (60 * 60 * 1000);
      for (const [k, v] of cooldowns.entries()) {
        if (v < hourAgo) cooldowns.delete(k);
      }
    }

    next();
  };
};
