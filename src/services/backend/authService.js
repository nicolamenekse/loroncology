import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const authMiddleware = async (req, res, next) => {
  try {
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Geçersiz token formatı' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }

    // Debug: Log decoded token information
    console.log('AuthMiddleware - Decoded token:', decoded);
    console.log('AuthMiddleware - Decoded id:', decoded.id);
    console.log('AuthMiddleware - Decoded email:', decoded.email);
    console.log('AuthMiddleware - Decoded role:', decoded.role);

    // Kullanıcı bilgilerini request'e ekle
    req.user = {
      _id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    // Debug: Log final req.user object
    console.log('AuthMiddleware - Final req.user:', req.user);
    console.log('AuthMiddleware - req.user._id:', req.user._id);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token süresi dolmuş' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    console.error('Auth middleware hatası:', error);
    res.status(500).json({ message: 'Yetkilendirme hatası' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Yetkilendirme gerekli' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    next();
  };
};
