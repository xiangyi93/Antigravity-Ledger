const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Note: listModels might not be directly exposed on the main class in some versions, 
        // or we might need to use the model manager if available, but usually it's via API or just trial.
        // Actually, the JS SDK v0.24.1 doesn't have a simple listModels() helper on the top level easily accessible 
        // without using the model manager or generic request.
        // Let's try a simple generation with "gemini-1.5-flash" first to see if it works in isolation, 
        // printing the error details if it fails.

        const modelName = "gemini-1.5-flash";
        console.log(`Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`Success! Model ${modelName} is working.`);
        console.log("Response:", response.text());
    } catch (error) {
        console.error("Error testing gemini-1.5-flash:", error.message);

        // Fallback try gemini-pro
        try {
            console.log("Testing fallback model: gemini-pro...");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log("Success! Model gemini-pro is working.");
        } catch (e) {
            console.error("Error testing gemini-pro:", e.message);
        }
    }
}

listModels();
