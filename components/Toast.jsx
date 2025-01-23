'use client';
import React from 'react';
import { X } from 'lucide-react'; // Correctly import the X icon

const Toast = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 bg-zinc-950 text-white rounded-lg p-4 shadow-lg transition-opacity duration-300 ease-in-out">
      <div className="flex justify-between items-center text-thin">
        <span>{message}</span>
        <X onClick={onClose} className="color-red ml-2 cursor-pointer" /> {/* Use X instead of IconX */}
      </div>
    </div>
  );
};

export default Toast;
