import jwt from 'jsonwebtoken';
import { APIError } from '../middleware/errorHandler.js';
import { generateVerificationToken, hashToken, compareTokens, sendVerificationEmail } from '../utils/emailUtils.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = '24h';

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Geçersiz veya süresi dolmuş token');
  }
};

// Auth middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

// Role bazlı yetkilendirme middleware'i
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new APIError('You do not have permission for this operation', 403);
    }
    next();
  };
};

// Register a new user with email verification
export const register = async (userData) => {
  const verificationToken = generateVerificationToken();
  const tokenHash = hashToken(verificationToken);
  const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  const user = new User({
    ...userData,
    emailVerifyTokenHash: tokenHash,
    emailVerifyExpires: tokenExpires
  });

  await user.save();
  await sendVerificationEmail(user.email, verificationToken);

  return { message: 'Registration successful. Please check your email for verification.' };
};

// Verify email with token
export const verifyEmail = async (email, token) => {
  const user = await User.findOne({ 
    email,
    emailVerified: false,
    emailVerifyExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new APIError('Invalid or expired verification link', 400);
  }

  if (!compareTokens(token, user.emailVerifyTokenHash)) {
    throw new APIError('Invalid verification token', 400);
  }

  user.emailVerified = true;
  user.emailVerifyTokenHash = null;
  user.emailVerifyExpires = null;
  await user.save();

  return { message: 'Email verified successfully' };
};

// Resend verification email
export const resendVerification = async (email) => {
  const user = await User.findOne({ email, emailVerified: false });
  
  if (!user) {
    throw new APIError('User not found or already verified', 400);
  }

  const verificationToken = generateVerificationToken();
  const tokenHash = hashToken(verificationToken);
  const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  user.emailVerifyTokenHash = tokenHash;
  user.emailVerifyExpires = tokenExpires;
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);
  return { message: 'Verification email sent successfully' };
};

// Check if email is verified middleware
export const requireEmailVerified = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user?.emailVerified) {
    throw new APIError('Please verify your email address to access this resource', 403);
  }
  
  next();
};
