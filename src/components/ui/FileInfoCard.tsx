import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FileInfoCardProps {
  icon: LucideIcon;
  iconColor: string;
  backgroundColor: string;
  label: string;
  value: string;
}

export const FileInfoCard: React.FC<FileInfoCardProps> = ({
  icon: IconComponent,
  iconColor,
  backgroundColor,
  label,
  value
}) => {
  return (
    <div className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
      <div
        className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <IconComponent className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: '#111827' }}>{value}</p>
    </div>
  );
};
