const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Otp = require('./src/models/Otp');
require('dotenv').config();

// Connect to DB directly to clean up before test
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('DB Connected for Test'))
    .catch(err => console.error(err));

async function testOtpFlow() {
    const testPhone = '9999999998';

    try {
        // Cleanup
        await User.deleteOne({ phone: testPhone });
        await Otp.deleteOne({ phone: testPhone });
        console.log('Cleanup Done');

        // 1. Send OTP
        console.log('1. Sending OTP...');
        await axios.post('http://localhost:5000/api/auth/send-otp', { phone: testPhone });
        console.log('OTP Request Sent');

        // 2. Fetch OTP from DB (Simulating user checking phone)
        // Wait a sec for DB to update
        await new Promise(r => setTimeout(r, 1000));
        const otpRecord = await Otp.findOne({ phone: testPhone });

        if (!otpRecord) {
            throw new Error('OTP not found in DB!');
        }

        const otpCode = otpRecord.otp;
        console.log(`2. OTP Retrieved from DB: ${otpCode}`);

        // 3. Register with OTP
        console.log('3. Registering with OTP...');
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'OTP Test User',
            phone: testPhone,
            password: 'password123',
            otp: otpCode
        });

        console.log('4. Registration Response:', res.status, res.data.message || 'Success');
        console.log('✅ OTP Flow Verification Passed!');

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    } finally {
        await User.deleteOne({ phone: testPhone });
        await Otp.deleteOne({ phone: testPhone });
        mongoose.disconnect();
    }
}

// Allow server to restart before running
setTimeout(testOtpFlow, 2000);
