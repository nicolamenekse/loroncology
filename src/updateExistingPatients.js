import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Patient from './models/Patient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loroncology';

async function updateExistingPatients() {
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB\'ye bağlantı başarılı');

    // Mevcut hastaları kontrol et
    const patients = await Patient.find({});
    console.log(`📊 Toplam ${patients.length} hasta bulundu`);

    // isDeleted ve deletedAt alanları eksik olan hastaları bul
    const patientsToUpdate = patients.filter(patient => 
      patient.isDeleted === undefined || patient.deletedAt === undefined
    );

    if (patientsToUpdate.length === 0) {
      console.log('✅ Tüm hastalar zaten güncel');
      return;
    }

    console.log(`🔄 ${patientsToUpdate.length} hasta güncellenecek`);

    // Her hastayı güncelle
    for (const patient of patientsToUpdate) {
      const updateData = {};
      
      if (patient.isDeleted === undefined) {
        updateData.isDeleted = false;
      }
      
      if (patient.deletedAt === undefined) {
        updateData.deletedAt = null;
      }

      await Patient.findByIdAndUpdate(patient._id, updateData);
      console.log(`✅ Hasta güncellendi: ${patient.hastaAdi} (${patient._id})`);
    }

    console.log('🎉 Tüm hastalar başarıyla güncellendi!');

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
updateExistingPatients();
