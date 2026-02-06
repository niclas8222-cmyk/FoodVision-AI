
export interface RecipeSuggestion {
  name: string;
  ingredients: string[];
  description: string;
  instructions: string[];
}

export interface RecognitionResult {
  detectedItems: string[];
  suggestions: RecipeSuggestion[];
}

export interface ImageData {
  base64: string;
  mimeType: string;
}
