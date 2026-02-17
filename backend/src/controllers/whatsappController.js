const Grievance = require('../models/Grievance');
const User = require('../models/User');
const { runPythonScript, processImageWithGemini, runPrediction } = require('./aiController');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Helper: Download Image from Twilio URL
async function downloadTwilioImage(url) {
    const auth = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ? { username: process.env.TWILIO_ACCOUNT_SID, password: process.env.TWILIO_AUTH_TOKEN }
        : null;

    const response = await axios({
        url,
        responseType: 'stream',
        auth // Twilio auto-protects media, so we need keys
    });

    const filename = `twilio-${Date.now()}.jpg`;
    const filepath = path.join(__dirname, '../../uploads', filename);
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filepath));
        writer.on('error', reject);
    });
}

// @desc    Simulate/Handle WhatsApp Message
// @route   POST /api/whatsapp/webhook
// @access  Public (Simulated + Twilio)
const handleWhatsAppMessage = async (req, res) => {
    try {
        console.log("📩 WhatsApp Webhook Received Body:", req.body);

        let { from, type, text } = req.body;
        let imagePath = req.file ? req.file.path : null;

        // --- Twilio Adapter ---
        if (req.body.From && req.body.From.includes('whatsapp:')) {
            console.log("⚡ Detected Twilio Request");
            from = req.body.From.replace('whatsapp:', '');
            text = req.body.Body;
            type = 'text';

            if (req.body.NumMedia && parseInt(req.body.NumMedia) > 0) {
                type = 'image';
                const mediaUrl = req.body.MediaUrl0;
                console.log("📥 Downloading Twilio Image:", mediaUrl);
                imagePath = await downloadTwilioImage(mediaUrl);
            }
        }
        // ----------------------

        if (!from) return res.status(400).json({ error: "Missing 'from' number" });

        // 1. Find or Create Dummy Citizen (Simulated)
        let user = await User.findOne({ phone: from });

        if (!user) {
            try {
                // Create a dummy user for WhatsApp if not exists
                user = await User.create({
                    name: "WhatsApp Citizen",
                    phone: from, // Used as unique identifier
                    passwordHash: "dummy_password_hash", // Schema expects passwordHash
                    role: "citizen"
                });
            } catch (err) {
                console.error("User Create Failed:", err.message);
                // If it failed because it exists (race condition), try find again
                if (err.code === 11000) {
                    user = await User.findOne({ phone: from });
                }
            }
        }

        if (!user) {
            return res.status(500).json({ error: "Failed to resolve citizen user." });
        }

        let grievanceData = {
            citizenId: user._id,
            title: "WhatsApp Grievance",
            text: text || "Image Grievance", // Required field 'text' mapped
            description: text || "No description provided",
            source: "WhatsApp",
            petitionerDetails: { phone: from },
            status: "Registered",
            // Required Location Fields (Default to 'Unknown' or 'General' for WhatsApp)
            jurisdiction: "Zone 1 (Default)",
            area: "WhatsApp Entry"
        };

        // 2. Process Content
        if (type === 'image' && imagePath) {
            const filePath = imagePath;

            // Step A: Run AI Analysis (Vision) to get Category
            let aiResult = { category: "General", description: "" };
            try {
                aiResult = await runPythonScript('vision_lite.py', [filePath]);
            } catch (e) {
                console.error("Vision Lite failed:", e.message);
            }

            // Step B: Run Gemini to get detailed text/description and DETAILS
            let geminiResult = { text: "", petitioner_name: "", address: "", jurisdiction: "" };
            let mlCategory = "Other";

            try {
                console.log("🤖 Asking Gemini to describe/read image...");
                // Now returns JSON object { text, petitioner_name, address, jurisdiction }
                geminiResult = await processImageWithGemini(filePath);

                // Step C: Run Custom ML Model on Extracted Text
                if (geminiResult.text && geminiResult.text.length > 5) {
                    try {
                        console.log("🧠 Running Custom ML Model on text...");
                        const mlPrediction = await runPrediction(geminiResult.text);
                        if (mlPrediction.department) mlCategory = mlPrediction.department;
                        console.log("✅ Custom ML Predicted:", mlCategory);
                    } catch (e) {
                        console.error("Custom ML Prediction failed:", e.message);
                    }
                }

            } catch (err) {
                console.error("Gemini conversion failed for WhatsApp:", err.message);
                geminiResult.text = "Could not verify image content.";
            }

            // Priority: Custom ML > Visual AI > Default
            const finalCategory = (mlCategory !== "Other" && mlCategory !== "Unknown")
                ? mlCategory
                : (aiResult.category && aiResult.category !== "General" ? aiResult.category : "Other");

            grievanceData.description = `[WhatsApp Image Message]\n\n📄 **AI Reading:**\n${geminiResult.text}\n\n🧠 **ML Category:** ${mlCategory}\n🔍 **Visual Object:** ${aiResult.description || "Image attached"}`;
            grievanceData.currentDepartment = finalCategory;
            grievanceData.photo = filePath;

            // Auto-Fill Details from Gemini JSON
            if (geminiResult.petitioner_name) grievanceData.petitionerDetails.name = geminiResult.petitioner_name;
            if (geminiResult.address) grievanceData.petitionerDetails.address = geminiResult.address;
            if (geminiResult.jurisdiction) {
                grievanceData.jurisdiction = geminiResult.jurisdiction;
                grievanceData.area = geminiResult.jurisdiction; // Map area too
            }

        } else if (type === 'text') {
            // Run Custom ML on Text Message too!
            try {
                const mlPrediction = await runPrediction(text);
                if (mlPrediction.department) grievanceData.currentDepartment = mlPrediction.department;
            } catch (e) {
                console.error("ML Prediction failed for text:", e.message);
            }
        }

        // 3. Create Grievance
        const grievance = await Grievance.create(grievanceData);

        // 4. Respond like a Bot
        const botResponse = `✅ *Grievance Registered!* \n\n🆔 ID: ${grievance.grievanceId}\n📂 Category: ${grievance.currentDepartment}\n\nWe have received your complaint. You can track it on the portal using your mobile number.`;

        res.json({
            success: true,
            response: botResponse,
            grievanceId: grievance.grievanceId
        });

    } catch (error) {
        console.error("WhatsApp Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { handleWhatsAppMessage };
