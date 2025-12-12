import React, { useState } from 'react';
import { Trophy, User, ArrowUp, Hand, Users, Clock } from 'lucide-react';
import { vibrate } from '../App';

interface SocialModeProps {
    t: any;
    onHighFive?: (name: string) => void;
}

const HighFiveButton = ({ onClick }: { onClick: () => void }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <button
      onClick={handleClick}
      className={`ml-3 p-2 rounded-full transition-all duration-300 transform border border-transparent ${
        isAnimating 
          ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 scale-110 rotate-12 shadow-sm border-yellow-200 dark:border-yellow-700' 
          : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-800'
      }`}
      aria-label="Send High Five"
    >
      <Hand className={`w-5 h-5 ${isAnimating ? 'fill-current' : ''}`} />
    </button>
  );
};

export const SocialMode: React.FC<SocialModeProps> = ({ t, onHighFive }) => {
  
  const handleInteraction = (name: string) => {
    if (onHighFive) {
        onHighFive(name);
        vibrate(50);
    }
  };

  return (
    <div className="flex flex-col pb-24 animate-fade-in">
      
      {/* Header */}
      <div className="p-6 bg-white dark:bg-gray-900 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 text-start transition-colors duration-300">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.compHeader}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.compSub}</p>
      </div>

      {/* Challenge Banner */}
      <div className="m-6 p-4 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-lg text-white text-start">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm shrink-0">
            <ArrowUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm mb-1">{t.bannerTitle}</p>
            <p className="text-xs text-blue-100 leading-relaxed">{t.bannerText}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="px-6 space-y-4">
        
        {/* Rank 1: Dr. Shimaa */}
        <div className="w-full flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="w-8 font-bold text-gray-400 dark:text-gray-500 text-lg">1</div>
          <div className="relative">
             <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center border-2 border-yellow-200 dark:border-yellow-700">
                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
             </div>
          </div>
          <div className="mx-4 flex-1 text-start">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">{t.drShimaa}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.expert}</p>
          </div>
          <div className="font-bold text-blue-600 dark:text-blue-400 font-sans" dir="ltr">1500 {t.points}</div>
          <HighFiveButton onClick={() => handleInteraction(t.drShimaa)} />
        </div>

        {/* Rank 2: Mahmoud Behairy (YOU) */}
        <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl shadow-md border-2 border-blue-200 dark:border-blue-800 transform scale-[1.02] transition-colors">
          <div className="w-8 font-bold text-blue-800 dark:text-blue-300 text-lg">2</div>
          <div className="relative">
             <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-700 dark:text-blue-300" />
             </div>
          </div>
          <div className="mx-4 flex-1 text-start">
            <h3 className="font-bold text-gray-900 dark:text-white">{t.mahmoud} <span className="text-xs font-normal text-blue-600 dark:text-blue-400">({t.you})</span></h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t.keepPushing}</p>
          </div>
          <div className="font-bold text-blue-700 dark:text-blue-300 font-sans" dir="ltr">1100 {t.points}</div>
        </div>

        {/* Rank 3: Sarah */}
        <div className="w-full flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="w-8 font-bold text-gray-400 dark:text-gray-500 text-lg">3</div>
          <div className="relative">
             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">SA</span>
             </div>
          </div>
          <div className="mx-4 flex-1 text-start">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">{t.sarah}</h3>
             <p className="text-xs text-gray-500 dark:text-gray-400">{t.consistent}</p>
          </div>
          <div className="font-bold text-gray-500 dark:text-gray-400 font-sans" dir="ltr">950 {t.points}</div>
          <HighFiveButton onClick={() => handleInteraction(t.sarah)} />
        </div>

        {/* Rank 4 */}
        <div className="w-full flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-80 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="w-8 font-bold text-gray-400 dark:text-gray-500 text-lg">4</div>
          <div className="relative">
             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">AL</span>
             </div>
          </div>
          <div className="mx-4 flex-1 text-start">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">{t.ali}</h3>
          </div>
          <div className="font-bold text-gray-500 dark:text-gray-400 font-sans" dir="ltr">900 {t.points}</div>
          <HighFiveButton onClick={() => handleInteraction(t.ali)} />
        </div>

         {/* Rank 5 */}
         <div className="w-full flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-60 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="w-8 font-bold text-gray-400 dark:text-gray-500 text-lg">5</div>
          <div className="relative">
             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">OM</span>
             </div>
          </div>
          <div className="mx-4 flex-1 text-start">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">{t.omar}</h3>
          </div>
          <div className="font-bold text-gray-500 dark:text-gray-400 font-sans" dir="ltr">850 {t.points}</div>
          <HighFiveButton onClick={() => handleInteraction(t.omar)} />
        </div>

      </div>

      {/* Live Community Feed */}
      <div className="px-6 mt-8">
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{t.communityFeed}</h3>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
            {/* Feed Item 1 */}
            <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300 shrink-0">SA</div>
                <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-bold">{t.sarah}</span> {t.feed1}</p>
                    <div className="flex items-center mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3 mr-1 rtl:ml-1" />
                        {t.justNow}
                    </div>
                </div>
            </div>

            {/* Feed Item 2 */}
            <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-start space-x-3 rtl:space-x-reverse bg-gray-50/50 dark:bg-gray-700/30">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300 shrink-0">AL</div>
                <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-bold">{t.ali}</span> {t.feed2}</p>
                    <div className="flex items-center mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3 mr-1 rtl:ml-1" />
                        5 {t.minsAgo}
                    </div>
                </div>
            </div>

            {/* Feed Item 3 */}
            <div className="p-4 flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0">OM</div>
                <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-bold">{t.omar}</span> {t.feed3}</p>
                    <div className="flex items-center mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3 mr-1 rtl:ml-1" />
                        12 {t.minsAgo}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};