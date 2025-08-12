import mongoose from 'mongoose';

const colleagueConnectionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
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

// Aynı kullanıcılar arasında tekrar eden bağlantı olmaması için index
colleagueConnectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Güncelleme tarihini otomatik güncelle
colleagueConnectionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Kullanıcının son 24 saat içinde gönderdiği istek sayısını kontrol et
colleagueConnectionSchema.statics.checkDailyRequestLimit = async function(userId) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await this.countDocuments({
    sender: userId,
    createdAt: { $gte: oneDayAgo }
  });
  return count < 3; // Günlük limit 3
};

const ColleagueConnection = mongoose.model('ColleagueConnection', colleagueConnectionSchema);

export default ColleagueConnection;
