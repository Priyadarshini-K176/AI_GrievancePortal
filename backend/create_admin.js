const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const adminPhone = 'admin12345'; // Simple phone for admin
        const adminPassword = 'adminpassword';

        // Check if exists
        const exists = await User.findOne({ phone: adminPhone });
        if (exists) {
            console.log('Admin already exists.');
            console.log('Phone:', adminPhone);
            console.log('Password:', adminPassword);
            process.exit(0);
        }

        const admin = await User.create({
            name: 'Super Admin',
            phone: adminPhone,
            passwordHash: adminPassword, // Pre-save hook will hash this
            role: 'admin',
            phoneVerified: true
        });

        console.log('Admin Created Successfully!');
        console.log('Phone:', admin.phone);
        console.log('Password:', adminPassword);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
