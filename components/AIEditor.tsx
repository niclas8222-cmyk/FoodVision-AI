
import React, { useState } from 'react';
import { editFoodImage } from '../services/geminiService';

interface AIEditorProps {
  originalBase64: string;
  mimeType: string;
}

const AIEditor: React.FC<AIEditorProps> = ({ originalBase64, mimeType }) => {
  const [prompt, setPrompt] = useState('');
  const [editing, setEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setEditing(true);
    try {
      const result = await editFoodImage(originalBase64, mimeType, prompt);
      setEditedImage(result);
    } catch (err) {
      alert("Editing failed: " + err);
    } finally {
      setEditing(false);
    }
  };

  const examples = [
    "Make it look like a gourmet studio photo",
    "Add a retro 70s vintage filter",
    "Remove the background person",
    "Add more fresh herbs on top",
    "Make it look like a watercolor painting"
  ];

  return (
    <div id="editor" className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">AI Photo Studio</h2>
            <p className="text-gray-500 text-sm">Transform your food photos with creative text prompts.</p>
          </div>

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Apply a cinematic lighting effect' or 'Add a slice of lemon to the side'..."
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
            />
            <button
              onClick={handleEdit}
              disabled={editing || !prompt}
              className={`absolute bottom-3 right-3 px-6 py-2 rounded-xl font-bold text-sm shadow-lg transition-all ${
                editing || !prompt 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
              }`}
            >
              {editing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : 'Generate Edit'}
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[300px] relative">
          {editedImage ? (
            <img 
              src={editedImage} 
              alt="AI Edited" 
              className="w-full h-full object-contain rounded-xl shadow-lg" 
            />
          ) : (
            <div className="text-center p-8">
              {editing ? (
                 <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                   <p className="text-orange-500 font-medium animate-pulse">Gemini is reimagining your image...</p>
                 </div>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-gray-400 text-sm">Preview of your AI-edited image will appear here.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEditor;
