import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import sgMail from '@sendgrid/mail';
import PatientHistory from './models/PatientHistory.js';
import Blog from './models/Blog.js';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Consultation from './models/Consultation.js';
import Message from './models/Message.js';
import ColleagueConnection from './models/ColleagueConnection.js';
import { generatePatientAnalysis, generateTreatmentSuggestions, analyzeLaboratoryResults } from './services/aiService.js';
import { generateToken, authMiddleware, requireRole } from './services/backend/authService.js';
import { adminMiddleware } from './middleware/adminMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// SendGrid API key kontrolü
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY environment variable is not set!');
  console.error('Please add SENDGRID_API_KEY to your .env file.');
  process.exit(1);
}

// SendGrid'i yapılandır
sgMail.setApiKey(SENDGRID_API_KEY);

// SendGrid test
console.log('=== SendGrid Configuration ===');
console.log('SendGrid API Key:', SENDGRID_API_KEY ? 'Configured ✓' : 'Missing ✗');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Missing ✗');
console.log('APP_URL:', process.env.APP_URL || 'Missing ✗');

if (!process.env.APP_URL) {
  console.error('❌ APP_URL environment variable is not set!');
  console.error('Please add APP_URL to your .env file.');
  process.exit(1);
}

if (!process.env.EMAIL_FROM) {
  console.error('❌ EMAIL_FROM environment variable is not set!');
  console.error('Please add EMAIL_FROM to your .env file.');
  process.exit(1);
}

// JWT Secret kontrolü
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set!');
  console.error('Please add JWT_SECRET to your .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS ayarları
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://loronkoloji.vercel.app',
    'https://loroncology.onrender.com',
    'https://loronkoloji.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Additional middleware for mobile compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Test route to check if server is working
app.get('/api/test', (req, res) => {
  console.log('=== Test route hit ===');
  res.json({ message: 'Server is working!' });
});

// Test file system access
app.get('/api/test-fs', (req, res) => {
  try {
    const testPath = path.join(__dirname, '../public/avatars');
    const exists = fs.existsSync(testPath);
    const files = exists ? fs.readdirSync(testPath) : [];
    
    res.json({
      message: 'File system test',
      __dirname,
      testPath,
      exists,
      files: files.slice(0, 5) // Show first 5 files
    });
  } catch (error) {
    res.status(500).json({
      message: 'File system test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Debug endpoint - mevcut bağlantıları kontrol et
app.get('/api/debug/connections', authMiddleware, async (req, res) => {
  try {
    const connections = await ColleagueConnection.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    }).populate('sender', 'name email').populate('receiver', 'name email');
    
    res.json({
      userId: req.user._id,
      userName: req.user.name,
      connections: connections
    });
  } catch (error) {
    console.error('Bağlantı debug hatası:', error);
    res.status(500).json({ message: 'Bağlantılar getirilirken hata oluştu' });
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Serve static files from the public directory for avatars
const avatarsStaticPath = (() => {
  const path1 = path.join(__dirname, '../public/avatars');
  if (fs.existsSync(path1)) return path1;
  
  const path2 = path.join(process.cwd(), 'public/avatars');
  if (fs.existsSync(path2)) return path2;
  
  const path3 = path.join(process.cwd(), 'src/../public/avatars');
  if (fs.existsSync(path3)) return path3;
  
  return path1; // fallback to original path
})();

console.log('Serving avatars from:', avatarsStaticPath);
app.use('/avatars', express.static(avatarsStaticPath));

// MongoDB Connection - Güvenlik: Hassas bilgi environment variable'dan alınıyor
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  console.error('Please create a .env file with your MongoDB connection string.');
  process.exit(1);
}

// MongoDB bağlantı seçenekleri
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// MongoDB bağlantı fonksiyonu
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('MongoDB bağlantısı başarılı');
    console.log('Veritabanı:', mongoose.connection.name);
    console.log('Collections:', await mongoose.connection.db.listCollections().toArray());
  } catch (err) {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1);
  }
};

// Bağlantıyı başlat
connectDB();

// MongoDB bağlantı başarılı olduktan sonra eski index'leri temizle
mongoose.connection.once('connected', async () => {
  try {
    // Eski tcNo index'ini kaldır (eğer varsa)
    const collection = mongoose.connection.db.collection('patients');
    const indexes = await collection.indexes();
    const tcNoIndex = indexes.find(index => index.name === 'tcNo_1');
    
    if (tcNoIndex) {
      console.log('Eski tcNo index\'i bulundu, kaldırılıyor...');
      await collection.dropIndex('tcNo_1');
      console.log('tcNo index\'i başarıyla kaldırıldı');
    }
    
    // Check and fix Patient collection indexes
    console.log('Patient collection indexes on startup:', Object.keys(indexes));
    
    // Try to drop the old global protokolNo index if it exists
    const protokolNoIndex = indexes.find(index => index.name === 'protokolNo_1');
    if (protokolNoIndex) {
      console.log('Eski global protokolNo index\'i bulundu, kaldırılıyor...');
      try {
        await collection.dropIndex('protokolNo_1');
        console.log('Global protokolNo index\'i başarıyla kaldırıldı');
      } catch (dropError) {
        console.log('Global protokolNo index kaldırılamadı:', dropError.message);
      }
    }
    
    // Ensure the compound index exists
    const compoundIndex = indexes.find(index => index.name === 'userId_1_protokolNo_1');
    if (!compoundIndex) {
      console.log('Compound index bulunamadı, oluşturuluyor...');
      try {
        await collection.createIndex(
          { userId: 1, protokolNo: 1 },
          { unique: true, name: 'userId_1_protokolNo_1' }
        );
        console.log('Compound index başarıyla oluşturuldu');
      } catch (createError) {
        console.log('Compound index oluşturulamadı:', createError.message);
      }
    } else {
      console.log('Compound index zaten mevcut');
    }
    
  } catch (error) {
    // Index yoksa hata olabilir, bu normal
    if (error.code !== 27 && error.codeName !== 'IndexNotFound') {
      console.log('Index temizleme hatası (normal olabilir):', error.message);
    }
  }
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Sunucu hatası oluştu',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('\n=== New Registration Request ===');
    console.log('Register isteği alındı:', req.body);
    console.log('SendGrid Configured:', !!SENDGRID_API_KEY);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('APP_URL:', process.env.APP_URL);
    const { email, password, name, mainSpecialty, avatar } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password || !name) {
      console.log('Eksik alanlar:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ message: 'Email, şifre ve isim zorunludur' });
    }

    // Frontend specialty values to backend mapping
    const specialtyMapping = {
      'Küçük Hayvan Hekimliği': 'Hayvan Türüne Göre Uzmanlıklar',
      'Büyük Hayvan Hekimliği': 'Hayvan Türüne Göre Uzmanlıklar',
      'Kanatlı Hayvan Hekimliği': 'Hayvan Türüne Göre Uzmanlıklar',
      'Egzotik Hayvan Hekimliği': 'Hayvan Türüne Göre Uzmanlıklar',
      'Akademik / Araştırma': 'Araştırma & Akademik Alanlar',
      'Saha & Üretim': 'Saha ve Üretim Branşları'
    };

    // Map frontend specialty to backend specialty
    const mappedSpecialty = mainSpecialty ? specialtyMapping[mainSpecialty] : null;
    console.log('Specialty mapping:', { frontend: mainSpecialty, backend: mappedSpecialty });

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçersiz email formatı' });
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    
    // Eğer kullanıcı varsa ve emailVerified true ise, hata ver
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
    }

    // Eğer kullanıcı varsa ama doğrulanmamışsa, yeni token oluştur
    if (existingUser && !existingUser.emailVerified) {
      console.log('Doğrulanmamış kullanıcı bulundu, yeni token oluşturuluyor...');
    }

    // Yeni kullanıcı oluştur veya mevcut doğrulanmamış kullanıcıyı güncelle
    console.log('\n=== Creating New User ===');
    console.log('User details:', { email, name });
    
    // Doğrulama token'ı oluştur
    console.log('Generating verification token...');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 dakika

    console.log('Token details:', {
      rawToken: verificationToken,
      hashedToken: tokenHash,
      expiresAt: tokenExpires
    });

    let user;
    if (existingUser) {
      // Var olan kullanıcıyı güncelle
      existingUser.emailVerifyTokenHash = tokenHash;
      existingUser.emailVerifyExpires = tokenExpires;
      if (password) {
        existingUser.password = password;
      }
      if (name) {
        existingUser.name = name;
      }
      if (avatar) {
        existingUser.avatar = avatar;
      }
      user = await existingUser.save();
      console.log('Existing user updated with new verification token');
    } else {
                // Yeni kullanıcı oluştur
      console.log('Creating new user with data:', { email, name, role: 'doctor', mainSpecialty: mappedSpecialty });
      user = new User({
        email,
        password,
        name,
        role: 'doctor', // Explicitly set role
        mainSpecialty: mappedSpecialty, // Include mapped specialty
        avatar: avatar || 'default-avatar.svg', // Include avatar
        emailVerifyTokenHash: tokenHash,
        emailVerifyExpires: tokenExpires
      });
    
    try {
      user = await user.save();
      console.log('New user created successfully');
    } catch (saveError) {
      console.error('User save error:', saveError);
      console.error('Validation errors:', saveError.errors);
      throw saveError;
    }
    }
    console.log('User saved successfully:', {
      id: user._id,
      email: user.email,
      tokenHash: user.emailVerifyTokenHash,
      tokenExpires: user.emailVerifyExpires
    });

    // Doğrulama emaili gönder
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Email Adresinizi Doğrulayın',
      text: `Loroncology'ye hoş geldiniz! Email adresinizi doğrulamak için bu linke tıklayın: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Loroncology'ye Hoş Geldiniz!</h2>
          <p>Email adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Email Adresimi Doğrula
            </a>
          </div>
          <p>Eğer buton çalışmazsa, bu linki tarayıcınıza kopyalayabilirsiniz:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>Bu link 30 dakika sonra geçerliliğini yitirecektir.</p>
          <p>Eğer bu hesabı siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        </div>
      `
    };

    console.log('Sending verification email to:', email);
    console.log('Email content:', msg);
    
    try {
      await sgMail.send(msg);
      console.log('Verification email sent successfully');
    } catch (sendError) {
      console.error('SendGrid error:', sendError);
      if (sendError.response) {
        console.error('SendGrid error details:', sendError.response.body);
      }
      throw sendError;
    }

    res.status(201).json({
      message: 'Kayıt başarılı. Lütfen email adresinizi doğrulayın.'
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    
    // More detailed error logging
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Kayıt bilgileri geçersiz',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({ 
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }
    
    res.status(500).json({ 
      message: 'Kayıt işlemi sırasında bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Email doğrulama endpoint'i
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    console.log('\n=== Email Verification Request ===');
    console.log('Query params:', req.query);
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ message: 'Token ve email zorunludur' });
    }

    // Kullanıcıyı bul
    console.log('Searching for user:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    const now = new Date();
    console.log('User verification status:', {
      emailVerified: user.emailVerified,
      hasToken: !!user.emailVerifyTokenHash,
      tokenExpires: user.emailVerifyExpires,
      currentTime: now,
      tokenExpired: user.emailVerifyExpires < now,
      timeDiff: (user.emailVerifyExpires - now) / 1000 + ' seconds remaining'
    });

    // Doğrulama durumunu kontrol et
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email zaten doğrulanmış' });
    }

    if (!user.emailVerifyTokenHash || !user.emailVerifyExpires) {
      return res.status(400).json({ message: 'Doğrulama token\'ı bulunamadı' });
    }

    if (user.emailVerifyExpires < new Date()) {
      return res.status(400).json({ message: 'Doğrulama linkinin süresi dolmuş' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş doğrulama linki' });
    }

    // Token'ı doğrula
    console.log('Verifying token...');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Token comparison:', {
      receivedTokenHash: tokenHash,
      storedTokenHash: user.emailVerifyTokenHash,
      matches: tokenHash === user.emailVerifyTokenHash
    });

    if (tokenHash !== user.emailVerifyTokenHash) {
      return res.status(400).json({ message: 'Geçersiz doğrulama token\'ı' });
    }

    // Email'i doğrulanmış olarak işaretle
    user.emailVerified = true;
    user.emailVerifyTokenHash = null;
    user.emailVerifyExpires = null;
    await user.save();

    res.json({ message: 'Email başarıyla doğrulandı' });
  } catch (error) {
    console.error('Email doğrulama hatası:', error);
    res.status(500).json({ message: 'Email doğrulanırken bir hata oluştu' });
  }
});

