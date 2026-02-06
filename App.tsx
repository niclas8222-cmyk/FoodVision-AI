import React, { useState } from 'react';
import Header from './components/Header';
import ImagePicker from './components/ImagePicker';
import RecipeResult from './components/RecipeResult';
import { analyzeFoodImage } from './services/geminiService';
import { RecognitionResult, ImageData } from './types';

function App() {
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);

  const handleImageSelected = async (base64: string, mimeType: string) => {
    // Immediately set the image for preview
    setCurrentImage({ base64, mimeType });
    setResult(null);
    setAnalyzing(true);
    
    try {
      const recognitionResult = await analyzeFoodImage(base64, mimeType);
      setResult(recognitionResult);
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("Error during analysis. Please try again with a clearer photo.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setCurrentImage(null);
    setResult(null);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50/50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6">
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            What's in your <span className="text-orange-500">Kitchen?</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Take a photo of your ingredients and let our AI suggest creative dishes you can cook right now.
          </p>
        </section>

        {!currentImage ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <ImagePicker onImageSelected={handleImageSelected} />
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div className="relative group max-w-xl mx-auto">
              <img 
                src={`data:${currentImage.mimeType};base64,${currentImage.base64}`} 
                alt="Captured content" 
                className="w-full rounded-3xl shadow-2xl object-cover aspect-[4/3] border-4 border-white transition-opacity duration-300 ring-1 ring-black/5"
              />
              <button 
                onClick={reset}
                className="absolute -top-3 -right-3 p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-10"
                title="Remove photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              {analyzing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-orange-600 font-bold text-xl drop-shadow-sm animate-pulse">Analyzing Ingredients...</p>
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-16 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <RecipeResult result={result} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>© 2024 FoodieVision AI • Built with Gemini 2.5</p>
      </footer>
    </div>
  );
}

export default App;