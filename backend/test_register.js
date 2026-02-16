const axios = require('axios');

const register = async () => {
    try {
        console.log('Sending registration request...');
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Node User',
            phone: '9999999999',
            password: 'password123'
        });
        console.log('Response:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
};

register();
