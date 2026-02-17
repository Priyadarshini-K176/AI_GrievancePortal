require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handle Twilio Form Data
app.use(cors());

// Connect to Database
connectDB();

// Basic Route
app.get('/', (req, res) => {
    res.send('Tamil Nadu Grievance Portal API is running...');
});

// Direct Test Route
app.get('/test-direct', (req, res) => res.send('Direct Route Working'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/grievances', require('./routes/grievanceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/voice', require('./routes/voiceRoute'));
app.use('/api/ai', require('./routes/aiRoutes')); // Local AI
app.use('/api/whatsapp', require('./routes/whatsappRoute')); // WhatsApp Simulation

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
