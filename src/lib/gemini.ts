import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function enhancePrompt(userPrompt: string, styleKeywords: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional architectural and interior design prompt engineer. 
      Your task is to take a simple user prompt and a style preference, and combine them into a highly detailed, professional-grade prompt for an AI image generator to create a 360-degree equirectangular interior panorama.
      The output should describe a seamless ultra-wide spherical perspective, detailing lighting, materials, composition, and specific architectural details.
      
      User Wish: ${userPrompt}
      Style: ${styleKeywords}
      
      Return ONLY the enhanced prompt string. The prompt MUST include the phrase '360 degree equirectangular panorama wide-angle interior'. No conversational filler.`,
    });
    
    return response.text || userPrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return userPrompt;
  }
}
