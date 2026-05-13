import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface StockInsight {
  analysis: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  keyFactors: string[];
}

export async function getStockAdvice(stockSymbol: string, price: number, change: number): Promise<StockInsight> {
  const prompt = `Analyze the stock ${stockSymbol} which is currently trading at ${price} (Change: ${change}%). 
  Provide a concise analysis, a recommendation (BUY, SELL, or HOLD), risk level (LOW, MEDIUM, or HIGH), and exactly 3 key factors.
  
  Return the result as a raw JSON object with this structure:
  {
    "analysis": "string",
    "recommendation": "BUY" | "SELL" | "HOLD",
    "riskLevel": "LOW" | "MEDIUM" | "HIGH",
    "keyFactors": ["string", "string", "string"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ parts: [{ text: prompt }] }]
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini");
    }

    // Clean the response text in case the model includes markdown blocks
    const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error getting stock advice:", error);
    return {
      analysis: "Unable to generate real-time analysis at the moment. Please try again later.",
      recommendation: 'HOLD',
      riskLevel: 'MEDIUM',
      keyFactors: ["Market Volatility", "Data Connectivity", "API Rate Limits"]
    };
  }
}

export async function getVaultAssistantResponse(message: string, context?: any): Promise<string> {
  const systemInstruction = `You are the ZenVault AI Concierge, a sophisticated digital financial advisor. 
  Your tone is professional, reassuring, and tech-forward. 
  You help users with their vault management, budgeting, and investment strategies.
  Current Context: ${JSON.stringify(context || {})}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "I'm sorry, I'm having trouble connecting to the ZenVault intelligence network. Please try again in a moment.";
  }
}
