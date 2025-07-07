import React from 'react';

const GlobalLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,66,0.08)' }}>
      <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="4" fill="none" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e42" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
    <span className="mt-4 text-sm font-medium" style={{ color: '#f59e42' }}>Preparing images...</span>
  </div>
);

export default GlobalLoading;
