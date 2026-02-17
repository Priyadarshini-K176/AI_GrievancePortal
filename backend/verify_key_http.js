require('dotenv').config();

async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log(`Checking models at: ${url.replace(key, 'HIDDEN_KEY')}`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error(`Error ${response.status}:`, data);
            return;
        }

        const fs = require('fs');
        if (data.models) {
            const names = data.models.map(m => m.name.replace('models/', ''));
            fs.writeFileSync('models.json', JSON.stringify(names, null, 2));
            console.log("Models written to models.json");
        } else {
            console.log("No models listed in response:", data);
        }
    } catch (error) {
        console.error("Request Failed:", error.message);
    }
}

checkModels();
