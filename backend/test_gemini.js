const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Using Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");

    try {
        // Create a model just to get the listModels method (if SDK supports it) or try gemini-pro
        // Actually, listModels is on the genAI instance or specific manager in some versions?
        // Let's stick to trying models that might exist.
        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-pro-vision"];

        for (const modelName of modelsToTest) {
            console.log(`\nTesting ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ Success with ${modelName}:`, response.text());
                break; // Stop if one works
            } catch (e) {
                console.log(`❌ Failed ${modelName}: ${e.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

run();