// Email doğrulama yeniden gönderme endpoint'i
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email zorunludur' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email, emailVerified: false });
    if (!user) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı veya email zaten doğrulanmış' });
    }

    // Son gönderimden bu yana 60 saniye geçmiş mi kontrol et
    if (user.emailVerifyExpires && user.emailVerifyExpires > new Date(Date.now() - 60 * 1000)) {
      const remainingTime = Math.ceil((user.emailVerifyExpires - Date.now() + 60 * 1000) / 1000);
      return res.status(429).json({
        message: `Lütfen yeni bir doğrulama emaili göndermeden önce ${remainingTime} saniye bekleyin`
      });
    }

    // Yeni doğrulama token'ı oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 dakika

    // Token bilgilerini güncelle
    user.emailVerifyTokenHash = tokenHash;
    user.emailVerifyExpires = tokenExpires;
    await user.save();

    // Doğrulama emaili gönder
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Email Doğrulama - Yeniden Gönderim',
      text: `Email adresinizi doğrulamak için bu linke tıklayın: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Doğrulama</h2>
          <p>Email adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Email Adresimi Doğrula
            </a>
          </div>
          <p>Eğer buton çalışmazsa, bu linki tarayıcınıza kopyalayabilirsiniz:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>Bu link 30 dakika sonra geçerliliğini yitirecektir.</p>
        </div>
      `
    };

    console.log('Sending verification email to:', email);
    console.log('Email content:', msg);
    
    try {
      await sgMail.send(msg);
      console.log('Verification email sent successfully');
    } catch (sendError) {
      console.error('SendGrid error:', sendError);
      if (sendError.response) {
        console.error('SendGrid error details:', sendError.response.body);
      }
      throw sendError;
    }

    res.json({ message: 'Doğrulama emaili yeniden gönderildi' });
  } catch (error) {
    console.error('Doğrulama emaili gönderme hatası:', error);
    res.status(500).json({ message: 'Doğrulama emaili gönderilirken bir hata oluştu' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email kontrolü
    if (!email) {
      return res.status(400).json({ message: 'Email zorunludur' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }

    // Email doğrulamasını kontrol et
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Lütfen email adresinizi doğrulayın. Doğrulama emaili gönderildi mi?',
        needsVerification: true 
      });
    }

    // Eğer password null ise, bu email doğrulamasından sonraki otomatik giriş denemesidir
    if (password === null && user.emailVerified) {
      // Email doğrulamasından hemen sonra otomatik giriş - şifre kontrolü yapmadan devam et
      console.log('Email doğrulaması sonrası otomatik giriş yapılıyor:', email);
    } else {
      // Normal giriş - şifre kontrolü yap
      if (!password) {
        return res.status(400).json({ message: 'Şifre zorunludur' });
      }
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Geçersiz email veya şifre' });
      }
    }

    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save();

    // Token oluştur
    const token = generateToken(user);

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        _id: user._id,
        id: user._id, // Keep both for compatibility
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      message: 'Giriş işlemi sırasında bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Kullanıcı bilgilerini getir
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Gelen bağlantı isteklerini getir
    const pendingRequests = await ColleagueConnection.find({
      receiver: req.user._id,
      status: 'pending'
    }).populate('sender', 'name mainSpecialty avatar subspecialties');

    // Gönderilen bağlantı isteklerini getir
    const sentRequests = await ColleagueConnection.find({
      sender: req.user._id,
      status: 'pending'
    }).populate('receiver', 'name mainSpecialty avatar subspecialties');

    // Kabul edilen bağlantıları getir
    const connections = await ColleagueConnection.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ],
      status: 'accepted'
    })
    .populate('sender', 'name mainSpecialty avatar subspecialties')
    .populate('receiver', 'name mainSpecialty avatar subspecialties');

    // Debug: Bağlantı verilerini kontrol et
    if (connections.length > 0) {
      console.log('API /auth/me - Bağlantı detayları:');
      connections.forEach((connection, index) => {
        console.log(`Bağlantı ${index}:`, {
          connectionId: connection._id,
          sender: {
            id: connection.sender?._id,
            name: connection.sender?.name,
            avatar: connection.sender?.avatar,
            keys: connection.sender ? Object.keys(connection.sender) : []
          },
          receiver: {
            id: connection.receiver?._id,
            name: connection.receiver?.name,
            avatar: connection.receiver?.avatar,
            keys: connection.receiver ? Object.keys(connection.receiver) : []
          }
        });
      });
    }

    console.log('API /auth/me - Kullanıcı bilgileri:', {
              userId: req.user._id,
      pendingRequests: pendingRequests.length,
      sentRequests: sentRequests.length,
      connections: connections.length
    });

    res.json({
      ...user.toObject(),
      pendingRequests,
      sentRequests,
      connections
    });
  } catch (error) {
    console.error('Kullanıcı bilgileri getirme hatası:', error);
    res.status(500).json({ message: 'Kullanıcı bilgileri alınırken bir hata oluştu' });
  }
});

