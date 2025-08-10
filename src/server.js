import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import PatientHistory from './models/PatientHistory.js';
import Blog from './models/Blog.js';
import User from './models/User.js';
import Patient from './models/Patient.js';
import { generatePatientAnalysis, generateTreatmentSuggestions, analyzeLaboratoryResults } from './services/aiService.js';
import { generateToken, authMiddleware, requireRole } from './services/authService.js';
import { adminMiddleware } from './middleware/adminMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

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

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

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
    const { email, password, name } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password || !name) {
      console.log('Eksik alanlar:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ message: 'Email, şifre ve isim zorunludur' });
    }

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
      user = await existingUser.save();
      console.log('Existing user updated with new verification token');
    } else {
      // Yeni kullanıcı oluştur
      user = new User({
        email,
        password,
        name,
        emailVerifyTokenHash: tokenHash,
        emailVerifyExpires: tokenExpires
      });
      user = await user.save();
      console.log('New user created');
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
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
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
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgileri getirme hatası:', error);
    res.status(500).json({ message: 'Kullanıcı bilgileri alınırken bir hata oluştu' });
  }
});

// Şifre değiştirme endpoint'i
// Admin Routes
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
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
    if (req.params.id === req.user.id) {
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
    const user = await User.findById(req.user.id);
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
    const userId = req.user.id;
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
    const userId = req.user.id;
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
    const userId = req.user.id;
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Kullanıcının sadece kendi hastalarına erişebilmesini sağla
    if (patient.userId.toString() !== userId) {
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
    
    const userId = req.user.id;
    
    // Önce mevcut hasta bilgilerini al (history için)
    const currentPatient = await Patient.findById(req.params.id);
    if (!currentPatient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Kullanıcının sadece kendi hastalarını güncelleyebilmesini sağla
    if (currentPatient.userId.toString() !== userId) {
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
    const userId = req.user.id;
    
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
    const userId = req.user.id;
    
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
    const userId = req.user.id;
    
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
    const userId = req.user.id;
    
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

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 

