import React, { useState } from 'react';
import { Frown, Smile, ArrowRight } from 'lucide-react';
import { vibrate } from '../App';

interface VASModalProps {
  isOpen: boolean;
  onSubmit: (value: number, location: {x: number, y: number} | null) => void;
  t: any;
}

export const VASModal: React.FC<VASModalProps> = ({ isOpen, onSubmit, t }) => {
  const [step, setStep] = useState<'location' | 'intensity'>('location');
  const [value, setValue] = useState(3);
  const [location, setLocation] = useState<{x: number, y: number} | null>(null);

  if (!isOpen) return null;

  const handleBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLocation({ x, y });
    vibrate(30);
  };

  const handleNext = () => {
    setStep('intensity');
    vibrate(30);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(e.target.value));
    vibrate(10); // Light tick
  };

  const getEmoji = (val: number) => {
    if (val <= 3) return <Smile className="w-16 h-16 text-green-500 transition-all" />;
    if (val <= 7) return <Frown className="w-16 h-16 text-yellow-500 transition-all" />;
    return <Frown className="w-16 h-16 text-red-500 transition-all" />;
  };

  const getColor = (val: number) => {
      if (val <= 3) return 'bg-green-500';
      if (val <= 7) return 'bg-yellow-500';
      return 'bg-red-500';
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-6">
      <div className="bg-white dark:bg-gray-800 w-full rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-slide-up relative overflow-hidden transition-colors duration-300">
        
        {/* Step Indicator */}
        <div className="flex space-x-2 mb-6">
            <div className={`h-1.5 w-8 rounded-full ${step === 'location' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`h-1.5 w-8 rounded-full ${step === 'intensity' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
        </div>

        {step === 'location' ? (
            <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.vasTitle}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">{t.tapBody}</p>
                
                {/* Body Map Area */}
                <div 
                    className="relative w-40 h-80 bg-gray-100 dark:bg-gray-700 rounded-3xl border-2 border-gray-200 dark:border-gray-600 cursor-crosshair mb-6 overflow-hidden"
                    onClick={handleBodyClick}
                >
                    {/* Simplified Human Outline SVG */}
                    <svg viewBox="0 0 100 200" className="w-full h-full text-gray-300 dark:text-gray-500 fill-current opacity-50 pointer-events-none">
                        <path d="M50 10 C 60 10 65 15 65 25 C 65 30 60 35 65 40 L 85 45 L 90 90 L 80 95 L 65 55 L 65 100 L 75 190 L 55 190 L 50 120 L 45 190 L 25 190 L 35 100 L 35 55 L 20 95 L 10 90 L 15 45 L 35 40 C 40 35 35 30 35 25 C 35 15 40 10 50 10" />
                    </svg>

                    {/* Red Dot Marker */}
                    {location && (
                        <div 
                            className="absolute w-6 h-6 bg-red-500/80 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
                            style={{ left: `${location.x}%`, top: `${location.y}%` }}
                        ></div>
                    )}
                </div>

                <button 
                    onClick={handleNext}
                    disabled={!location}
                    className="w-full py-4 rounded-2xl font-bold text-lg bg-blue-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    <span>{t.next}</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </>
        ) : (
            <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t.vasScaleTitle}</h2>
                
                <div className="mb-8 transform transition-all duration-300 scale-110">
                    {getEmoji(value)}
                </div>

                <div className="w-full relative mb-2">
                    <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1" 
                        value={value}
                        onChange={handleSliderChange}
                        className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 mt-3 uppercase tracking-wider">
                        <span>{t.vasLow} (0)</span>
                        <span>{t.vasHigh} (10)</span>
                    </div>
                </div>

                <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8 font-sans">{value}</div>

                <button 
                    onClick={() => onSubmit(value, location)}
                    className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-95 ${getColor(value)}`}
                >
                    {t.submit}
                </button>
            </>
        )}
      </div>
    </div>
  );
};