// Profil güncelleme endpoint'i
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { mainSpecialty, subspecialties, profileCompleted, avatar } = req.body;
    
    console.log('=== Profil Güncelleme İsteği ===');
    console.log('Kullanıcı ID:', req.user._id);
    console.log('Gelen veri:', { mainSpecialty, subspecialties, profileCompleted, avatar });

    // Kullanıcıyı bul
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('Kullanıcı bulunamadı');
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    console.log('Mevcut kullanıcı verisi:', {
      mainSpecialty: user.mainSpecialty,
      subspecialties: user.subspecialties,
      profileCompleted: user.profileCompleted,
      avatar: user.avatar
    });

    // Ana uzmanlık alanını güncelle (her zaman güncelle)
    if (mainSpecialty !== undefined) {
      user.mainSpecialty = mainSpecialty;
      console.log('Ana uzmanlık güncellendi:', mainSpecialty);
    }

    // Alt uzmanlık alanlarını güncelle
    if (Array.isArray(subspecialties)) {
      user.subspecialties = subspecialties;
      console.log('Alt uzmanlıklar güncellendi:', subspecialties);
    }

    // Profil tamamlanma durumunu güncelle
    if (typeof profileCompleted === 'boolean') {
      user.profileCompleted = profileCompleted;
      console.log('Profil tamamlanma durumu güncellendi:', profileCompleted);
    }

    // Avatar güncelle
    if (avatar !== undefined) {
      user.avatar = avatar;
      console.log('Avatar güncellendi:', avatar);
    }

    await user.save();
    console.log('Kullanıcı veritabanında güncellendi');

    const responseData = {
      message: 'Profil başarıyla güncellendi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mainSpecialty: user.mainSpecialty,
        subspecialties: user.subspecialties,
        profileCompleted: user.profileCompleted,
        avatar: user.avatar
      }
    };

    console.log('Yanıt verisi:', responseData);
    res.json(responseData);
    
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu' });
  }
});

// Şifre değiştirme endpoint'i
// Admin Routes
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  console.log('=== /api/admin/users route hit ===');
  console.log('Current user ID:', req.user._id);
  console.log('Current user role:', req.user.role);
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    console.log('Users found:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({ message: 'Kullanıcılar getirilirken bir hata oluştu' });
  }
});

app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Kullanıcıyı bul
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Email değişmişse benzersizlik kontrolü
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
      }
    }

    // Kullanıcıyı güncelle
    user.name = name;
    user.email = email;
    user.role = role;
    await user.save();

    res.json({ message: 'Kullanıcı başarıyla güncellendi', user });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Kendini silmeye çalışıyor mu kontrolü
    if (req.params.id === req.user._id) {
      return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({ message: 'Kullanıcı silinirken bir hata oluştu' });
  }
});

app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Şifre kontrolü
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mevcut şifre ve yeni şifre zorunludur' });
    }

    // Yeni şifre uzunluk kontrolü
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalıdır' });
    }

    // Kullanıcıyı bul
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Mevcut şifreyi kontrol et
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mevcut şifre yanlış' });
    }

    // Yeni şifreyi kaydet
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ message: 'Şifre değiştirilirken bir hata oluştu' });
  }
});

