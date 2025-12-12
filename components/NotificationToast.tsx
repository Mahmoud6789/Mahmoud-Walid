import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationToastProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ title, message, onClose }) => {
  return (
    <div 
      className="absolute top-14 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-[60] flex items-start space-x-3 animate-slide-down cursor-pointer hover:bg-white transition-colors"
      onClick={onClose}
    >
      <div className="bg-red-500 p-2 rounded-xl shrink-0 mt-0.5">
        <Bell className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="text-sm font-bold text-gray-900 truncate pr-2">{title}</h4>
          <span className="text-[10px] text-gray-400 font-medium shrink-0">Now</span>
        </div>
        <p className="text-xs text-gray-600 leading-snug line-clamp-2">{message}</p>
      </div>
    </div>
  );
};