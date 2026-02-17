const axios = require('axios');

const sendSms = async (phone, otp) => {
    // 1. Check if an SMS Provider is configured in .env
    const provider = process.env.SMS_PROVIDER; // e.g., 'FAST2SMS', 'TWILIO'

    console.log(`\n[SMS SERVICE] Preparing to send OTP: ${otp} to ${phone}`);

    if (provider === 'FAST2SMS') {
        // Implementation for Fast2SMS
        const apiKey = process.env.FAST2SMS_API_KEY;
        if (!apiKey) {
            console.error('[SMS SERVICE] Fast2SMS API Key missing!');
            return false;
        }
        try {
            // URL and Payload depends on provider documentation
            // Example for Fast2SMS (Bulk V2)
            const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                params: {
                    authorization: apiKey,
                    variables_values: otp,
                    route: 'otp',
                    numbers: phone
                }
            });
            console.log('[SMS SERVICE] Fast2SMS Response:', response.data);
            return true;
        } catch (error) {
            console.error('[SMS SERVICE] Failed to send SMS:', error.message);
            return false;
        }
    }

    // ... Add other providers (Twilio, Msg91) here as needed ...

    // 2. Default: Mock SMS (Log to Console)
    // This runs if no provider is set OR if provider logic falls through
    console.log('================================================');
    console.log(` 📱 [MOCK SMS] SENT TO ${phone}`);
    console.log(` 🔑 OTP: ${otp} `);
    console.log('================================================\n');
    return true;
};

module.exports = { sendSms };
