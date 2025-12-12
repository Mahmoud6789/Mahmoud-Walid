import React, { useEffect, useState } from 'react';
import { Award, X, Wand2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface BadgePopupProps {
  onClose: () => void;
  t: any;
}

export const BadgePopup: React.FC<BadgePopupProps> = ({ onClose, t }) => {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // 4. Image Editing (Gemini 2.5 Flash Image)
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    
    // Simulate current badge as base64 (1x1 yellow pixel for prototype)
    const base64Pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Pixel } },
                    { text: prompt }
                ]
            }
        });

        // Extract image from response
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
                    break;
                }
            }
        }
    } catch (error) {
        console.error("Image Gen Error", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className={`bg-white dark:bg-gray-800 w-[85%] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X className="w-5 h-5" />
        </button>

        {generatedImage ? (
             <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-100 shadow-lg">
                <img src={generatedImage} alt="Generated Badge" className="w-full h-full object-cover" />
             </div>
        ) : (
             <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Award className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
             </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.badgeUnlocked}</h2>
        
        {!isEditing ? (
            <>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                {t.congratsBadge} <span className="font-bold text-blue-600 dark:text-blue-400">{t.consistencyKing}</span>
                </p>

                <div className="w-full space-y-3">
                    <button 
                    onClick={handleClose}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
                    >
                    {t.awesome}
                    </button>
                    <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-95 transition-transform flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                    <Wand2 className="w-4 h-4" />
                    <span>{t.remixAI}</span>
                    </button>
                </div>
            </>
        ) : (
            <div className="w-full animate-fade-in">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 text-start">
                    {t.remixDesc}
                </p>
                <div className="flex space-x-2 rtl:space-x-reverse mb-4">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t.remixPlaceholder}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    </button>
                </div>
                 <button 
                    onClick={() => { setIsEditing(false); setGeneratedImage(null); }}
                    className="text-gray-400 dark:text-gray-500 text-xs underline"
                >
                    {t.cancel}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};