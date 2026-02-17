const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testModel(modelName) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log(`\nTesting model: ${modelName} ...`);
    try {
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`✅ SUCCESS: ${modelName}`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${modelName} - ${error.message.split('\n')[0]}`);
        return false;
    }
}

async function run() {
    const models = [
        "gemini-2.0-flash-001",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-1.5-flash-latest",
        "gemini-pro"
    ];

    for (const m of models) {
        const success = await testModel(m);
        if (success) {
            console.log(`\n🎉 WE HAVE A WINNER: ${m}`);
            break;
        }
    }
}

run();
