const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Helper to run Python script
const runPythonScript = (scriptName, args) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../../ml', scriptName);
        console.log(`🚀 Spawning Python: ${scriptName} with args: ${args}`);

        const pythonProcess = spawn('python', [scriptPath, ...args]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[${scriptName}] Stderr: ${data}`);
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            console.log(`[${scriptName}] Exited with code ${code}`);
            if (code !== 0) {
                return reject(new Error(`Process failed: ${errorString || 'Unknown error'}`));
            }
            try {
                // Find the JSON part of the output (in case there are print logs)
                const jsonStart = dataString.indexOf('{');
                const jsonEnd = dataString.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonStr = dataString.substring(jsonStart, jsonEnd + 1);
                    resolve(JSON.parse(jsonStr));
                } else {
                    resolve({ raw: dataString.trim() }); // Fallback
                }
            } catch (err) {
                reject(new Error(`Failed to parse JSON: ${err.message}`));
            }
        });
    });
};

// @desc    Analyze Image (YOLOv8)
// @route   POST /api/ai/analyze-image
// @access  Private
const analyzeImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const imagePath = req.file.path;
        console.log(`🖼️ Analyzing Image: ${imagePath}`);

        const result = await runPythonScript('vision_lite.py', [imagePath]);
        console.log("✅ Analysis Result:", JSON.stringify(result).substring(0, 100) + "...");

        res.json(result);
    } catch (error) {
        console.error("❌ Image Analysis Failed:", error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Extract Entities from Text (Spacy)
// @route   POST /api/ai/extract-entities
// @access  Private
const extractEntities = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        console.log(`📝 Extracting Entities from: "${text.substring(0, 50)}..."`);
        const result = await runPythonScript('ner_lite.py', [text]);
        res.json(result);
    } catch (error) {
        console.error("❌ Entity Extraction Failed:", error);
        res.status(500).json({ error: error.message });
    }
};

// Helper: Process Image with Gemini (Reusable)
const processImageWithGemini = async (imagePath) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in .env file");
    }

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const fs = require("fs");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // "gemini-flash-latest" worked (detected) but was overloaded.
    // "gemini-1.5-flash" was 404 (not found).
    // So we stick to "gemini-flash-latest" with Retry.
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    function fileToGenerativePart(path, mimeType) {
        return {
            inlineData: {
                data: fs.readFileSync(path).toString("base64"),
                mimeType
            },
        };
    }

    const imagePart = fileToGenerativePart(imagePath, "image/jpeg");
    // Updated Prompt for Structured JSON Extraction
    const prompt = `
    Extract data from this grievance letter. 
    Return ONLY a valid JSON object (no markdown, no extra text) with this structure:
    {
        "text": "Full text content of the letter...",
        "petitioner_name": "Name of the person (if found)",
        "address": "Address or Street Name (if found)",
        "jurisdiction": "City, Town, or Village Name (if found)"
    }
    `;

    // Retry Logic for 503 Errors
    let retries = 3;
    while (retries > 0) {
        try {
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Cleanup JSON if Gemini adds markdown blocks
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr); // Return Object, not just text

        } catch (error) {
            if (error.message.includes('503') || error.message.includes('overloaded')) {
                console.warn(`⚠️ Gemini Overloaded (503). Retrying... (${retries} left)`);
                retries--;
                await new Promise(res => setTimeout(res, 2000)); // Wait 2s
            } else if (error instanceof SyntaxError) {
                console.warn("⚠️ Gemini returned invalid JSON. Returning raw text fallback.");
                return { text: "Error parsing JSON from Gemini", raw: error.message };
            } else {
                throw error; // Other errors, fail immediately
            }
        }
    }
    throw new Error("Gemini Service Unavailable after 3 retries.");
};

// @desc    OCR Image (Google Gemini Vision API)
// @route   POST /api/ai/ocr
// @access  Private
const ocrImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const imagePath = req.file.path;
        console.log(`📝 Extracting Text (Gemini AI): ${imagePath}`);

        const result = await processImageWithGemini(imagePath);

        console.log("✅ OCR Result:", result.text.substring(0, 100) + "...");
        res.json({ text: result.text, description: "OCR (Gemini Vision)", details: result });

    } catch (error) {
        console.error("❌ OCR Failed:", error);
        res.status(500).json({ error: error.message });
    }
};

// Wrapper for predict.py
const runPrediction = async (text) => {
    return await runPythonScript('predict.py', [text]);
}

module.exports = { analyzeImage, extractEntities, ocrImage, runPythonScript, processImageWithGemini, runPrediction };


