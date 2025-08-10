import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Patient from './models/Patient.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixIndexes = async () => {
  try {
    await connectDB();
    
    console.log('Current indexes before fix:');
    const currentIndexes = await Patient.collection.getIndexes();
    console.log('Indexes:', Object.keys(currentIndexes));
    
    // Try to drop the old global protokolNo index
    try {
      console.log('Attempting to drop old global protokolNo index...');
      await Patient.collection.dropIndex('protokolNo_1');
      console.log('✅ Old global protokolNo index dropped successfully');
    } catch (dropError) {
      console.log('ℹ️ Global protokolNo index not found or already dropped:', dropError.message);
    }
    
    // Create the new compound index
    console.log('Creating new compound index...');
    await Patient.collection.createIndex(
      { userId: 1, protokolNo: 1 },
      { unique: true, name: 'userId_protokolNo_unique' }
    );
    console.log('✅ New compound index created successfully');
    
    // Verify the new indexes
    console.log('\nFinal indexes after fix:');
    const newIndexes = await Patient.collection.getIndexes();
    console.log('Indexes:', Object.keys(newIndexes));
    
    // Check if the old global index is gone
    if (newIndexes.protokolNo_1) {
      console.log('❌ WARNING: Old global protokolNo index still exists!');
    } else {
      console.log('✅ Old global protokolNo index successfully removed');
    }
    
    // Check if the new compound index exists
    if (newIndexes.userId_1_protokolNo_1) {
      console.log('✅ New compound index exists and is active');
    } else {
      console.log('❌ ERROR: New compound index not found!');
    }
    
    console.log('\nIndex fix completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Index fix failed:', error);
    process.exit(1);
  }
};

fixIndexes();
