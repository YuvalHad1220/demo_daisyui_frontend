import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface Screenshot {
  url: string;
  filename: string;
  timestamp: string;
  confidence: number;
}

interface ScreenshotsGridProps {
  screenshots: Screenshot[];
  searchState: string;
  clicked: number | null;
  hoveredScreenshot: { shot: Screenshot; idx: number } | null;
  setHoveredScreenshot: (screenshot: { shot: Screenshot; idx: number } | null) => void;
  handleTimestampClick: (idx: number, ts: string) => void;
}

const ScreenshotsGrid: React.FC<ScreenshotsGridProps> = ({
  screenshots,
  searchState,
  clicked,
  hoveredScreenshot,
  setHoveredScreenshot,
  handleTimestampClick,
}) => (
  <>
    {screenshots.length === 0 ? (
      <div className="flex items-center space-x-2 mb-4 p-3 rounded-lg border" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
        <AlertCircle className="w-5 h-5" style={{ color: '#6b7280' }} />
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {searchState === 'searching' ? 'Searching for matches...' : 'No matched screenshots found.'}
        </span>
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
        {screenshots.map((shot, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {/* Screenshot with tooltip */}
            <div 
              className="relative group mb-4"
              onMouseEnter={() => setHoveredScreenshot({ shot, idx })}
              onMouseLeave={() => setHoveredScreenshot(null)}
            >
              <div className="w-48 h-30 rounded-lg overflow-hidden border" style={{ borderColor: '#e8e6e3' }}>
                <img 
                  src={shot.url} 
                  alt={`Screenshot ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
            </div>
            
            {/* Timestamp Button */}
            <button
              onClick={() => handleTimestampClick(idx, shot.timestamp)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                clicked === idx 
                  ? 'bg-teal-500 text-white border border-teal-500 shadow-md transform scale-105' 
                  : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:border-teal-300 hover:shadow-sm hover:scale-105'
              }`}
              style={{ outline: 'none' }}
            >
              <Clock className="w-4 h-4" />
              <span>{shot.timestamp}</span>
            </button>
          </div>
        ))}
      </div>
    )}
  </>
);

export default ScreenshotsGrid;
