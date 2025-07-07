import React from 'react';

const UploadFinishedState: React.FC = () => (
  <div className="flex flex-col items-center space-y-4 animate-fade-in">
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#f0fdf4" />
        <path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <p className="text-lg font-semibold" style={{ color: '#22c55e' }}>
      Upload Complete!
    </p>
    <p className="text-sm" style={{ color: '#6b7280' }}>
      Your screenshots have been successfully uploaded and are ready for processing.
    </p>
  </div>
);

export default UploadFinishedState;
