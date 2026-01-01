const mongoose = require('mongoose');
require('dotenv').config();

const salonSchema = new mongoose.Schema({
  approvalStatus: String,
}, { strict: false });

const Salon = mongoose.model('Salon', salonSchema);

async function approveAllSalons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-booking');
    console.log('Connected to MongoDB');

    const result = await Salon.updateMany(
      { approvalStatus: { $in: ['pending', null] } },
      { $set: { approvalStatus: 'approved' } }
    );

    console.log(`✅ Approved ${result.modifiedCount} salons`);
    
    const allSalons = await Salon.find({});
    console.log(`\nTotal salons in database: ${allSalons.length}`);
    console.log('Approval status breakdown:');
    console.log('- Approved:', allSalons.filter(s => s.approvalStatus === 'approved').length);
    console.log('- Pending:', allSalons.filter(s => s.approvalStatus === 'pending').length);
    console.log('- Rejected:', allSalons.filter(s => s.approvalStatus === 'rejected').length);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

approveAllSalons();
