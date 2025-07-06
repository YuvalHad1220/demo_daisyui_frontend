import React from 'react';
import { Monitor, HardDrive, Clock, FileText, Image, Video, Music, Archive } from 'lucide-react';

export interface FileInfoItem {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  color?: string;
  bgColor?: string;
}

export interface FileInfoProps {
  title?: string;
  items: FileInfoItem[];
  layout?: 'grid' | 'list' | 'cards';
  columns?: number;
  className?: string;
}

export const FileInfo: React.FC<FileInfoProps> = ({
  title,
  items,
  layout = 'cards',
  columns = 3,
  className = ""
}) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'mkv':
        return Video;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return Image;
      case 'mp3':
      case 'wav':
      case 'flac':
        return Music;
      case 'zip':
      case 'rar':
      case '7z':
        return Archive;
      default:
        return FileText;
    }
  };

  const getDefaultIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('resolution') || lowerLabel.includes('width') || lowerLabel.includes('height')) {
      return Monitor;
    }
    if (lowerLabel.includes('size') || lowerLabel.includes('bytes')) {
      return HardDrive;
    }
    if (lowerLabel.includes('duration') || lowerLabel.includes('time') || lowerLabel.includes('length')) {
      return Clock;
    }
    return FileText;
  };

  const getDefaultColors = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('resolution') || lowerLabel.includes('width') || lowerLabel.includes('height')) {
      return { color: '#22c55e', bgColor: '#f0fdf4' };
    }
    if (lowerLabel.includes('size') || lowerLabel.includes('bytes')) {
      return { color: '#7c3aed', bgColor: '#faf5ff' };
    }
    if (lowerLabel.includes('duration') || lowerLabel.includes('time') || lowerLabel.includes('length')) {
      return { color: '#2563eb', bgColor: '#dbeafe' };
    }
    if (lowerLabel.includes('compression') || lowerLabel.includes('saved')) {
      return { color: '#14b8a6', bgColor: '#f0fdfa' };
    }
    if (lowerLabel.includes('psnr') || lowerLabel.includes('quality')) {
      return { color: '#f59e0b', bgColor: '#fffbeb' };
    }
    if (lowerLabel.includes('frames') || lowerLabel.includes('count')) {
      return { color: '#dc2626', bgColor: '#fef2f2' };
    }
    return { color: '#6b7280', bgColor: '#f9fafb' };
  };

  const renderItem = (item: FileInfoItem, index: number) => {
    const Icon = item.icon || getDefaultIcon(item.label);
    const colors = item.color && item.bgColor 
      ? { color: item.color, bgColor: item.bgColor }
      : getDefaultColors(item.label);

    if (layout === 'list') {
      return (
        <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.bgColor }}
            >
              <Icon className="w-4 h-4" style={{ color: colors.color }} />
            </div>
            <span className="text-sm font-medium" style={{ color: '#374151' }}>{item.label}</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>{item.value}</span>
        </div>
      );
    }

    if (layout === 'grid') {
      return (
        <div key={index} className="text-center">
          <div 
            className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: colors.bgColor }}
          >
            <Icon className="w-5 h-5" style={{ color: colors.color }} />
          </div>
          <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{item.label}</p>
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>{item.value}</p>
        </div>
      );
    }

    // Default: cards layout
    return (
      <div key={index} className="text-center p-4 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
        <div 
          className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
          style={{ backgroundColor: colors.bgColor }}
        >
          <Icon className="w-5 h-5" style={{ color: colors.color }} />
        </div>
        <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{item.label}</p>
        <p className="text-sm font-semibold" style={{ color: '#111827' }}>{item.value}</p>
      </div>
    );
  };

  const getLayoutClass = () => {
    switch (layout) {
      case 'list':
        return 'space-y-0';
      case 'grid':
        return getGridClass(columns);
      case 'cards':
      default:
        return getGridClass(columns);
    }
  };

  const getGridClass = (cols: number) => {
    switch (cols) {
      case 1:
        return 'grid grid-cols-1 gap-4';
      case 2:
        return 'grid grid-cols-2 gap-4';
      case 3:
        return 'grid grid-cols-3 gap-4';
      case 4:
        return 'grid grid-cols-4 gap-4';
      case 5:
        return 'grid grid-cols-5 gap-4';
      case 6:
        return 'grid grid-cols-6 gap-4';
      default:
        return 'grid grid-cols-3 gap-4';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div>
          <h3 className="font-semibold text-lg mb-1" style={{ color: '#111827' }}>
            {title}
          </h3>
        </div>
      )}
      <div className={getLayoutClass()}>
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
}; 