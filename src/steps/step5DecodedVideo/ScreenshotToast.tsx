import React from 'react';
import { Camera } from 'lucide-react';

const ScreenshotToast: React.FC = () => (
  <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg px-6 py-3 flex items-center space-x-2 animate-fade-in z-[999]" style={{ borderColor: '#14b8a6', zIndex: 999 }}>
    <Camera className="w-5 h-5" style={{ color: '#14b8a6' }} />
    <span className="font-semibold text-sm" style={{ color: '#14b8a6' }}>Screenshot saved!</span>
  </div>
);

export default ScreenshotToast;