// Routes
app.post('/api/patients', authMiddleware, async (req, res) => {
  try {
    console.log('POST /api/patients - Gelen istek:', req.body);
    
    // Kullanıcı ID'sini ekle
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: 'Oturum bulunamadı'
      });
    }

    // Gelen veriyi kontrol et
    const requiredFields = ['protokolNo', 'hastaAdi', 'hastaSahibi', 'tur', 'irk', 'cinsiyet', 'yas', 'kilo', 'vks', 'anamnez'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Eksik alanlar:', missingFields);
      return res.status(400).json({
        message: 'Eksik alanlar var',
        fields: missingFields
      });
    }

    // VKS değerini kontrol et
    if (req.body.vks < 1 || req.body.vks > 9) {
      console.log('Geçersiz VKS değeri:', req.body.vks);
      return res.status(400).json({
        message: 'VKS değeri 1-9 arasında olmalıdır'
      });
    }

    // Tür değerini kontrol et
    if (!['Kedi', 'Köpek'].includes(req.body.tur)) {
      console.log('Geçersiz tür değeri:', req.body.tur);
      return res.status(400).json({
        message: 'Tür değeri "Kedi" veya "Köpek" olmalıdır'
      });
    }

    // Cinsiyet değerini kontrol et
    if (!['Erkek', 'Dişi'].includes(req.body.cinsiyet)) {
      console.log('Geçersiz cinsiyet değeri:', req.body.cinsiyet);
      return res.status(400).json({
        message: 'Cinsiyet değeri "Erkek" veya "Dişi" olmalıdır'
      });
    }

    // Protokol numarası kullanıcıya özel benzersiz olmalı
    console.log('Protokol numarası kontrolü yapılıyor...', {
      userId: userId,
      protokolNo: req.body.protokolNo,
      userIdType: typeof userId
    });
    
    // Debug: Check all patients with this protokolNo across all users
    const allPatientsWithProtokolNo = await Patient.find({ protokolNo: req.body.protokolNo });
    console.log('Tüm kullanıcılarda bu protokol numarasına sahip hastalar:', allPatientsWithProtokolNo.map(p => ({
      id: p._id,
      userId: p.userId,
      protokolNo: p.protokolNo,
      hastaAdi: p.hastaAdi
    })));
    
    // Check if any patient has this protokolNo (for debugging)
    if (allPatientsWithProtokolNo.length > 0) {
      console.log('⚠️ UYARI: Bu protokol numarası başka kullanıcılarda kullanılıyor!');
      console.log('Çakışan hastalar:', allPatientsWithProtokolNo);
      
      // Check if current user already has a patient with this protokolNo
      const userPatientWithProtokolNo = allPatientsWithProtokolNo.find(p => 
        p.userId && p.userId.toString() === userId.toString()
      );
      
      if (userPatientWithProtokolNo) {
        console.log('❌ Bu kullanıcı zaten bu protokol numarasına sahip bir hastaya sahip!');
        return res.status(400).json({
          message: 'Bu protokol numarası zaten kullanılıyor',
          details: 'Bu kullanıcı için zaten kullanılıyor'
        });
      }
      
      console.log('✅ Bu protokol numarası başka kullanıcılarda kullanılıyor ama bu kullanıcı için kullanılabilir');
    }
    
    const existingPatient = await Patient.findOne({ 
      userId: userId, 
      protokolNo: req.body.protokolNo 
    });
    
    console.log('Mevcut hasta kontrolü sonucu:', {
      existingPatient: existingPatient ? {
        id: existingPatient._id,
        userId: existingPatient.userId,
        protokolNo: existingPatient.protokolNo
      } : null
    });
    
    if (existingPatient) {
      console.log('Bu kullanıcı için protokol numarası zaten kullanılıyor:', req.body.protokolNo);
      return res.status(400).json({
        message: 'Bu protokol numarası zaten kullanılıyor'
      });
    }
    
    console.log('Protokol numarası kullanılabilir, devam ediliyor...');

    // MongoDB bağlantı durumunu kontrol et
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB bağlantısı aktif değil. Durum:', mongoose.connection.readyState);
      return res.status(500).json({
        message: 'Veritabanı bağlantısı aktif değil'
      });
    }

    console.log('Hasta kaydı oluşturuluyor...');
    console.log('userId değeri:', { userId, userIdType: typeof userId });
    
    // Kullanıcı bilgilerini al (doktor adı ve email için)
    const user = await User.findById(userId);
    if (!user) {
      console.error('Kullanıcı bulunamadı:', userId);
      return res.status(404).json({
        message: 'Kullanıcı bulunamadı'
      });
    }
    
    const patientData = {
      ...req.body,
      userId: userId,
      doctorName: user.name,
      doctorEmail: user.email
    };
    console.log('Kaydedilecek hasta verisi:', patientData);
    
    const patient = new Patient(patientData);
    const savedPatient = await patient.save();
    console.log('Hasta kaydı başarıyla oluşturuldu:', savedPatient);
    console.log('Kaydedilen hastanın userId değeri:', { 
      savedUserId: savedPatient.userId, 
      savedUserIdType: typeof savedPatient.userId 
    });
    
    res.status(201).json({ 
      message: 'Hasta kaydı başarıyla oluşturuldu', 
      patient: savedPatient 
    });
  } catch (error) {
    console.error('Hasta kaydı hatası:', error);
    
    // MongoDB bağlantı hatası kontrolü
    if (error.name === 'MongoServerError') {
      console.error('MongoDB sunucu hatası:', error.message);
      console.error('MongoDB error code:', error.code);
      console.error('MongoDB error details:', error);
      
      // Duplicate key error kontrolü
      if (error.code === 11000) {
        console.error('Duplicate key hatası - muhtemelen eski global unique index hala aktif');
        console.error('Error details:', {
          code: error.code,
          keyPattern: error.keyPattern,
          keyValue: error.keyValue,
          message: error.message
        });
        
        // Check if this is a protokolNo duplicate error
        if (error.keyPattern && error.keyPattern.protokolNo) {
          return res.status(400).json({
            message: 'Bu protokol numarası zaten kullanılıyor (veritabanı indeksi hatası)',
            error: 'Duplicate key error - database index issue',
            details: 'Global unique index on protokolNo is still active'
          });
        }
        
        return res.status(400).json({
          message: 'Veritabanı çakışma hatası',
          error: 'Duplicate key error',
          details: error.keyPattern || 'Unknown duplicate field'
        });
      }
      
      return res.status(500).json({
        message: 'Veritabanı işlemi sırasında bir hata oluştu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Validation hatası kontrolü
    if (error.name === 'ValidationError') {
      console.error('Validation hatası:', error.errors);
      return res.status(400).json({ 
        message: 'Geçersiz hasta verisi',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Genel hata
    console.error('Beklenmeyen hata:', error);
    res.status(500).json({ 
      message: 'Hasta kaydı oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Debug endpoint to check database indexes
app.get('/api/debug/indexes', async (req, res) => {
  try {
    const indexes = await Patient.collection.getIndexes();
    res.json({
      message: 'Current database indexes',
      indexes: Object.keys(indexes),
      details: indexes
    });
  } catch (error) {
    console.error('Index check error:', error);
    res.status(500).json({ 
      message: 'Index check failed',
      error: error.message
    });
  }
});

// New debug endpoint to check protokolNo conflicts
app.get('/api/debug/protokol-conflicts', async (req, res) => {
  try {
    const { protokolNo } = req.query;
    
    if (!protokolNo) {
      return res.status(400).json({
        message: 'protokolNo query parameter is required'
      });
    }
    
    // Find all patients with this protokolNo
    const patients = await Patient.find({ protokolNo }).populate('userId', 'name email');
    
    // Get all users
    const users = await User.find({}, 'name email');
    
    // Check current indexes
    const indexes = await Patient.collection.getIndexes();
    
    res.json({
      message: 'Protokol number conflict analysis',
      protokolNo,
      patientsWithProtokolNo: patients.map(p => ({
        id: p._id,
        userId: p.userId,
        hastaAdi: p.hastaAdi,
        createdAt: p.createdAt
      })),
      allUsers: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email
      })),
      currentIndexes: Object.keys(indexes),
      indexDetails: indexes
    });
  } catch (error) {
    console.error('Protokol conflict check error:', error);
    res.status(500).json({
      message: 'Protokol conflict check failed',
      error: error.message
    });
  }
});

// Debug endpoint to check patient doctor information
app.get('/api/debug/patient-doctor-info', async (req, res) => {
  try {
    console.log('Checking patient doctor information...');
    
    const patients = await Patient.find({});
    const patientsWithDoctorInfo = patients.map(patient => ({
      id: patient._id,
      hastaAdi: patient.hastaAdi,
      protokolNo: patient.protokolNo,
      userId: patient.userId,
      doctorName: patient.doctorName,
      doctorEmail: patient.doctorEmail,
      hasDoctorName: !!patient.doctorName,
      hasDoctorEmail: !!patient.doctorEmail,
      createdAt: patient.createdAt
    }));
    
    console.log('Patient doctor information:', patientsWithDoctorInfo);
    
    res.json({
      message: 'Patient doctor information retrieved',
      totalPatients: patients.length,
      patientsWithDoctorInfo: patientsWithDoctorInfo,
      summary: {
        withDoctorName: patientsWithDoctorInfo.filter(p => p.hasDoctorName).length,
        withoutDoctorName: patientsWithDoctorInfo.filter(p => !p.hasDoctorName).length,
        withDoctorEmail: patientsWithDoctorInfo.filter(p => p.hasDoctorEmail).length,
        withoutDoctorEmail: patientsWithDoctorInfo.filter(p => !p.hasDoctorEmail).length
      }
    });
  } catch (error) {
    console.error('Patient doctor info check error:', error);
    res.status(500).json({ 
      message: 'Patient doctor info check failed',
      error: error.message 
    });
  }
});

// Endpoint to update existing patients with doctor information
app.post('/api/debug/update-patient-doctor-info', async (req, res) => {
  try {
    console.log('Updating existing patients with doctor information...');
    
    // Get all patients that don't have doctorName or doctorEmail
    const patientsToUpdate = await Patient.find({
      $or: [
        { doctorName: { $exists: false } },
        { doctorEmail: { $exists: false } },
        { doctorName: null },
        { doctorEmail: null }
      ]
    });
    
    console.log(`${patientsToUpdate.length} hasta güncellenecek`);
    
    if (patientsToUpdate.length === 0) {
      return res.json({
        message: 'Güncellenecek hasta bulunamadı',
        totalPatients: 0
      });
    }
    
    let updatedCount = 0;
    const updateResults = [];
    
    for (const patient of patientsToUpdate) {
      try {
        // Get user information
        const user = await User.findById(patient.userId);
        if (!user) {
          console.log(`Kullanıcı bulunamadı: ${patient.userId} (Hasta: ${patient.hastaAdi})`);
          updateResults.push({
            patientId: patient._id,
            hastaAdi: patient.hastaAdi,
            status: 'error',
            message: 'Kullanıcı bulunamadı'
          });
          continue;
        }
        
        // Update patient with doctor information
        await Patient.findByIdAndUpdate(patient._id, {
          doctorName: user.name,
          doctorEmail: user.email
        });
        
        console.log(`Hasta güncellendi: ${patient.hastaAdi} -> Doktor: ${user.name}`);
        updatedCount++;
        
        updateResults.push({
          patientId: patient._id,
          hastaAdi: patient.hastaAdi,
          status: 'success',
          doctorName: user.name,
          doctorEmail: user.email
        });
        
      } catch (error) {
        console.error(`Hasta güncellenirken hata: ${patient._id}`, error);
        updateResults.push({
          patientId: patient._id,
          hastaAdi: patient.hastaAdi,
          status: 'error',
          message: error.message
        });
      }
    }
    
    console.log(`\nGüncelleme tamamlandı! ${updatedCount} hasta güncellendi.`);
    
    res.json({
      message: 'Patient doctor info update completed',
      totalPatientsToUpdate: patientsToUpdate.length,
      updatedCount: updatedCount,
      updateResults: updateResults
    });
    
  } catch (error) {
    console.error('Patient doctor info update error:', error);
    res.status(500).json({ 
      message: 'Patient doctor info update failed',
      error: error.message 
    });
  }
});

// Temporary endpoint to fix database indexes
app.post('/api/debug/fix-indexes', async (req, res) => {
  try {
    console.log('Fixing database indexes...');
    
    // Get current indexes
    const currentIndexes = await Patient.collection.getIndexes();
    console.log('Current indexes:', Object.keys(currentIndexes));
    
    // Try to drop the old global protokolNo index if it exists
    try {
      await Patient.collection.dropIndex('protokolNo_1');
      console.log('Old global protokolNo index dropped successfully');
    } catch (dropError) {
      console.log('Global protokolNo index not found or already dropped:', dropError.message);
    }
    
    // Create the new compound index
    await Patient.collection.createIndex(
      { userId: 1, protokolNo: 1 },
      { unique: true, name: 'userId_protokolNo_unique' }
    );
    console.log('New compound index created successfully');
    
    // Get updated indexes
    const newIndexes = await Patient.collection.getIndexes();
    console.log('New indexes:', Object.keys(newIndexes));
    
    res.json({
      message: 'Indexes fixed successfully',
      oldIndexes: Object.keys(currentIndexes),
      newIndexes: Object.keys(newIndexes)
    });
  } catch (error) {
    console.error('Index fix error:', error);
    res.status(500).json({ 
      message: 'Index fix failed',
      error: error.message 
    });
  }
});

// Get all patients
app.get('/api/patients', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Kullanıcının hastaları getiriliyor...', { 
      userId, 
      userIdType: typeof userId,
      userIdValue: userId 
    });
    
    // Debug: Tüm hastaları kontrol et
    const allPatients = await Patient.find({});
    console.log('Veritabanındaki tüm hastalar:', allPatients.map(p => ({ 
      id: p._id, 
      userId: p.userId, 
      hastaAdi: p.hastaAdi,
      userIdType: typeof p.userId
    })));
    
    const patients = await Patient.find({ userId }).sort({ createdAt: -1 });
    console.log(`${patients.length} hasta bulundu`);
    console.log('Bulunan hastalar:', patients.map(p => ({ 
      id: p._id, 
      hastaAdi: p.hastaAdi,
      userId: p.userId 
    })));
    
    res.json(patients);
  } catch (error) {
    console.error('Hastalar getirme hatası:', error);
    res.status(500).json({ 
      message: 'Hastalar getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/patients/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Debug: Log patient and user information
    console.log('Patient ID:', req.params.id);
    console.log('Patient userId:', patient.userId);
    console.log('Current user ID:', userId);
    
    // Kullanıcının sadece kendi hastalarına erişebilmesini sağla
    if (!patient.userId) {
      console.log('Warning: Patient has no userId field');
      // For patients without userId, allow access (legacy data)
      // You might want to update these patients with the current user's ID
    } else if (patient.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bu hasta kaydına erişim yetkiniz yok' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Hasta bilgileri yüklenirken bir hata oluştu' });
  }
});

app.put('/api/patients/:id', authMiddleware, async (req, res) => {
  try {
    console.log('PUT /api/patients/:id - Hasta güncelleniyor:', req.params.id);
    
    const userId = req.user._id;
    
    // Önce mevcut hasta bilgilerini al (history için)
    const currentPatient = await Patient.findById(req.params.id);
    if (!currentPatient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Debug: Log patient and user information for update
    console.log('Update - Patient ID:', req.params.id);
    console.log('Update - Patient userId:', currentPatient.userId);
    console.log('Update - Current user ID:', userId);
    
    // Kullanıcının sadece kendi hastalarını güncelleyebilmesini sağla
    if (!currentPatient.userId) {
      console.log('Warning: Patient has no userId field (update)');
      // For patients without userId, allow access (legacy data)
      // You might want to update these patients with the current user's ID
    } else if (currentPatient.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bu hasta kaydını güncelleme yetkiniz yok' });
    }

    // Mevcut hasta verilerini history tablosuna kaydet
    const historyCount = await PatientHistory.countDocuments({ patientId: req.params.id });
    const historyRecord = new PatientHistory({
      patientId: req.params.id,
      previousData: {
        protokolNo: currentPatient.protokolNo,
        hastaAdi: currentPatient.hastaAdi,
        hastaSahibi: currentPatient.hastaSahibi,
        tur: currentPatient.tur,
        irk: currentPatient.irk,
        cinsiyet: currentPatient.cinsiyet,
        yas: currentPatient.yas,
        kilo: currentPatient.kilo,
        vks: currentPatient.vks,
        anamnez: currentPatient.anamnez,
        radyolojikBulgular: currentPatient.radyolojikBulgular,
        ultrasonografikBulgular: currentPatient.ultrasonografikBulgular,
        tomografiBulgular: currentPatient.tomografiBulgular,
        patoloji: currentPatient.patoloji,
        mikroskopisi: currentPatient.mikroskopisi,
        patolojikTeshis: currentPatient.patolojikTeshis,
        tedavi: currentPatient.tedavi,
        hemogram: currentPatient.hemogram,
        biyokimya: currentPatient.biyokimya,
        recete: currentPatient.recete,
        biyopsi: currentPatient.biyopsi,
        biyopsiNot: currentPatient.biyopsiNot,
      },
      version: historyCount + 1,
      changeReason: req.body.changeReason || 'Hasta bilgileri düzenlendi',
      modifiedBy: userId
    });

    // History kaydını veritabanına kaydet
    await historyRecord.save();
    console.log('History kaydı oluşturuldu, versiyon:', historyRecord.version);

    // Hasta bilgilerini güncelle
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date() // Güncelleme tarihini ekle
      },
      { new: true, runValidators: true }
    );

    console.log('Hasta bilgileri başarıyla güncellendi');
    res.json({
      message: 'Hasta bilgileri başarıyla güncellendi',
      patient: updatedPatient,
      historyVersion: historyRecord.version
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(400).json({ 
      message: 'Hasta bilgileri güncellenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get patient history
app.get('/api/patients/:id/history', async (req, res) => {
  try {
    console.log('Hasta geçmişi getiriliyor:', req.params.id);
    const history = await PatientHistory.find({ patientId: req.params.id })
      .sort({ changeDate: -1 }) // En yeni değişiklik en üstte
      .select('previousData changeDate changeReason modifiedBy version');
    
    console.log(`${history.length} geçmiş kaydı bulundu`);
    res.json(history);
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ 
      message: 'Hasta geçmişi yüklenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/patients/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Önce hastayı bul ve kullanıcı yetkisini kontrol et
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Kullanıcının sadece kendi hastalarını silebilmesini sağla
    if (patient.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Bu hasta kaydını silme yetkiniz yok' });
    }
    
    // Hastayı sil
    await Patient.findByIdAndDelete(req.params.id);
    
    // Hasta silindiğinde history kayıtlarını da sil
    await PatientHistory.deleteMany({ patientId: req.params.id });
    console.log('Hasta ve geçmiş kayıtları silindi:', req.params.id);
    
    res.json({ message: 'Hasta başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Hasta silinirken bir hata oluştu' });
  }
});

// AI Analiz Endpoints
app.post('/api/patients/:id/analyze', authMiddleware, async (req, res) => {
  try {
    console.log('Analiz isteği alındı:', req.params.id);
    const userId = req.user._id;
    
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      console.log('Hasta bulunamadı:', req.params.id);
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Kullanıcının sadece kendi hastalarını analiz edebilmesini sağla
    if (patient.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Bu hasta kaydını analiz etme yetkiniz yok' });
    }

    console.log('Hasta bulundu, AI analizi başlatılıyor');
    const analysis = await generatePatientAnalysis(patient);
    
    if (!analysis) {
      console.error('AI analizi boş yanıt döndü');
      return res.status(500).json({ message: 'AI analizi oluşturulamadı' });
    }

    console.log('AI analizi başarıyla oluşturuldu');
    res.json({ analysis });
  } catch (error) {
    console.error('AI analiz endpoint hatası:', {
      error: error.message,
      stack: error.stack,
      patientId: req.params.id
    });
    
    if (error.message.includes('quota') || error.message.includes('429')) {
      return res.status(429).json({ 
        message: 'AI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin veya sistem yöneticinize başvurun.',
        details: 'API kullanım kotası aşıldı.'
      });
    }
    
    if (error.message.includes('API key')) {
      return res.status(500).json({ message: 'OpenAI API yapılandırma hatası' });
    }
    
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({ message: 'API istek limiti aşıldı, lütfen biraz bekleyin' });
    }
    
    res.status(500).json({ 
      message: 'AI analizi oluşturulurken bir hata oluştu',
      error: error.message 
    });
  }
});

app.post('/api/patients/:id/treatment-suggestions', authMiddleware, async (req, res) => {
  try {
    console.log('Tedavi önerisi isteği alındı:', req.params.id);
    const userId = req.user._id;
    
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      console.log('Hasta bulunamadı:', req.params.id);
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Kullanıcının sadece kendi hastaları için tedavi önerisi alabilmesini sağla
    if (patient.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Bu hasta kaydı için tedavi önerisi alma yetkiniz yok' });
    }

    console.log('Hasta bulundu, tedavi önerisi oluşturuluyor');
    const suggestions = await generateTreatmentSuggestions(patient);
    
    if (!suggestions) {
      console.error('AI tedavi önerisi boş yanıt döndü');
      return res.status(500).json({ message: 'Tedavi önerisi oluşturulamadı' });
    }

    console.log('Tedavi önerisi başarıyla oluşturuldu');
    res.json({ suggestions });
  } catch (error) {
    console.error('Tedavi önerisi endpoint hatası:', {
      error: error.message,
      stack: error.stack,
      patientId: req.params.id
    });
    
    if (error.message.includes('API key')) {
      return res.status(500).json({ message: 'OpenAI API yapılandırma hatası' });
    }
    
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({ message: 'API istek limiti aşıldı, lütfen biraz bekleyin' });
    }
    
    res.status(500).json({ 
      message: 'Tedavi önerisi oluşturulurken bir hata oluştu',
      error: error.message 
    });
  }
});

app.post('/api/patients/:id/analyze-lab', authMiddleware, async (req, res) => {
  try {
    console.log('Lab analizi isteği alındı:', req.params.id);
    const userId = req.user._id;
    
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      console.log('Hasta bulunamadı:', req.params.id);
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Kullanıcının sadece kendi hastalarının lab sonuçlarını analiz edebilmesini sağla
    if (patient.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Bu hasta kaydının lab sonuçlarını analiz etme yetkiniz yok' });
    }

    if (!patient.hemogram && !patient.biyokimya) {
      console.log('Laboratuvar sonuçları bulunamadı');
      return res.status(400).json({ message: 'Laboratuvar sonuçları bulunamadı' });
    }

    console.log('Hasta bulundu, lab analizi başlatılıyor');
    const labAnalysis = await analyzeLaboratoryResults({
      hemogram: patient.hemogram,
      biyokimya: patient.biyokimya
    });
    
    if (!labAnalysis) {
      console.error('AI lab analizi boş yanıt döndü');
      return res.status(500).json({ message: 'Laboratuvar analizi oluşturulamadı' });
    }

    console.log('Lab analizi başarıyla oluşturuldu');
    res.json({ labAnalysis });
  } catch (error) {
    console.error('Lab analizi endpoint hatası:', {
      error: error.message,
      stack: error.stack,
      patientId: req.params.id
    });
    
    if (error.message.includes('API key')) {
      return res.status(500).json({ message: 'OpenAI API yapılandırma hatası' });
    }
    
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({ message: 'API istek limiti aşıldı, lütfen biraz bekleyin' });
    }
    
    res.status(500).json({ 
      message: 'Laboratuvar analizi oluşturulurken bir hata oluştu',
      error: error.message 
    });
  }
});

// Health check endpoint
// Blog API Endpoints
app.post('/api/blogs', async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error('Blog oluşturma hatası:', error);
    res.status(400).json({ 
      message: 'Blog oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const { q, category, sort, page = 1, limit = 12 } = req.query;
    
    // Build query
    const query = { status: 'published' };
    
    // Search query
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    // Category filter
    if (category && category !== 'Tümü') {
      query.category = category;
    }
    
    // Build sort
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular') {
      // For now, sort by creation date, but you can add view count later
      sortOption = { createdAt: -1 };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const blogs = await Blog.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    
    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasMore: skip + blogs.length < total
      }
    });
  } catch (error) {
    console.error('Blog listeleme hatası:', error);
    res.status(500).json({ 
      message: 'Bloglar getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Blog detay hatası:', error);
    res.status(500).json({ 
      message: 'Blog yazısı getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!blog) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    res.status(400).json({ 
      message: 'Blog yazısı güncellenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json({ message: 'Blog yazısı başarıyla silindi' });
  } catch (error) {
    console.error('Blog silme hatası:', error);
    res.status(500).json({ 
      message: 'Blog yazısı silinirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Blog API Endpoints
app.post('/api/blogs', async (req, res) => {
  try {
    const blogData = req.body;
    
    // Eğer coverImage yoksa veya geçici URL ise, backend'de oluştur
    if (!blogData.coverImage || blogData.coverImage.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      try {
        console.log('Blog için görsel oluşturuluyor...');
        const { generateBlogImage } = await import('./services/aiService.js');
        const imageData = await generateBlogImage(
          blogData.title,
          blogData.content,
          blogData.category
        );
        blogData.coverImage = imageData; // Base64 formatında kaydet
        console.log('Görsel başarıyla oluşturuldu ve kaydedildi');
      } catch (err) {
        console.error('Görsel oluşturma hatası:', err);
        // Hata durumunda fallback görsel kullan
        const fallbackImages = {
          'Onkoloji': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZXRlcmluZXIgT25rb2xvamk8L3RleHQ+Cjwvc3ZnPgo=',
          'Tedavi Yöntemleri': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UZWRhdmkgWcO2bnRlbWxlcml8L3RleHQ+Cjwvc3ZnPgo=',
          'Hasta Bakımı': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IYXN0YSBCYWvEsW3EsTwvdGV4dD4KPC9zdmc+Cg==',
          'Araştırmalar': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BcmHDnGxhcm1hPC90ZXh0Pgo8L3N2Zz4K',
          'Genel': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5WZXRlcmluZXIgQmxvZzwvdGV4dD4KPC9zdmc+Cg=='
        };
        blogData.coverImage = fallbackImages[blogData.category] || fallbackImages['Genel'];
      }
    }
    
    const blog = new Blog(blogData);
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error('Blog oluşturma hatası:', error);
    res.status(400).json({ 
      message: 'Blog oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const query = { ...req.query };
    if (!query.status) {
      query.status = 'published';
    }
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Blog listeleme hatası:', error);
    res.status(500).json({ 
      message: 'Bloglar getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Blog detay hatası:', error);
    res.status(500).json({ 
      message: 'Blog yazısı getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!blog) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    res.status(400).json({ 
      message: 'Blog yazısı güncellenirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog yazısı bulunamadı' });
    }
    res.json({ message: 'Blog yazısı başarıyla silindi' });
  } catch (error) {
    console.error('Blog silme hatası:', error);
    res.status(500).json({ 
      message: 'Blog yazısı silinirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Konsültasyon routes
app.post('/api/consultations', authMiddleware, async (req, res) => {
  try {
    const { patient, receiverDoctor, notes } = req.body;
    
    console.log('=== Konsültasyon Gönderme Debug ===');
    console.log('Gönderen Doktor ID:', req.user._id);
    console.log('Alıcı Doktor ID:', receiverDoctor);
    console.log('Hasta ID:', patient);
    console.log('Notlar:', notes);
    
    // Meslektaş bağlantısını kontrol et
    const connection = await ColleagueConnection.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverDoctor, status: 'accepted' },
        { sender: receiverDoctor, receiver: req.user._id, status: 'accepted' }
      ]
    });

    console.log('Bulunan bağlantı:', connection);
    console.log('Bağlantı durumu:', connection ? connection.status : 'Bağlantı bulunamadı');

    if (!connection) {
      console.log('403 Hata: Bağlantı bulunamadı');
      return res.status(403).json({ 
        message: 'Bu doktora konsültasyon gönderebilmek için önce meslektaş bağlantısı kurmanız gerekiyor' 
      });
    }

    // Hasta bilgilerini kontrol et
    const patientDoc = await Patient.findById(patient);
    if (!patientDoc) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }

    // Alıcı doktoru kontrol et
    const receiverDoc = await User.findById(receiverDoctor);
    if (!receiverDoc) {
      return res.status(404).json({ message: 'Alıcı doktor bulunamadı' });
    }
    
    // Konsültasyonu oluştur
    const consultation = new Consultation({
      patient,
      senderDoctor: req.user._id,
      receiverDoctor,
      notes
    });

    await consultation.save();

    // Populate işlemi
    await consultation.populate([
      { path: 'patient' }, // Tüm hasta bilgilerini getir
      { path: 'senderDoctor', select: 'name email' },
      { path: 'receiverDoctor', select: 'name email' }
    ]);

    res.status(201).json(consultation);
  } catch (error) {
    console.error('Konsültasyon oluşturma hatası:', error);
    res.status(500).json({ message: 'Konsültasyon oluşturulurken bir hata oluştu' });
  }
});

// Gelen konsültasyonları getir
app.get('/api/consultations/incoming', authMiddleware, async (req, res) => {
  try {
    const consultations = await Consultation.find({ receiverDoctor: req.user._id })
      .populate('patient') // Tüm hasta bilgilerini getir
      .populate('senderDoctor', 'name email avatar')
      .populate('receiverDoctor', 'name email avatar')
      .sort('-createdAt');

    res.json(consultations);
  } catch (error) {
    console.error('Konsültasyon getirme hatası:', error);
    res.status(500).json({ message: 'Konsültasyonlar getirilirken bir hata oluştu' });
  }
});

// Gönderilen konsültasyonları getir
app.get('/api/consultations/sent', authMiddleware, async (req, res) => {
  try {
    const consultations = await Consultation.find({ senderDoctor: req.user._id })
      .populate('patient') // Tüm hasta bilgilerini getir
      .populate('senderDoctor', 'name email avatar')
      .populate('receiverDoctor', 'name email avatar')
      .sort('-createdAt');

    res.json(consultations);
  } catch (error) {
    console.error('Konsültasyon getirme hatası:', error);
    res.status(500).json({ message: 'Konsültasyonlar getirilirken bir hata oluştu' });
  }
});

// Tüm konsültasyonları getir (gelen kutusu için)
app.get('/api/consultations/inbox', authMiddleware, async (req, res) => {
  try {
    const { showArchived = false, showDeleted = false } = req.query;
    
    // Kullanıcının konsültasyonlarını getir
    let query = {
      $or: [
        { receiverDoctor: req.user._id },
        { senderDoctor: req.user._id }
      ]
    };

    // 30 günden eski silinen konsültasyonları filtrele
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (showDeleted) {
      // Sadece silinen konsültasyonları getir (30 gün içinde)
      query.$and = [
        {
          $or: [
            { 
              senderDoctor: req.user._id, 
              senderDeleted: true,
              senderDeletedAt: { $gte: thirtyDaysAgo }
            },
            { 
              receiverDoctor: req.user._id, 
              receiverDeleted: true,
              receiverDeletedAt: { $gte: thirtyDaysAgo }
            }
          ]
        }
      ];
    } else if (showArchived) {
      // Sadece arşivlenmiş konsültasyonları getir (silinmemiş)
      query.$and = [
        {
          $or: [
            { 
              senderDoctor: req.user._id, 
              senderArchived: true,
              senderDeleted: false
            },
            { 
              receiverDoctor: req.user._id, 
              receiverArchived: true,
              receiverDeleted: false
            }
          ]
        }
      ];
    } else {
      // Aktif konsültasyonları getir (silinmemiş ve arşivlenmemiş)
      query.$and = [
        {
          $or: [
            { 
              senderDoctor: req.user._id, 
              senderDeleted: false, 
              senderArchived: false 
            },
            { 
              receiverDoctor: req.user._id, 
              receiverDeleted: false, 
              receiverArchived: false 
            }
          ]
        }
      ];
    }

    const consultations = await Consultation.find(query)
      .populate('patient') // Tüm hasta bilgilerini getir
      .populate('senderDoctor', 'name email mainSpecialty subspecialties avatar')
      .populate('receiverDoctor', 'name email mainSpecialty subspecialties avatar')
      .sort('-createdAt');

    // Her konsültasyon için tip bilgisi ekle
    const consultationsWithType = consultations.map(consultation => {
      const isIncoming = consultation.receiverDoctor._id.toString() === req.user._id.toString();
      return {
        ...consultation.toObject(),
        type: isIncoming ? 'incoming' : 'sent',
        isRead: consultation.isRead || false
      };
    });

    res.json(consultationsWithType);
  } catch (error) {
    console.error('Konsültasyon getirme hatası:', error);
    res.status(500).json({ message: 'Konsültasyonlar getirilirken bir hata oluştu' });
  }
});

// Okunmamış konsültasyon sayısını getir
app.get('/api/consultations/unread-count', authMiddleware, async (req, res) => {
  try {
    const unreadCount = await Consultation.countDocuments({
      receiverDoctor: req.user._id,
      isRead: false,
      receiverDeleted: false,
      receiverArchived: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Okunmamış konsültasyon sayısı getirme hatası:', error);
    res.status(500).json({ message: 'Okunmamış konsültasyon sayısı getirilirken bir hata oluştu' });
  }
});

// Konsültasyonu okundu olarak işaretle
app.put('/api/consultations/:id/mark-read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Konsültasyon bulunamadı' });
    }

    // Sadece alıcı doktor okundu olarak işaretleyebilir
    if (consultation.receiverDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    consultation.isRead = true;
    await consultation.save();

    res.json({ message: 'Konsültasyon okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Konsültasyon okundu işaretleme hatası:', error);
    res.status(500).json({ message: 'Konsültasyon okundu olarak işaretlenirken bir hata oluştu' });
  }
});

// Tüm konsültasyonları okundu olarak işaretle
app.put('/api/consultations/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const result = await Consultation.updateMany(
      {
        receiverDoctor: req.user._id,
        isRead: false,
        receiverDeleted: false,
        receiverArchived: false
      },
      {
        isRead: true
      }
    );

    res.json({ message: `${result.modifiedCount} konsültasyon okundu olarak işaretlendi` });
  } catch (error) {
    console.error('Tüm konsültasyonları okundu işaretleme hatası:', error);
    res.status(500).json({ message: 'Konsültasyonlar okundu olarak işaretlenirken bir hata oluştu' });
  }
});

// Konsültasyon durumunu güncelle
app.put('/api/consultations/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Konsültasyon bulunamadı' });
    }

    // Sadece alıcı doktor durumu güncelleyebilir
    if (consultation.receiverDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    consultation.status = status;
    await consultation.save();

    await consultation.populate([
      { path: 'patient', select: 'hastaAdi hastaSahibi tur irk' },
      { path: 'senderDoctor', select: 'name email' },
      { path: 'receiverDoctor', select: 'name email' }
    ]);

    res.json(consultation);
  } catch (error) {
    console.error('Konsültasyon güncelleme hatası:', error);
    res.status(500).json({ message: 'Konsültasyon güncellenirken bir hata oluştu' });
  }
});

// Konsültasyona mesaj gönder
app.post('/api/consultations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Konsültasyon bulunamadı' });
    }

    // Sadece konsültasyonun tarafları mesaj gönderebilir
    if (consultation.senderDoctor.toString() !== req.user._id.toString() &&
        consultation.receiverDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const message = new Message({
      consultation: id,
      sender: req.user._id,
      content
    });

    await message.save();
    await message.populate('sender', 'name email');

    res.status(201).json(message);
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({ message: 'Mesaj gönderilirken bir hata oluştu' });
  }
});

// Konsültasyon mesajlarını getir
app.get('/api/consultations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Konsültasyon bulunamadı' });
    }

    // Sadece konsültasyonun tarafları mesajları görebilir
    if (consultation.senderDoctor.toString() !== req.user._id.toString() &&
        consultation.receiverDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const messages = await Message.find({ consultation: id })
      .populate('sender', 'name email')
      .sort('createdAt');

    res.json(messages);
  } catch (error) {
    console.error('Mesaj getirme hatası:', error);
    res.status(500).json({ message: 'Mesajlar getirilirken bir hata oluştu' });
  }
});

