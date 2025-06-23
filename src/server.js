import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import PatientHistory from './models/PatientHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

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
  } catch (error) {
    // Index yoksa hata olabilir, bu normal
    if (error.code !== 27 && error.codeName !== 'IndexNotFound') {
      console.log('Index temizleme hatası (normal olabilir):', error.message);
    }
  }
});

// Patient Schema
const patientSchema = new mongoose.Schema({
  protokolNo: { type: String, required: true },
  hastaAdi: { type: String, required: true },
  hastaSahibi: { type: String, required: true },
  tur: { type: String, required: true },
  irk: String,
  cinsiyet: String,
  yas: { type: String, required: true },
  kilo: String,
  vks: { type: Number, required: true },
  anamnez: String,
  radyolojikBulgular: String,
  ultrasonografikBulgular: String,
  tomografiBulgular: String,
  patoloji: String,
  mikroskopisi: String,
  patolojikTeshis: String,
  tedavi: String,
  hemogram: String,
  biyokimya: String,
  recete: String,
  biyopsi: {
    iiab: { type: Boolean, default: false },
    tuse: { type: Boolean, default: false },
    trucat: { type: Boolean, default: false },
    operasyon: { type: Boolean, default: false }
  },
  biyopsiNot: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Sunucu hatası oluştu',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Routes
app.post('/api/patients', async (req, res) => {
  try {
    console.log('POST /api/patients - Gelen istek:', req.body);

    // Gelen veriyi kontrol et
    const requiredFields = ['protokolNo', 'hastaAdi', 'hastaSahibi', 'tur', 'yas', 'vks'];
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

    // Protokol numarası benzersiz olmalı
    const existingPatient = await Patient.findOne({ protokolNo: req.body.protokolNo });
    if (existingPatient) {
      console.log('Protokol numarası zaten kullanılıyor:', req.body.protokolNo);
      return res.status(400).json({
        message: 'Bu protokol numarası zaten kullanılıyor'
      });
    }

    // MongoDB bağlantı durumunu kontrol et
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB bağlantısı aktif değil. Durum:', mongoose.connection.readyState);
      return res.status(500).json({
        message: 'Veritabanı bağlantısı aktif değil'
      });
    }

    console.log('Hasta kaydı oluşturuluyor...');
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    console.log('Hasta kaydı başarıyla oluşturuldu:', savedPatient);
    
    res.status(201).json({ 
      message: 'Hasta kaydı başarıyla oluşturuldu', 
      patient: savedPatient 
    });
  } catch (error) {
    console.error('Hasta kaydı hatası:', error);
    
    // MongoDB bağlantı hatası kontrolü
    if (error.name === 'MongoServerError') {
      console.error('MongoDB sunucu hatası:', error.message);
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

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    console.log('Hastalar getiriliyor...');
    const patients = await Patient.find().sort({ createdAt: -1 });
    console.log(`${patients.length} hasta bulundu`);
    res.json(patients);
  } catch (error) {
    console.error('Hastalar getirme hatası:', error);
    res.status(500).json({ 
      message: 'Hastalar getirilirken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Hasta bilgileri yüklenirken bir hata oluştu' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    console.log('PUT /api/patients/:id - Hasta güncelleniyor:', req.params.id);
    
    // Önce mevcut hasta bilgilerini al (history için)
    const currentPatient = await Patient.findById(req.params.id);
    if (!currentPatient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
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
      modifiedBy: req.body.modifiedBy || 'System User'
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

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    
    // Hasta silindiğinde history kayıtlarını da sil
    await PatientHistory.deleteMany({ patientId: req.params.id });
    console.log('Hasta ve geçmiş kayıtları silindi:', req.params.id);
    
    res.json({ message: 'Hasta başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Hasta silinirken bir hata oluştu' });
  }
});

// Health check endpoint
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

