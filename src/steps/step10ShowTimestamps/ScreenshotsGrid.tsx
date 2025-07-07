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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {screenshots.map((shot, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {/* Screenshot with tooltip */}
            <div 
              className="relative group mb-3"
              onMouseEnter={() => setHoveredScreenshot({ shot, idx })}
              onMouseLeave={() => setHoveredScreenshot(null)}
            >
              <div className="w-32 h-20 rounded-lg overflow-hidden border" style={{ borderColor: '#e8e6e3' }}>
                <img 
                  src={shot.url} 
                  alt={`Screenshot ${idx + 1}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Tooltip */}
              {hoveredScreenshot && hoveredScreenshot.idx === idx && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50">
                  <div className="rounded-lg shadow-lg p-4" style={{ background: '#fdfcfb', borderColor: '#e8e6e3', border: '1px solid', minWidth: '240px' }}>
                    <img
                      src={shot.url}
                      alt={shot.filename}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>
                        {shot.filename}
                      </p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>
                        Timestamp: {shot.timestamp}
                      </p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>
                        Confidence: {shot.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
