const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    const logFile = 'models.log';
    const log = (msg) => fs.appendFileSync(logFile, msg + '\n');

    if (!apiKey) {
        log("No API Key");
        return;
    }

    // Clean file
    fs.writeFileSync(logFile, '');

    const genAI = new GoogleGenerativeAI(apiKey);

    log(`Using Key: ${apiKey.substring(0, 10)}...`);

    try {
        // There isn't a direct listModels on genAI client in this version usually, 
        // but let's try to infer from a simple call failure details.
        // We will try gemini-1.5-flash again.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        await model.generateContent("test");
        log("gemini-1.5-flash WORKS");
    } catch (e) {
        log("gemini-1.5-flash FAILED: " + e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        await model.generateContent("test");
        log("gemini-pro WORKS");
    } catch (e) {
        log("gemini-pro FAILED: " + e.message);
    }
}

main();
