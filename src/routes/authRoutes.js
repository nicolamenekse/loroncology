import express from 'express';
import { authLimiter, emailVerificationLimiter, emailCooldownMiddleware } from '../middleware/rateLimiter.js';
import { register, verifyEmail, resendVerification } from '../services/authService.js';
import { APIError } from '../middleware/errorHandler.js';

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      throw new APIError('Email, password, and name are required', 400);
    }

    if (password.length < 8) {
      throw new APIError('Password must be at least 8 characters long', 400);
    }

    const result = await register({ email, password, name });
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Verify email
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      throw new APIError('Token and email are required', 400);
    }

    const result = await verifyEmail(email, token);
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Resend verification email
router.post('/resend-verification',
  emailVerificationLimiter,
  emailCooldownMiddleware(),
  async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new APIError('Email is required', 400);
      }

      const result = await resendVerification(email);
      res.json({ ok: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