// Konsültasyonu sil (tek taraflı)
app.delete('/api/consultations/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Konsültasyon bulunamadı' });
    }

    // Sadece konsültasyonun tarafları silebilir
    if (consultation.senderDoctor.toString() !== req.user._id.toString() &&
        consultation.receiverDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Kullanıcının rolüne göre silme işlemi yap
    if (consultation.senderDoctor.toString() === req.user._id.toString()) {
      consultation.senderDeleted = true;
      consultation.senderDeletedAt = new Date();
    } else {
      consultation.receiverDeleted = true;
      consultation.receiverDeletedAt = new Date();
    }

    await consultation.save();

    res.json({ message: 'Konsültasyon başarıyla silindi' });
  } catch (error) {
    console.error('Konsültasyon silme hatası:', error);
    res.status(500).json({ message: 'Konsültasyon silinirken bir hata oluştu' });
  }
});

// Konsültasyonu arşivle/arşivden çıkar (tek taraflı)
app.put('/api/consultations/:id/archive', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Konsültasyon bulunamadı' });
    }

    // Sadece konsültasyonun tarafları arşivleyebilir
    if (consultation.senderDoctor.toString() !== req.user._id.toString() &&
        consultation.receiverDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Kullanıcının rolüne göre arşivleme işlemi yap
    if (consultation.senderDoctor.toString() === req.user._id.toString()) {
      consultation.senderArchived = archived;
    } else {
      consultation.receiverArchived = archived;
    }

    await consultation.save();

    const action = archived ? 'arşivlendi' : 'arşivden çıkarıldı';
    res.json({ message: `Konsültasyon başarıyla ${action}` });
  } catch (error) {
    console.error('Konsültasyon arşivleme hatası:', error);
    res.status(500).json({ message: 'Konsültasyon arşivlenirken bir hata oluştu' });
  }
});

