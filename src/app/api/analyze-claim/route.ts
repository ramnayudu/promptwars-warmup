import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSecret } from '@/shared/config/secrets';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

const RequestSchema = z.object({
  vehicleImageBase64: z.string().min(10), // Ensures basic data uri presence
  policyPdfBase64: z.string().min(10),
  carModel: z.string().min(2),
  city: z.string().min(2)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleImageBase64, policyPdfBase64, carModel, city } = RequestSchema.parse(body);

    const apiKey = await getSecret('GEMINI_API_KEY');
    
    // Initialize the official Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert Indian auto insurance claims adjuster agent.
      Analyze the provided vehicle damage image and the insurance policy PDF.
      1. Extract the 'Insured Declared Value' (IDV) specifically from the policy.
      2. Check if 'Zero-Depreciation' or 'Consumables' add-ons are currently active.
      3. Use Google Search Grounding to find the current estimated price for repairing such visual damage for a ${carModel} in ${city}, India (2026 prices).
      
      Return your analysis strictly in JSON format matching this structure:
      {
        "idv": number,
        "zeroDepActive": boolean,
        "consumablesActive": boolean,
        "estimatedDamageCost": number,
        "justification": "string",
        "searchSources": ["url1", "url2"]
      }
    `;

    // Process using Gemini 3.1 Pro for complex multi-modal parsing and heavy logic
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: vehicleImageBase64 } },
            { inlineData: { mimeType: 'application/pdf', data: policyPdfBase64 } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        // Strict safety settings enforced to prevent prompt injection or toxic outputs
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          }
        ],
        // Google Search Grounding Integration
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response generated from Gemini.");
    
    const parsed = JSON.parse(resultText);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("[analyze-claim] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process the claim accurately." },
      { status: 500 }
    );
  }
}
