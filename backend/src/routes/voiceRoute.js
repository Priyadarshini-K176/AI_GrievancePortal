const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ status: "Voice route is working" });
});
router.post("/voice-to-text", upload.single("audio"), async (req, res) => {
    // TEMPORARY DEBUG LOG
    console.log("DEBUG: API Key exists?", !!process.env.ASSEMBLYAI_API_KEY);
    console.log("DEBUG: Key Length:", process.env.ASSEMBLYAI_API_KEY?.length);
});
// ... rest of your code
// Translate Tamil to English using Google Translate
async function translateTamilToEnglish(tamilText) {
    try {
        if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
            console.log("⚠️  Google Translate API key not set. Skipping translation.");
            return ""; // Will be empty if not translated
        }

        console.log("🌐 Translating Tamil to English...");

        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2`,
            {
                q: tamilText,
                source_language: "ta",
                target_language: "en"
            },
            {
                params: {
                    key: process.env.GOOGLE_TRANSLATE_API_KEY
                }
            }
        );

        const englishText = response.data.data.translations[0].translatedText;
        console.log("✅ Translation complete!");
        console.log("📝 English:", englishText);
        return englishText;
    } catch (error) {
        console.error("⚠️  Translation failed:", error.message);
        return ""; // Return empty if translation fails
    }
}

// Classify grievance category based on keywords
function classifyCategory(text) {
    const lowerText = text.toLowerCase();

    const categories = {
        "Water": ["water", "தண்ணீர்", "tap", "pipe", "leak", "supply", "well"],
        "Roads": ["road", "சாலை", "pothole", "street", "pavement", "asphalt", "highway"],
        "Electricity": ["electricity", "மின்சாரம்", "power", "light", "bulb", "wire", "outage"],
        "Sanitation": ["sanitation", "சுகாதாரம்", "garbage", "waste", "dustbin", "toilet", "sewage"],
        "General": []
    };

    for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                console.log(`✅ Category detected: ${category}`);
                return category;
            }
        }
    }

    console.log("✅ Category: General (default)");
    return "General";
}

// Upload audio file to AssemblyAI
async function uploadToAssemblyAI(filePath, apiKey) {
    try {
        console.log("📄 Reading audio file:", filePath);
        const audioData = fs.readFileSync(filePath);
        console.log("✅ File read successfully:", audioData.length, "bytes");

        console.log("📤 Uploading to AssemblyAI...");
        const response = await axios.post(
            "https://api.assemblyai.com/v2/upload",
            audioData,
            {
                headers: {
                    "authorization": apiKey,
                    "content-type": "application/octet-stream",
                },
            }
        );
        console.log("✅ Upload successful:", response.data.upload_url);
        return response.data.upload_url;
    } catch (error) {
        console.error("❌ Upload failed:", error.message);
        if (error.response?.data) {
            console.error("Response:", error.response.data);
        }
        throw error;
    }
}

// Voice to text transcription
router.post("/voice-to-text", upload.single("audio"), async (req, res) => {
    // TEMPORARY DEBUG LOG
    console.log("DEBUG: API Key exists?", !!process.env.ASSEMBLYAI_API_KEY);
    console.log("DEBUG: Key Length:", process.env.ASSEMBLYAI_API_KEY?.length);

    try {
        console.log("\n" + "=".repeat(60));
        console.log("🎤 VOICE REQUEST RECEIVED");
        console.log("File received:", req.file ? "YES" : "NO");

        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }

        console.log("  - Path:", req.file.path);
        console.log("  - Size:", req.file.size);

        const filePath = req.file.path;

        // 1. Upload to AssemblyAI
        console.log("\n📤 Uploading to AssemblyAI...");
        const uploadUrl = await uploadToAssemblyAI(filePath, process.env.ASSEMBLYAI_API_KEY);
        console.log("✅ Uploaded. URL:", uploadUrl);

        // 2. Request transcription (Tamil)
        console.log("\n📝 Requesting transcription (Tamil)...");
        const transcriptRes = await axios.post(
            "https://api.assemblyai.com/v2/transcript",
            {
                audio_url: uploadUrl,
                speech_models: ["universal-3-pro", "universal-2"],  // Both models support Tamil
                language_code: "ta"  // Tamil
            },
            { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
        );

        const transcriptId = transcriptRes.data.id;
        console.log("✅ Transcription request created. ID:", transcriptId);

        // 3. Poll for completion
        console.log("\n⏳ Polling for transcription (max 2 min)...");
        let completed = false;
        let transcriptText = "";
        let pollCount = 0;

        while (pollCount < 120 && !completed) {
            pollCount++;

            const checkRes = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
            );

            const status = checkRes.data.status;

            if (status === "completed") {
                completed = true;
                transcriptText = checkRes.data.text || "";
                console.log("✅ Transcription complete!");
                console.log("📄 Text:", transcriptText);
            } else if (status === "failed" || status === "error") {
                console.error("❌ Transcription failed!");
                console.error("Error details:", checkRes.data.error || checkRes.data);
                throw new Error("Transcription failed: " + (checkRes.data.error || "Unknown error"));
            } else {
                if (pollCount % 5 === 0) {
                    console.log(`  Poll ${pollCount}: ${status}`);
                }
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        if (!completed) {
            throw new Error("Transcription timeout");
        }

        // Clean up
        fs.unlinkSync(filePath);
        console.log("🗑️  Temp file deleted");

        // 4. Translate to English
        const englishText = await translateTamilToEnglish(transcriptText);

        // 5. [NEW] Local AI Entity Extraction (Spacy)
        // Spawning the python script directly here or using the helper from aiController
        // Let's implement the spawn logic here for simplicity or require it

        let entities = {};
        try {
            const { spawn } = require('child_process');
            const path = require('path');

            const runNer = (text) => new Promise((resolve) => {
                const process = spawn('python', [path.join(__dirname, '../../ml/ner_lite.py'), text]);
                let data = '';
                process.stdout.on('data', d => data += d);
                process.on('close', () => {
                    try { resolve(JSON.parse(data)); } catch { resolve({}); }
                });
            });

            console.log("🧠 Running Local AI (Spacy NER)...");
            entities = await runNer(englishText || transcriptText);
            console.log("✅ Entities Extracted:", entities);

        } catch (e) {
            console.error("NER Failed:", e);
        }

        // 6. Classify category (Keep existing logic or use AI)
        console.log("\n📂 Classifying category...");
        const category = classifyCategory(englishText || transcriptText);

        console.log("=".repeat(60) + "\n");

        res.json({
            tamil: transcriptText,
            english: englishText,
            category: category,
            jurisdiction: entities.jurisdiction || "General",
            area: entities.all_locations?.[0] || "",
            entities: entities
        });

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.error("Message:", error.message);
        if (error.response?.data) {
            console.error("API Response:", error.response.data);
        }
        console.error("=".repeat(60) + "\n");

        // Try to cleanup
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }

        res.status(500).json({ error: error.message || "Transcription failed" });
    }
});

module.exports = router;