import React from 'react';

export const SidebarStat: React.FC<{ 
  icon: React.ElementType;
  value: React.ReactNode;
  className: string;
}> = ({ icon: StatIcon, value, className }) => (
  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${className}`}>
    <StatIcon className="w-2.5 h-2.5" />
    {value}
  </div>
);