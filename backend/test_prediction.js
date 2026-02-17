const axios = require('axios');

async function testPrediction() {
    try {
        const text = "There is a severe water leakage in my street pipeline.";
        console.log(`Sending prediction request for: "${text}"`);

        // Assuming backend running on 5000 and we need auth token?
        // Wait, the route is protected. I need a token.
        // I can login first or mock the request if I can run it internally.
        // Actually, integration test is better.
        // I'll try to login first.

        // Login as a user (if one exists) or create one.
        // I see `test_register.js` in file list. Maybe use that user?
        // Let's try to login as a test user.

        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            phone: '9999999999', // Test User
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Logged in, token received.');

        const res = await axios.post('http://localhost:5001/api/grievances/predict-category',
            { text },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Prediction Result:', res.data);
    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testPrediction();
