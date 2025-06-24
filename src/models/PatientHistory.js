import mongoose from 'mongoose';

const patientHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  // Değişiklik yapılmadan önceki hasta bilgilerinin tamamı
  previousData: {
    protokolNo: String,
    hastaAdi: String,
    hastaSahibi: String,
    tur: String,
    irk: String,
    cinsiyet: String,
    yas: String,
    kilo: String,
    vks: Number,
    anamnez: String,
    radyolojikBulgular: String,
    ultrasonografikBulgular: String,
    tomografiBulgular: String,
    patoloji: String,
    mikroskopisi: String,
    patolojikTeshis: String,
    tedavi: String,
    hemogram: {
      WBC: String,
      'Neu#': String,
      'Lym#': String,
      'Mon#': String,
      'Eos#': String,
      'Neu%': String,
      'Lym%': String,
      'Mon%': String,
      'Eos%': String,
      RBC: String,
      HGB: String,
      HCT: String,
      MCV: String,
      MCH: String,
      MCHC: String,
      'RDW-CV': String,
      'RDW-SD': String,
      PLT: String,
      MPV: String,
      PDW: String,
      PCT: String
    },
    biyokimya: {
      TP: String,
      ALB: String,
      GLD: String,
      'A/G': String,
      TBIL: String,
      ALT: String,
      AST: String,
      'AST/ALT': String,
      GGT: String,
      ALP: String,
      TBA: String,
      CK: String,
      AMY: String,
      TG: String,
      CHOL: String,
      GLU: String,
      CRE: String,
      BUN: String,
      'BUN/CRE': String,
      tCO2: String,
      Ca: String,
      P: String,
      'Ca*P': String,
      Mg: String
    },
    recete: String,
    biyopsi: {
      iiab: Boolean,
      tuse: Boolean,
      trucat: Boolean,
      operasyon: Boolean,
    },
    biyopsiNot: String,
  },
  // Değişiklik yapan kullanıcı bilgisi (gelecekte auth eklenirse)
  modifiedBy: {
    type: String,
    default: 'System User'
  },
  // Değişiklik nedeni/açıklaması
  changeReason: {
    type: String,
    default: 'Düzenleme yapıldı'
  },
  // Değişiklik tarihi
  changeDate: {
    type: Date,
    default: Date.now
  },
  // Değişiklik versiyonu
  version: {
    type: Number,
    required: true
  }
});

// Index'ler - hızlı sorgulama için
patientHistorySchema.index({ patientId: 1, changeDate: -1 });
patientHistorySchema.index({ patientId: 1, version: -1 });

const PatientHistory = mongoose.model('PatientHistory', patientHistorySchema);

export default PatientHistory; 