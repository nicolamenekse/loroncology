import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  senderDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String
  },
  treatment: {
    type: String
  },
  attachments: [{
    type: String // Base64 formatında dosyalar için
  }],
  // Her doktor için ayrı silme ve arşivleme durumu
  senderDeleted: {
    type: Boolean,
    default: false
  },
  receiverDeleted: {
    type: Boolean,
    default: false
  },
  senderArchived: {
    type: Boolean,
    default: false
  },
  receiverArchived: {
    type: Boolean,
    default: false
  },
  // Silme tarihleri (30 gün sonra kalıcı silme için)
  senderDeletedAt: {
    type: Date
  },
  receiverDeletedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

consultationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation;
