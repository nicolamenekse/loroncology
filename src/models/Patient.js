import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  protokolNo: {
    type: String,
    required: true,
    unique: true,
  },
  hastaAdi: {
    type: String,
    required: true,
  },
  hastaSahibi: {
    type: String,
    required: true,
  },
  tur: {
    type: String,
    enum: ['Kedi', 'Köpek'],
    required: true,
  },
  irk: {
    type: String,
    required: true,
  },
  cinsiyet: {
    type: String,
    enum: ['Erkek', 'Dişi'],
    required: true,
  },
  yas: {
    type: Number,
    required: true,
  },
  kilo: {
    type: Number,
    required: true,
  },
  vks: {
    type: Number,
    required: true,
    min: 1,
    max: 9,
  },
  anamnez: {
    type: String,
    required: true,
  },
  radyolojikBulgular: {
    type: String,
  },
  ultrasonografikBulgular: {
    type: String,
  },
  tomografiBulgular: {
    type: String,
  },
  patoloji: {
    type: String,
  },
  mikroskopisi: {
    type: String,
  },
  patolojikTeshis: {
    type: String,
  },
  tedavi: {
    type: String,
  },
  hemogram: {
    type: String,
  },
  biyokimya: {
    type: String,
  },
  recete: {
    type: String,
  },
  biyopsi: {
    iiab: { type: Boolean, default: false },
    tuse: { type: Boolean, default: false },
    trucat: { type: Boolean, default: false },
    operasyon: { type: Boolean, default: false }
  },
  biyopsiNot: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient; 