// Konsültasyonu geri yükle (tek taraflı)
app.put('/api/consultations/:id/restore', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Konsültasyon bulunamadı' });
    }

    // Sadece konsültasyonun tarafları geri yükleyebilir
    if (consultation.senderDoctor.toString() !== req.user._id.toString() &&
        consultation.receiverDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Kullanıcının rolüne göre geri yükleme işlemi yap
    if (consultation.senderDoctor.toString() === req.user._id.toString()) {
      consultation.senderDeleted = false;
      consultation.senderDeletedAt = null;
    } else {
      consultation.receiverDeleted = false;
      consultation.receiverDeletedAt = null;
    }

    await consultation.save();

    res.json({ message: 'Konsültasyon başarıyla geri yüklendi' });
  } catch (error) {
    console.error('Konsültasyon geri yükleme hatası:', error);
    res.status(500).json({ message: 'Konsültasyon geri yüklenirken bir hata oluştu' });
  }
});

// Konsültasyon için doktorları getir (sadece bağlantılı meslektaşlar)
app.get('/api/users/doctors', authMiddleware, async (req, res) => {
  try {
    // Önce tüm kullanıcıları doctor rolüne güncelle (geçici çözüm)
    await User.updateMany(
      { role: 'user' },
      { $set: { role: 'doctor' } }
    );

    // Sadece kabul edilmiş meslektaş bağlantılarını bul
    const acceptedConnections = await ColleagueConnection.find({
      $or: [
        { sender: req.user._id, status: 'accepted' },
        { receiver: req.user._id, status: 'accepted' }
      ]
    });

    // Bağlantılı doktor ID'lerini topla
    const connectedDoctorIds = acceptedConnections.map(connection => {
              if (connection.sender.toString() === req.user._id) {
        return connection.receiver;
      } else {
        return connection.sender;
      }
    });

    console.log('Connected doctor IDs:', connectedDoctorIds);

    // Sadece bağlantılı doktorları getir
    const doctors = await User.find({
      _id: { $in: connectedDoctorIds }
    })
    .select('name mainSpecialty subspecialties')
    .sort('name');
    
    console.log('Found connected doctors:', doctors.map(d => ({
      id: d._id,
      name: d.name,
      mainSpecialty: d.mainSpecialty,
      subspecialties: d.subspecialties
    })));

    // Her doktor için bağlantı durumunu kontrol et (hepsi 'connected' olacak)
    const doctorsWithConnectionStatus = doctors.map((doctor) => {
      return {
        _id: doctor._id,
        name: doctor.name,
        mainSpecialty: doctor.mainSpecialty || 'Belirtilmemiş',
        subspecialties: doctor.subspecialties || [],
        connectionStatus: 'connected',
        connectionId: acceptedConnections.find(conn => 
          conn.sender.toString() === doctor._id.toString() || 
          conn.receiver.toString() === doctor._id.toString()
        )?._id
      };
    });

    res.json(doctorsWithConnectionStatus);
  } catch (error) {
    console.error('Doktor getirme hatası:', error);
    res.status(500).json({ message: 'Doktorlar getirilirken bir hata oluştu' });
  }
});

