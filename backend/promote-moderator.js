const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salonbook')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  gender: String,
  emailVerified: Boolean,
  region: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Promote user to moderator
async function promoteToModerator(email, region) {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('Please register first at http://localhost:3000/register');
      process.exit(1);
    }

    user.role = 'moderator';
    user.region = region;
    await user.save();

    console.log('✅ User promoted to moderator successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('📍 Region:', user.region);
    console.log('\nYou can now login at http://localhost:3000/login');
    console.log('Then access moderator panel at http://localhost:3000/moderator');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email and region from command line arguments
const email = process.argv[2];
const region = process.argv[3];

if (!email || !region) {
  console.log('Usage: node promote-moderator.js <email> <region>');
  console.log('Example: node promote-moderator.js moderator@example.com Mumbai');
  process.exit(1);
}

promoteToModerator(email, region);
