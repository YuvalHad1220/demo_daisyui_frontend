import React from 'react';
import { Clock, Monitor, HardDrive, TrendingDown, BarChart2, Signal, Hash, Image, FileText } from 'lucide-react';

interface SidebarStepSummaryProps {
  stepIndex: number;
  currentStep: number;
  stepLabel: string;
  summaryData?: any; // shape depends on step
  icon: React.ElementType;
  isStepCompleted: (stepIndex: number) => boolean;
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

const SidebarStat: React.FC<{
  icon: React.ElementType;
  value: React.ReactNode;
  className: string;
}> = ({ icon: StatIcon, value, className }) => (
  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${className}`}>
    <StatIcon className="w-2.5 h-2.5" />
    {value}
  </div>
);

export const SidebarStepSummary: React.FC<SidebarStepSummaryProps> = ({ 
  stepIndex, 
  currentStep, 
  stepLabel, 
  summaryData, 
  icon: Icon,
  isStepCompleted
}) => {
  const isCompleted = isStepCompleted(stepIndex);
  const isCurrent = stepIndex === currentStep;
  const isFuture = stepIndex > currentStep;

  // Render compact metadata with small icons using README color guidelines
  const renderMetadata = () => {
    if (!summaryData) return null;
    if (!summaryData.finished) return null;
    switch (stepLabel) {
      case 'File Upload':
        return (
          <>
            <SidebarStat icon={Monitor} value={getResolutionLabel(summaryData.width, summaryData.height)} className="bg-green-50 text-green-700" />
            <SidebarStat icon={HardDrive} value={summaryData.size} className="bg-purple-50 text-purple-700" />
            <SidebarStat icon={Clock} value={`${summaryData.duration}s`} className="bg-blue-50 text-blue-700" />
          </>
        );
      case 'Encoding Finished':
        if (!summaryData.inputSize || !summaryData.outputSize || !summaryData.duration) return null;
        const compression = Math.round(((summaryData.inputSize - summaryData.outputSize) / summaryData.inputSize) * 100);
        return (
          <>
            <SidebarStat icon={Clock} value={`${summaryData.duration}s`} className="bg-blue-50 text-blue-700" />
            <SidebarStat icon={TrendingDown} value={`~${compression}%`} className="bg-teal-50 text-teal-700" />
            <SidebarStat icon={BarChart2} value={`${summaryData.outputSize.toFixed(2)}MB`} className="bg-purple-50 text-purple-700" />
          </>
        );
      case 'Decoding Finished':
        return (
          <>
            <SidebarStat icon={Clock} value={`${summaryData.duration}s`} className="bg-blue-50 text-blue-700" />
            <SidebarStat icon={Hash} value={`${summaryData.frames}f`} className="bg-orange-50 text-orange-600" />
            <SidebarStat icon={Signal} value={`${summaryData.psnr}dB`} className="bg-yellow-50 text-yellow-700" />
          </>
        );
      case 'Process Images':
        return (
          <SidebarStat icon={Image} value={`${summaryData.count} images`} className="bg-teal-50 text-teal-700" />
        );
      case 'Show Timestamps':
        return (
          <SidebarStat icon={FileText} value={`${summaryData.count} screenshots`} className="bg-teal-50 text-teal-700" />
        );
      default:
        return null;
    }
  };

  const metadata = renderMetadata();

  return (
      <div
        className={`flex items-center px-3 py-2.5 mx-1 my-0.5 h-18 rounded-lg border transition-all duration-200 cursor-pointer group hover:scale-[1.01]
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
          {(isCompleted || isCurrent) && metadata && (
            <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
              {metadata}
            </div>
          )}
        </div>
        
      </div>
  );
};

export default SidebarStepSummary; 