// Tüm doktorları getir (meslektaş listesi için)
app.get('/api/users/all-doctors', authMiddleware, async (req, res) => {
  console.log('=== /api/users/all-doctors route hit ===');
  try {
    // Tüm kullanıcıları getir (kendisi hariç)
    console.log('Current user ID:', req.user._id);
    
    const doctors = await User.find({
      _id: { $ne: req.user._id } // Kendisi hariç
    })
    .select('name mainSpecialty subspecialties avatar city institution bio createdAt')
    .sort('name');
    
    console.log('Found all doctors:', doctors.map(d => ({
      id: d._id,
      name: d.name,
      mainSpecialty: d.mainSpecialty,
      subspecialties: d.subspecialties
    })));

    // Her doktor için bağlantı durumunu kontrol et
    const doctorsWithConnectionStatus = await Promise.all(doctors.map(async (doctor) => {
      const connection = await ColleagueConnection.findOne({
        $or: [
          { sender: req.user._id, receiver: doctor._id },
          { sender: doctor._id, receiver: req.user._id }
        ]
      });

      let connectionStatus = 'none';
      let connectionId = null;
      
      if (connection) {
        connectionId = connection._id;
        if (connection.status === 'accepted') {
          connectionStatus = 'connected';
        } else if (connection.status === 'pending') {
          connectionStatus = connection.sender.toString() === req.user._id ? 'sent' : 'received';
        } else if (connection.status === 'rejected') {
          connectionStatus = 'rejected';
        }
      }

      return {
        _id: doctor._id,
        name: doctor.name,
        mainSpecialty: doctor.mainSpecialty || 'Belirtilmemiş',
        subspecialties: doctor.subspecialties || [],
        avatar: doctor.avatar,
        city: doctor.city,
        institution: doctor.institution,
        bio: doctor.bio,
        createdAt: doctor.createdAt,
        connectionStatus,
        connectionId
      };
    }));

    res.json(doctorsWithConnectionStatus);
  } catch (error) {
    console.error('Doktor getirme hatası:', error);
    res.status(500).json({ message: 'Doktorlar getirilirken bir hata oluştu' });
  }
});

