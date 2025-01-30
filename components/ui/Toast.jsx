import React from 'react';
import { Check } from 'lucide-react';

const Toast = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
       
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/30 to-transparent blur-xl" />
        
       
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500/30 to-transparent blur-xl" />
        
        
        <div className="relative bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-lg shadow-xl min-w-[320px] min-h-[50px] flex items-center gap-3 animate-slide-in">
          <div className="flex items-center justify-center bg-green-500/10 rounded-full p-1">
            <Check className="text-green-500" size={18} />
          </div>
          <p className="text-gray-200 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};







export default Toast;