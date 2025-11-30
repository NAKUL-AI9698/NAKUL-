import { GoogleGenAI, Type } from "@google/genai";
import { Player, AiHintResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiHint = async (
  board: Player[],
  currentPlayer: Player
): Promise<AiHintResponse> => {
  try {
    const boardStr = board.map((cell, index) => 
      cell ? cell : index.toString()
    ).join(", ");

    const prompt = `
      You are NXT NAKUL's advanced AI battle strategist for Tic-Tac-Toe.
      Current Board State (0-8): [${boardStr}]
      Current Player: ${currentPlayer}
      
      Analyze the board.
      1. Identify immediate winning moves.
      2. Block immediate threats.
      3. Control the center or corners if neutral.
      
      Return the best move index (0-8) and a short, cool, cyberpunk-style reason (max 10 words).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedIndex: { type: Type.NUMBER, description: "The index of the best move (0-8)" },
            reasoning: { type: Type.STRING, description: "Short strategic reasoning" }
          },
          required: ["suggestedIndex", "reasoning"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText) as AiHintResponse;
  } catch (error) {
    console.error("AI Hint Error:", error);
    return {
      suggestedIndex: -1,
      reasoning: "System overload! Make your own move."
    };
  }
};