import React from 'react';
import { Check } from 'lucide-react';

const UploadFinishedState: React.FC = () => (
  <div className="flex flex-col items-center space-y-4 animate-fade-in">
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
      <Check className="w-6 h-6" style={{ color: '#22c55e' }} />
    </div>
    <p className="text-lg font-semibold" style={{ color: '#22c55e' }}>
      Search Complete!
    </p>
    <p className="text-sm" style={{ color: '#6b7280' }}>
      Your screenshots have been successfully uploaded and searched.
    </p>
  </div>
);

export default UploadFinishedState;
