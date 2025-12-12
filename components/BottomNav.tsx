import React from 'react';
import { UserCircle2, Trophy } from 'lucide-react';
import { Tab } from '../App';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  t: any;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, t }) => {
  return (
    <div className="absolute bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-around items-center z-20 pb-8 transition-colors duration-300">
      
      <button 
        onClick={() => onTabChange('individual')}
        className={`flex flex-col items-center space-y-1 transition-colors duration-200 ${
          activeTab === 'individual' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
        }`}
      >
        <UserCircle2 className={`w-7 h-7 ${activeTab === 'individual' ? 'fill-blue-100 dark:fill-blue-900/30' : ''}`} />
        <span className="text-xs font-medium">{t.tabProgress}</span>
      </button>

      <button 
        onClick={() => onTabChange('social')}
        className={`flex flex-col items-center space-y-1 transition-colors duration-200 ${
          activeTab === 'social' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
        }`}
      >
        <Trophy className={`w-7 h-7 ${activeTab === 'social' ? 'fill-blue-100 dark:fill-blue-900/30' : ''}`} />
        <span className="text-xs font-medium">{t.tabLeaderboard}</span>
      </button>

    </div>
  );
};