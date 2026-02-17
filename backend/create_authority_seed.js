const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createAuthority = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const phone = 'authority';
        const password = '123456';

        // Check if exists
        const exists = await User.findOne({ phone });
        if (exists) {
            console.log('Authority already exists.');
            process.exit(0);
        }

        await User.create({
            name: 'Sample Authority',
            phone,
            passwordHash: password,
            role: 'authority',
            department: 'Water', // Default dept
            jurisdiction: 'North Zone',
            phoneVerified: true
        });

        console.log('Authority Created Successfully!');
        console.log('Phone:', phone);
        console.log('Password:', password);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAuthority();
