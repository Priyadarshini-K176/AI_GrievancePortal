const axios = require('axios');

const testGrievanceFlow = async () => {
    try {
        // 0. Register (ignore if exists, but better to use random)
        const rand = Math.floor(Math.random() * 10000);
        const phone = '888' + rand;
        console.log('Registering user', phone);
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Fresh User',
                phone: phone,
                password: 'password123'
            });
        } catch (e) {
            console.log('Register skipped/failed', e.message);
        }

        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            phone: phone,
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Got Token:', token);

        // 2. Submit Grievance
        console.log('Submitting Grievance...');
        const grievanceRes = await axios.post('http://localhost:5000/api/grievances', {
            text: 'Test Grievance from Script',
            category: 'Water'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Grievance Submitted:', grievanceRes.data);

    } catch (err) {
        console.error('Error Step:', err.config?.url);
        console.error('Status:', err.response?.status);
        console.error('Data:', JSON.stringify(err.response?.data, null, 2));
        if (!err.response) console.error('Error Message:', err.message);
    }
};

testGrievanceFlow();
