import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/loronkoloji';

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

// Patient Schema
const patientSchema = new mongoose.Schema({
  protokolNo: { type: String, required: true },
  hastaAdi: { type: String, required: true },
  hastaSahibi: { type: String, required: true },
  tur: { type: String, required: true },
  irk: { type: String, required: true },
  cinsiyet: { type: String, required: true },
  yas: { type: String, required: true },
  kilo: { type: String, required: true },
  vks: { type: Number, required: true },
  anamnez: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now }
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
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(400).json({ message: 'Hasta bilgileri güncellenirken bir hata oluştu' });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Hasta bulunamadı' });
    }
    res.json({ message: 'Hasta başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Hasta silinirken bir hata oluştu' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 