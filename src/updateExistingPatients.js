import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Patient from './models/Patient.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

const updateExistingPatients = async () => {
  try {
    console.log('Mevcut hastalar güncelleniyor...');
    
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
      console.log('Güncellenecek hasta bulunamadı');
      return;
    }
    
    let updatedCount = 0;
    
    for (const patient of patientsToUpdate) {
      try {
        // Get user information
        const user = await User.findById(patient.userId);
        if (!user) {
          console.log(`Kullanıcı bulunamadı: ${patient.userId} (Hasta: ${patient.hastaAdi})`);
          continue;
        }
        
        // Update patient with doctor information
        await Patient.findByIdAndUpdate(patient._id, {
          doctorName: user.name,
          doctorEmail: user.email
        });
        
        console.log(`Hasta güncellendi: ${patient.hastaAdi} -> Doktor: ${user.name}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`Hasta güncellenirken hata: ${patient._id}`, error);
      }
    }
    
    console.log(`\nGüncelleme tamamlandı! ${updatedCount} hasta güncellendi.`);
    
  } catch (error) {
    console.error('Güncelleme hatası:', error);
  }
};

const main = async () => {
  try {
    await connectDB();
    await updateExistingPatients();
    process.exit(0);
  } catch (error) {
    console.error('Ana hata:', error);
    process.exit(1);
  }
};

main();
