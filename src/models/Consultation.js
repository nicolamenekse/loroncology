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
