// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from '@google/genai';


const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "" });
// const genAI = new GoogleGenerativeAI(apiKey || "");

// Using gemini-1.5-flash-002 for specific version targeting
// export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export interface TransactionData {
    Item: string;
    Amount: number;
    Category: string;
}

export async function parseTransactionWithGemini(input: string): Promise<TransactionData | null> {
    try {
        console.log(`[Gemini] Solving transaction for: "${input}"`);
        const prompt = `
      You are an intelligent accounting assistant. Analyze this transaction input: "${input}".
      Extract the item name, amount, and a suitable category.
      Return the result as a raw VALID JSON object with NO Markdown formatting.
      Keys: "Item" (string), "Amount" (number), "Category" (string).
      Example Input: "Lunch 120"
      Example Output: {"Item": "Lunch", "Amount": 120, "Category": "Food"}
    `;

        // const result = await geminiModel.generateContent(prompt);
        // const response = await result.response;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        // Clean up if there's markdown code blocks
        const jsonStr = text?.replace(/```json/g, "").replace(/```/g, "").trim();

        console.log("Gemini Raw Parse:", jsonStr);

        try {
            const data = JSON.parse(jsonStr || "") as TransactionData;
            // Validate fields
            if (typeof data.Item === 'string' && typeof data.Amount === 'number' && typeof data.Category === 'string') {
                return data;
            }
            console.warn("[Gemini] Invalid data structure returned", data);
            return null;
        } catch (e) {
            console.error("[Gemini] JSON Parse Error", e);
            return null;
        }
    } catch (error) {
        console.error("[Gemini] API Error:", error);
        return null;
    }
}
