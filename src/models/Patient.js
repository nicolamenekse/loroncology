import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  doctorEmail: {
    type: String,
    required: true,
  },
  protokolNo: {
    type: String,
    required: true,
    // unique: true, // Removed global uniqueness
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
    WBC: { type: String, default: '' },
    'Neu#': { type: String, default: '' },
    'Lym#': { type: String, default: '' },
    'Mon#': { type: String, default: '' },
    'Eos#': { type: String, default: '' },
    'Neu%': { type: String, default: '' },
    'Lym%': { type: String, default: '' },
    'Mon%': { type: String, default: '' },
    'Eos%': { type: String, default: '' },
    RBC: { type: String, default: '' },
    HGB: { type: String, default: '' },
    HCT: { type: String, default: '' },
    MCV: { type: String, default: '' },
    MCH: { type: String, default: '' },
    MCHC: { type: String, default: '' },
    'RDW-CV': { type: String, default: '' },
    'RDW-SD': { type: String, default: '' },
    PLT: { type: String, default: '' },
    MPV: { type: String, default: '' },
    PDW: { type: String, default: '' },
    PCT: { type: String, default: '' }
  },
  biyokimya: {
    TP: { type: String, default: '' },
    ALB: { type: String, default: '' },
    GLD: { type: String, default: '' },
    'A/G': { type: String, default: '' },
    TBIL: { type: String, default: '' },
    ALT: { type: String, default: '' },
    AST: { type: String, default: '' },
    'AST/ALT': { type: String, default: '' },
    GGT: { type: String, default: '' },
    ALP: { type: String, default: '' },
    TBA: { type: String, default: '' },
    CK: { type: String, default: '' },
    AMY: { type: String, default: '' },
    TG: { type: String, default: '' },
    CHOL: { type: String, default: '' },
    GLU: { type: String, default: '' },
    CRE: { type: String, default: '' },
    BUN: { type: String, default: '' },
    'BUN/CRE': { type: String, default: '' },
    tCO2: { type: String, default: '' },
    Ca: { type: String, default: '' },
    P: { type: String, default: '' },
    'Ca*P': { type: String, default: '' },
    Mg: { type: String, default: '' }
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
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

// Add compound index for user-specific uniqueness of protokolNo
patientSchema.index({ userId: 1, protokolNo: 1 }, { unique: true });

// Soft delete method
patientSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
patientSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Override find to exclude deleted patients by default
patientSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

// Find deleted patients
patientSchema.statics.findDeleted = function(filter = {}) {
  return this.find({ ...filter, isDeleted: true });
};

// Count deleted patients
patientSchema.statics.countDeleted = function(filter = {}) {
  return this.countDocuments({ ...filter, isDeleted: true });
};

const Patient = mongoose.model('Patient', patientSchema);

export default Patient; 