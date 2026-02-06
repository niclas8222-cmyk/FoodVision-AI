
import { GoogleGenAI, Type } from "@google/genai";
import { RecognitionResult } from "../types";

// Helper to initialize GoogleGenAI with the mandatory API key as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze image for food items and suggest recipes
export const analyzeFoodImage = async (base64Data: string, mimeType: string): Promise<RecognitionResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    // Using gemini-3-flash-preview for multimodal analysis and recipe generation
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: "Identify all food items, ingredients, or drinks in this image. Then, suggest 3 creative recipes or cocktails that can be made with these items. Focus on practical suggestions based on the detected ingredients. Provide the output in JSON format.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["name", "ingredients", "description", "instructions"],
            },
          },
        },
        required: ["detectedItems", "suggestions"],
      },
    },
  });

  // Extract text using the property directly as per guidelines
  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as RecognitionResult;
};

// Edit food image based on user prompt using the gemini-2.5-flash-image model
export const editFoodImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    // Note: responseMimeType and responseSchema are NOT supported for nano banana series models like gemini-2.5-flash-image
  });

  // Find the image part in the response as per guidelines (do not assume it's the first part)
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
      }
    }
  }

  throw new Error("No edited image was returned from the model.");
};
