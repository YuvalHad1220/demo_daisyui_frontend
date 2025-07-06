import React from 'react';
import { Clock, Monitor, HardDrive, TrendingDown, BarChart2, Signal, Hash, Image, FileText } from 'lucide-react';

interface SidebarStepSummaryProps {
  stepIndex: number;
  currentStep: number;
  stepLabel: string;
  summaryData?: any; // shape depends on step
  icon: React.ElementType;
}

function getResolutionLabel(width?: number, height?: number): string {
  if (!width || !height) return '--';
  if (width === 7680 && height === 4320) return '8K UHD';
  if (width === 3840 && height === 2160) return '4K UHD';
  if (width === 2560 && height === 1440) return '2K QHD';
  if (width === 1920 && height === 1080) return 'FHD';
  if (width === 1280 && height === 720) return 'HD';
  return `${width}x${height}`;
}

export const SidebarStepSummary: React.FC<SidebarStepSummaryProps> = ({ 
  stepIndex, 
  currentStep, 
  stepLabel, 
  summaryData, 
  icon: Icon
}) => {
  const isCompleted = stepIndex < currentStep;
  const isCurrent = stepIndex === currentStep;
  const isFuture = stepIndex > currentStep;

  // Render compact metadata with small icons using README color guidelines
  const renderMetadata = () => {
    if (!summaryData) return null;
    
    switch (stepLabel) {
      case 'File Upload':
        return (
          <>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
              <Monitor className="w-2.5 h-2.5" />
              {getResolutionLabel(summaryData.width, summaryData.height)}
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
              <HardDrive className="w-2.5 h-2.5" />
              {summaryData.size}
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
              <Clock className="w-2.5 h-2.5" />
              {summaryData.duration}s
            </div>
          </>
        );
      case 'Encoding Finished':
        return (
          <>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
              <Clock className="w-2.5 h-2.5" />
              {summaryData.duration}s
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700">
              <TrendingDown className="w-2.5 h-2.5" />
              {summaryData.compression}%
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
              <BarChart2 className="w-2.5 h-2.5" />
              {summaryData.saved}MB
            </div>
          </>
        );
      case 'Decoding Finished':
        return (
          <>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
              <Clock className="w-2.5 h-2.5" />
              {summaryData.duration}s
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600">
              <Hash className="w-2.5 h-2.5" />
              {summaryData.frames}f
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700">
              <Signal className="w-2.5 h-2.5" />
              {summaryData.psnr}dB
            </div>
          </>
        );
      case 'Process Images':
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700">
            <Image className="w-2.5 h-2.5" />
            {summaryData.count} images
          </div>
        );
      case 'Show Timestamps':
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700">
            <FileText className="w-2.5 h-2.5" />
            {summaryData.count} screenshots
          </div>
        );
      default:
        return null;
    }
  };

  return (
      <div
        className={`flex items-center px-3 py-2.5 mx-2 my-1 h-16 rounded-lg border transition-all duration-200 cursor-pointer group hover:scale-[1.01]
          ${isCurrent 
            ? 'border-teal-200 bg-teal-50 shadow-sm' 
            : isCompleted 
              ? 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm hover:border-gray-300' 
              : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
          }
        `}
      >
        {/* Icon Container - using README color guidelines */}
        <div className="flex items-center justify-center w-7 h-7 mr-3 flex-shrink-0">
          {isCompleted ? (
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-[1.02]"
              style={{ 
                backgroundColor: '#dcfce7',
                border: '1px solid #bbf7d0'
              }}
            >
              <Icon className="w-4 h-4 text-green-600" />
            </div>
          ) : (
            <div 
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-[1.02] ${isCurrent ? '' : 'border'} ${
                isCurrent 
                  ? 'border-teal-600' 
                  : isFuture 
                    ? 'bg-gray-100 border-gray-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
              style={{
                backgroundColor: isCurrent ? '#14b8a6' : undefined
              }}
            >
              <Icon 
                className={`w-4 h-4 ${
                  isCurrent 
                    ? 'text-white' 
                    : isFuture 
                      ? 'text-gray-400' 
                      : 'text-gray-500' 
                }`}
              />
            </div>
          )}
        </div>
        
        {/* Content - improved typography hierarchy with fixed height */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center overflow-hidden">
          <div 
            className={`truncate text-sm font-semibold transition-colors duration-200 ${
              isCurrent 
                ? 'text-gray-900' 
                : isCompleted 
                  ? 'text-gray-700 group-hover:text-gray-900' 
                  : 'text-gray-500'
            }`}
          >
            {stepLabel}
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
              {renderMetadata()}
            </div>
          )}
        </div>
        
      </div>
  );
};

export default SidebarStepSummary; 