// Meslektaş bağlantı isteği gönder
app.post('/api/colleagues/connect', authMiddleware, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    // Kendine istek göndermeyi engelle
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Kendinize bağlantı isteği gönderemezsiniz' });
    }

    // Alıcının var olduğunu kontrol et
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Alıcı bulunamadı' });
    }

    // Mevcut bağlantıyı kontrol et
    const existingConnection = await ColleagueConnection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ 
        message: 'Bu kullanıcı ile zaten bir bağlantı mevcut',
        status: existingConnection.status
      });
    }

    // Günlük istek limitini kontrol et
    const canSendRequest = await ColleagueConnection.checkDailyRequestLimit(senderId);
    if (!canSendRequest) {
      return res.status(429).json({ 
        message: 'Günlük bağlantı isteği limitine ulaştınız. Lütfen 24 saat sonra tekrar deneyin.'
      });
    }

    // Yeni bağlantı isteği oluştur
    const connection = new ColleagueConnection({
      sender: senderId,
      receiver: receiverId
    });

    await connection.save();

    res.status(201).json({
      message: 'Bağlantı isteği başarıyla gönderildi',
      connection
    });
  } catch (error) {
    console.error('Bağlantı isteği hatası:', error);
    res.status(500).json({ message: 'Bağlantı isteği gönderilirken bir hata oluştu' });
  }
});

// Meslektaş bağlantı isteğini yanıtla
app.put('/api/colleagues/respond', authMiddleware, async (req, res) => {
  try {
    const { connectionId, status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum' });
    }

    const connection = await ColleagueConnection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Bağlantı isteği bulunamadı' });
    }

    // Sadece alıcı yanıt verebilir
    if (connection.receiver.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Bu isteği yanıtlama yetkiniz yok' });
    }

    connection.status = status;
    await connection.save();

    res.json({
      message: `Bağlantı isteği ${status === 'accepted' ? 'kabul edildi' : 'reddedildi'}`,
      connection
    });
  } catch (error) {
    console.error('Bağlantı yanıtlama hatası:', error);
    res.status(500).json({ message: 'Bağlantı isteği yanıtlanırken bir hata oluştu' });
  }
});

// Test endpoint'i - meslektaş bağlantılarını kontrol et
app.get('/api/test/connections', async (req, res) => {
  try {
    const connections = await ColleagueConnection.find()
      .populate('sender', 'name email mainSpecialty')
      .populate('receiver', 'name email mainSpecialty');
    
    res.json({
      totalConnections: connections.length,
      connections: connections
    });
  } catch (error) {
    console.error('Test bağlantı listesi hatası:', error);
    res.status(500).json({ message: 'Test bağlantıları getirilirken bir hata oluştu' });
  }
});

// Meslektaş bağlantılarını getir
app.get('/api/colleagues/connections', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await ColleagueConnection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted'
    })
    .populate('sender', 'name email mainSpecialty subspecialties avatar')
    .populate('receiver', 'name email mainSpecialty subspecialties avatar');

    res.json(connections);
  } catch (error) {
    console.error('Bağlantı listesi hatası:', error);
    res.status(500).json({ message: 'Bağlantılar getirilirken bir hata oluştu' });
  }
});

// Bekleyen arkadaşlık istekleri sayısını getir
app.get('/api/colleagues/pending-count', authMiddleware, async (req, res) => {
  try {
    const pendingCount = await ColleagueConnection.countDocuments({
      receiver: req.user._id,
      status: 'pending'
    });

    res.json({ pendingCount });
  } catch (error) {
    console.error('Bekleyen istek sayısı getirme hatası:', error);
    res.status(500).json({ message: 'Bekleyen istek sayısı getirilirken bir hata oluştu' });
  }
});

// Meslektaş bağlantısını kaldır
app.delete('/api/colleagues/remove/:connectionId', authMiddleware, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user._id;

    const connection = await ColleagueConnection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Bağlantı bulunamadı' });
    }

    // Sadece bağlantının bir parçası olan kullanıcı kaldırabilir
    if (connection.sender.toString() !== userId.toString() && 
        connection.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Bağlantıyı kaldır
    await ColleagueConnection.findByIdAndDelete(connectionId);

    res.json({ message: 'Bağlantı başarıyla kaldırıldı' });
  } catch (error) {
    console.error('Bağlantı kaldırma hatası:', error);
    res.status(500).json({ message: 'Bağlantı kaldırılırken bir hata oluştu' });
  }
});

// Avatar endpoint'leri
app.get('/api/avatars', (req, res) => {
  try {
    // Mevcut avatar dosyalarını listele - try multiple paths
    let avatarsDir = path.join(__dirname, '../public/avatars');
    console.log('=== Avatar Endpoint Debug ===');
    console.log('__dirname:', __dirname);
    console.log('Avatar directory path (attempt 1):', avatarsDir);
    console.log('Directory exists (attempt 1):', fs.existsSync(avatarsDir));
    
    // If first path doesn't work, try alternative paths
    if (!fs.existsSync(avatarsDir)) {
      avatarsDir = path.join(process.cwd(), 'public/avatars');
      console.log('Avatar directory path (attempt 2):', avatarsDir);
      console.log('Directory exists (attempt 2):', fs.existsSync(avatarsDir));
    }
    
    if (!fs.existsSync(avatarsDir)) {
      avatarsDir = path.join(process.cwd(), 'src/../public/avatars');
      console.log('Avatar directory path (attempt 3):', avatarsDir);
      console.log('Directory exists (attempt 3):', fs.existsSync(avatarsDir));
    }
    
    if (!fs.existsSync(avatarsDir)) {
      console.log('Avatar directory not found in any location, returning empty array');
      return res.json({ avatars: [] });
    }
    
    const files = fs.readdirSync(avatarsDir);
    console.log('Files in directory:', files);
    const avatarFiles = files.filter(file => 
      file.toLowerCase().endsWith('.png') || 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg') ||
      file.toLowerCase().endsWith('.svg')
    );
    console.log('Filtered avatar files:', avatarFiles);
    
    res.json({ avatars: avatarFiles });
  } catch (error) {
    console.error('Avatar listesi hatası:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Avatar listesi getirilirken bir hata oluştu' });
  }
});

// Avatar güncelleme endpoint'i
app.put('/api/users/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user._id;
    
    if (!avatar) {
      return res.status(400).json({ message: 'Avatar seçimi zorunludur' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json({ 
      message: 'Avatar başarıyla güncellendi',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Avatar güncelleme hatası:', error);
    res.status(500).json({ message: 'Avatar güncellenirken bir hata oluştu' });
  }
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  
  // Test için meslektaş bağlantısı oluştur
  try {
    const users = await User.find().limit(2);
    if (users.length >= 2) {
      const existingConnection = await ColleagueConnection.findOne({
        $or: [
          { sender: users[0]._id, receiver: users[1]._id },
          { sender: users[1]._id, receiver: users[0]._id }
        ]
      });
      
      if (!existingConnection) {
        const testConnection = new ColleagueConnection({
          sender: users[0]._id,
          receiver: users[1]._id,
          status: 'pending'
        });
        await testConnection.save();
        console.log('Test meslektaş bağlantısı oluşturuldu');
      }
    }
  } catch (error) {
    console.error('Test bağlantısı oluşturma hatası:', error);
  }
}); 

