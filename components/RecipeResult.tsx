
import React, { useState } from 'react';
import { RecognitionResult, RecipeSuggestion } from '../types';

interface RecipeResultProps {
  result: RecognitionResult;
}

const RecipeResult: React.FC<RecipeResultProps> = ({ result }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSuggestion | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Detected Ingredients</h2>
        <div className="flex flex-wrap gap-2">
          {result.detectedItems.map((item, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {result.suggestions.map((recipe, idx) => (
          <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
            <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-6 text-white text-center">
              <h3 className="text-xl font-bold leading-tight">{recipe.name}</h3>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic">"{recipe.description}"</p>
              
              <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Key Ingredients</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {recipe.ingredients.slice(0, 4).map((ing, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                      {ing}
                    </li>
                  ))}
                  {recipe.ingredients.length > 4 && (
                    <li className="text-gray-400 text-xs pl-3.5">+ {recipe.ingredients.length - 4} more</li>
                  )}
                </ul>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => setSelectedRecipe(recipe)}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors active:scale-95"
                >
                  View Full Recipe
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="relative h-48 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center p-8 text-white text-center">
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <h3 className="text-3xl font-extrabold">{selectedRecipe.name}</h3>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 md:p-8 space-y-8">
              <div>
                <p className="text-gray-600 italic text-lg leading-relaxed border-l-4 border-orange-200 pl-4">
                  "{selectedRecipe.description}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    Full Ingredients
                  </h4>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="mt-1 w-2 h-2 bg-orange-400 rounded-full shrink-0" />
                        <span className="text-sm font-medium">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    Step-by-Step
                  </h4>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed pt-1">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Close Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeResult;
