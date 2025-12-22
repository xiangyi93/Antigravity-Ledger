import { NextRequest, NextResponse } from "next/server";
import { parseTransactionWithGemini } from "@/lib/gemini";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        console.log("--- AntiGravity Transaction Start ---");
        console.log("User Input:", text);

        // AI Parsing
        const transaction = await parseTransactionWithGemini(text);
        console.log("AI Parsed Result:", transaction);

        if (!transaction) {
            return NextResponse.json({ error: "AI failed to parse transaction" }, { status: 500 });
        }

        // Google Sheets Logic
        try {
            if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
                console.warn("Missing Google Sheets credentials or Sheet ID");
                // Allow proceeding just to return data to frontend if sheets config is missing but gemini worked?
                // But the user requested logic. 
                // We'll throw to be safe.
                throw new Error("Google Sheets credentials missing");
            }

            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                ],
            });

            const sheets = google.sheets({ version: 'v4', auth });

            const spreadsheetId = process.env.GOOGLE_SHEET_ID;

            // Append to Sheet
            const response = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'Sheet1!A:D', // Target range
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [
                        [
                            new Date().toISOString(),
                            transaction.Item,
                            transaction.Amount,
                            transaction.Category
                        ]
                    ]
                },
            });

            console.log("Sheet Append Status:", response.status);
        } catch (sheetError: any) {
            console.error("Google Sheets Error:", sheetError.message);
            return NextResponse.json({ error: `Sheet Error: ${sheetError.message}` }, { status: 500 });
        }

        console.log("--- AntiGravity Transaction End ---");

        return NextResponse.json({ success: true, data: transaction });

    } catch (error: any) {
        console.error("Critical Transaction Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
