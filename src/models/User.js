import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'doctor'],
    default: 'doctor'
  },
  mainSpecialty: {
    type: String,
    enum: [
      'Temel Bilimler',
      'Klinik Bilimler',
      'Hayvan Türüne Göre Uzmanlıklar',
      'Saha ve Üretim Branşları',
      'Araştırma & Akademik Alanlar'
    ],
    required: false // Changed from required function to false to allow registration without specialty
  },
  subspecialties: [{
    type: String,
    enum: [
      // Temel Bilimler
      'Anatomi',
      'Histoloji & Embriyoloji',
      'Fizyoloji',
      'Biyokimya',
      'Mikrobiyoloji',
      'Parazitoloji',
      'Patoloji',
      'Farmakoloji & Toksikoloji',
      'Genetik',
      'Biyometri / İstatistik',
      'Veteriner Halk Sağlığı',
      'Besin Hijyeni ve Teknolojisi',

      // Klinik Bilimler
      'İç Hastalıkları (Small animal)',
      'İç Hastalıkları (Large animal)',
      'Cerrahi (Yumuşak doku)',
      'Cerrahi (Ortopedi)',
      'Cerrahi (Travmatoloji)',
      'Doğum ve Jinekoloji',
      'Anesteziyoloji & Reanimasyon',
      'Radyoloji & Görüntüleme',
      'Oftalmoloji',
      'Dermatoloji',
      'Onkoloji',
      'Dentoloji',
      'Kardiyoloji',
      'Nöroloji',
      'Egzotik Hayvan Hastalıkları',

      // Hayvan Türüne Göre Uzmanlıklar
      'Küçük Hayvan Hekimliği',
      'Büyük Hayvan Hekimliği',
      'Kanatlı Hayvan Hekimliği',
      'Su Ürünleri Hekimliği',
      'Yaban Hayatı ve Hayvanat Bahçesi Hekimliği',

      // Saha ve Üretim Branşları
      'Hayvan Besleme ve Beslenme Hastalıkları',
      'Zootekni',
      'Epidemiyoloji',
      'Suni Tohumlama ve Embriyo Transferi',
      'Çiftlik Yönetimi ve Hayvan Refahı',
      'Veteriner Halk Sağlığı ve Zoonozlar',

      // Araştırma & Akademik Alanlar
      'Veteriner Biyoteknoloji',
      'Veteriner Farmasötik Araştırmalar',
      'Hayvan Davranışları (Etoloji)',
      'Veteriner Eğitim Teknolojileri'
    ]
  }],
  profileCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifyTokenHash: {
    type: String,
    default: null
  },
  emailVerifyExpires: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: 'default-avatar.svg' // Varsayılan avatar
  }
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema, 'users');

export default User;
