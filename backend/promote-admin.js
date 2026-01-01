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

// Promote user to admin
async function promoteToAdmin(email) {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('Please register first at http://localhost:3000/register');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log('✅ User promoted to admin successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('\nYou can now login at http://localhost:3000/login');
    console.log('Then access admin dashboard at http://localhost:3000/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node promote-admin.js <email>');
  console.log('Example: node promote-admin.js admin@salonbook.com');
  process.exit(1);
}

promoteToAdmin(email);
