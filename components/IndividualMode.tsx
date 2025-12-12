import React, { useState } from 'react';
import { Flame, Medal, Award, CheckCircle2, PlayCircle, FileText, ChevronDown, ChevronUp, Clock, Activity, Dumbbell, Filter, Share2 } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { PainChart } from './PainChart';
import { Exercise } from '../App';
import { vibrate } from '../App';

interface IndividualModeProps {
  progress: number;
  onLogExercise: (exercise?: Exercise) => void;
  hasLogged: boolean;
  onSendReport: () => void;
  onShare: () => void;
  exerciseLogs: { id: number, name: string, time: string }[];
  painLogs: { date: string, score: number }[];
  exercises: Exercise[];
  t: any;
}

export const IndividualMode: React.FC<IndividualModeProps> = ({ progress, onLogExercise, hasLogged, onSendReport, onShare, exerciseLogs, painLogs, exercises, t }) => {
  const [isReportSent, setIsReportSent] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derive unique categories including 'All'
  const categories = ['All', ...Array.from(new Set(exercises.map(e => e.category)))];

  // Filter logic
  const filteredExercises = selectedCategory === 'All' 
    ? exercises 
    : exercises.filter(e => e.category === selectedCategory);

  const handleReportClick = () => {
    onSendReport();
    setIsReportSent(true);
    setTimeout(() => setIsReportSent(false), 3000);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    vibrate(30);
  };

  const handleShareClick = async () => {
    vibrate(30);
    const shareData = {
      title: 'G-Back Achievements',
      text: `I'm crushing my physical therapy goals on G-Back! ${t.streakTitle}`,
      url: window.location.href
    };

    const performClipboardFallback = async () => {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        onShare(); // Trigger "Shared!" toast (implies copied)
      } catch (clipboardErr) {
        console.error("Clipboard failed", clipboardErr);
        onShare(); // Just show toast as visual feedback for prototype
      }
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        onShare(); // Trigger toast on successful share
      } catch (err: any) {
        // Only fallback if it wasn't a user cancellation
        if (err.name !== 'AbortError') {
          console.log('Share API Error, falling back to clipboard', err);
          await performClipboardFallback();
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      await performClipboardFallback();
    }
  };

  return (
    <div className="p-6 flex flex-col items-center space-y-8 pb-24 animate-fade-in">
      
      {/* Header */}
      <div className="w-full text-start">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.welcome}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.name}</h1>
      </div>

      {/* Central Progress Ring */}
      <div className="relative">
        <CircularProgress percentage={progress} size={220} strokeWidth={20} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 font-sans" dir="ltr">{Math.round(progress)}%</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{t.dailyGoal}</span>
        </div>
      </div>

      {/* Streak Section */}
      <div className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex items-center space-x-4 rtl:space-x-reverse shadow-sm">
        <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-full shrink-0">
          <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
        </div>
        <div>
          <h3 className="text-orange-900 dark:text-orange-300 font-bold text-lg">{t.streakTitle}</h3>
          <p className="text-orange-700 dark:text-orange-400 text-xs">{t.streakSub}</p>
        </div>
      </div>

      {/* Main Action Button (Defaults to recommended/first exercise) */}
      <button
        onClick={() => onLogExercise(exercises[0])}
        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 rtl:space-x-reverse
          ${hasLogged 
            ? 'bg-green-600 text-white shadow-green-200 dark:shadow-green-900/20 hover:bg-green-700' 
            : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200 dark:shadow-green-900/20'
          }`}
      >
        {hasLogged ? (
          <>
            <CheckCircle2 className="w-6 h-6" />
            <span>{t.doAgain}</span>
          </>
        ) : (
          <>
            <PlayCircle className="w-6 h-6" />
            <span>{t.startExercise}</span>
          </>
        )}
      </button>

      {/* Badges Grid */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
             <h3 className="text-gray-800 dark:text-gray-200 font-bold text-lg text-start">{t.achievements}</h3>
             <button 
                onClick={handleShareClick}
                className="flex items-center space-x-1.5 rtl:space-x-reverse bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-95"
             >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.share}</span>
             </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          
          {/* Unlocked Badge 1 */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-sm">
              <Medal className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t.badge1}</span>
          </div>

          {/* Unlocked Badge 2 */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shadow-sm">
              <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t.badge2}</span>
          </div>

          {/* Locked Badge */}
          <div className="flex flex-col items-center space-y-2 opacity-50 grayscale">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500 text-center">{t.badge3}</span>
          </div>
        </div>
      </div>

      {/* Exercise Library with Categories */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
             <h3 className="text-gray-800 dark:text-gray-200 font-bold text-lg">{t.libraryTitle}</h3>
             <span className="text-xs text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md font-bold">{t.librarySub}</span>
        </div>
        
        {/* Category Filters */}
        <div className="flex space-x-2 rtl:space-x-reverse mb-4 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                        selectedCategory === cat 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    {cat === 'All' && t.all ? t.all : cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-4 min-h-[100px]">
            {filteredExercises.map((ex) => (
                <button 
                    key={ex.id}
                    onClick={() => onLogExercise(ex)}
                    className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all active:scale-[0.98] text-start group animate-fade-in"
                >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-gray-200 dark:bg-gray-700">
                        <img src={ex.thumbnailUrl} alt={ex.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                             <PlayCircle className="w-8 h-8 text-white opacity-80" />
                        </div>
                    </div>
                    <div className="flex-1 px-4">
                        <div className="flex justify-between items-start">
                             <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1 leading-tight line-clamp-1">{ex.title}</h4>
                        </div>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mt-1.5">
                             <span className="flex items-center text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                <Clock className="w-3 h-3 mr-1 rtl:ml-1" />
                                {ex.duration}
                             </span>
                             <span className="flex items-center text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-medium">
                                <Dumbbell className="w-3 h-3 mr-1 rtl:ml-1" />
                                {ex.category}
                             </span>
                        </div>
                    </div>
                </button>
            ))}
            {filteredExercises.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                    <Filter className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">No exercises found in this category.</p>
                </div>
            )}
        </div>
      </div>

      {/* Clinical Visualization: Pain Chart */}
      <PainChart logs={painLogs} title={t.painChartTitle} />

      {/* Today's Activity History (Collapsible) */}
      {exerciseLogs.length > 0 && (
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in transition-colors duration-300">
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{t.historyHeader}</h3>
            {isHistoryExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          
          <div className={`mt-3 space-y-3 transition-all duration-300 overflow-hidden ${isHistoryExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {exerciseLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                 <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-300 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-xs truncate max-w-[150px]">{log.name}</span>
                 </div>
                 <span className="text-[10px] text-gray-400 font-mono shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Report Button */}
      <button 
        onClick={handleReportClick}
        disabled={isReportSent}
        className={`text-sm font-bold flex items-center justify-center space-x-2 rtl:space-x-reverse transition-all duration-300 py-3 px-6 rounded-xl w-full
            ${isReportSent 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
      >
        {isReportSent ? (
            <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.reportSent}</span>
            </>
        ) : (
            <>
                <FileText className="w-5 h-5" />
                <span>{t.sendReport}</span>
            </>
        )}
      </button>
    </div>
  );
};