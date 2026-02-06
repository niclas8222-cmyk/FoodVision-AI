
import { GoogleGenAI, Type } from "@google/genai";
import { RecognitionResult } from "../types";

// Mock data for development/demo
const MOCK_RESULTS: RecognitionResult[] = [
  {
    detectedItems: ["Tomato", "Basil", "Garlic", "Olive Oil", "Pasta"],
    suggestions: [
      {
        name: "Classic Pasta Marinara",
        ingredients: ["Pasta", "Tomato", "Garlic", "Olive Oil", "Basil"],
        description: "A simple and elegant Italian pasta dish with fresh tomatoes and basil.",
        instructions: [
          "Cook pasta according to package directions",
          "Sauté garlic in olive oil until fragrant",
          "Add tomatoes and simmer for 15 minutes",
          "Toss cooked pasta with sauce",
          "Garnish with fresh basil and serve"
        ]
      },
      {
        name: "Garlic Basil Tomato Soup",
        ingredients: ["Tomato", "Basil", "Garlic", "Olive Oil"],
        description: "A warming soup with aromatic basil and garlic flavors.",
        instructions: [
          "Sauté garlic in olive oil",
          "Add chopped tomatoes",
          "Simmer for 20 minutes",
          "Blend until smooth",
          "Top with fresh basil"
        ]
      },
      {
        name: "Bruschetta Toasts",
        ingredients: ["Tomato", "Basil", "Garlic", "Olive Oil"],
        description: "Crispy toasts topped with fresh tomato and herb mixture.",
        instructions: [
          "Toast bread slices until golden",
          "Rub with garlic",
          "Mix tomato, basil, and olive oil",
          "Spoon mixture onto toast",
          "Serve immediately"
        ]
      }
    ]
  },
  {
    detectedItems: ["Chicken", "Lemon", "Rosemary", "Olive Oil", "Salt"],
    suggestions: [
      {
        name: "Lemon Rosemary Chicken",
        ingredients: ["Chicken", "Lemon", "Rosemary", "Olive Oil", "Salt"],
        description: "Juicy grilled chicken with bright lemon and aromatic rosemary.",
        instructions: [
          "Season chicken with salt",
          "Mix lemon juice, olive oil, and rosemary",
          "Marinate chicken for 30 minutes",
          "Grill for 6-8 minutes per side",
          "Rest before serving"
        ]
      },
      {
        name: "Herb-Roasted Chicken Thighs",
        ingredients: ["Chicken", "Rosemary", "Olive Oil", "Lemon", "Salt"],
        description: "Tender roasted chicken with crispy skin and herb flavor.",
        instructions: [
          "Rub chicken with olive oil and herbs",
          "Place on roasting pan",
          "Roast at 425°F for 35-40 minutes",
          "Squeeze lemon over top",
          "Let rest 5 minutes"
        ]
      },
      {
        name: "Lemon Chicken Piccata",
        ingredients: ["Chicken", "Lemon", "Olive Oil", "Rosemary", "Salt"],
        description: "Pan-seared chicken with tangy lemon sauce.",
        instructions: [
          "Pound chicken breasts thin",
          "Sauté in olive oil until golden",
          "Remove and set aside",
          "Make lemon sauce in same pan",
          "Return chicken and serve"
        ]
      }
    ]
  }
];

// Helper to initialize GoogleGenAI with the mandatory API key as per guidelines
const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not set. Using mock data for demo.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Analyze image for food items and suggest recipes
export const analyzeFoodImage = async (base64Data: string, mimeType: string): Promise<RecognitionResult> => {
  const ai = getAI();
  
  // Use mock data if no API key
  if (!ai) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
  }

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
