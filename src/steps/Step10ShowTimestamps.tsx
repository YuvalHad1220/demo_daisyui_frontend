import React, { useState, useRef } from 'react';
import { Clock, AlertCircle, Camera } from 'lucide-react';
import { StageCard } from '../components/ui/StageCard';
import { useScreenshotSearch } from '../hooks/useScreenshotSearch';

interface HoveredScreenshot {
  shot: any;
  idx: number;
}

const Step10ShowTimestamps = () => {
  const [clicked, setClicked] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [hoveredScreenshot, setHoveredScreenshot] = useState<HoveredScreenshot | null>(null);

  // Video player state
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const decodedVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

  // Use the screenshot search hook
  const { 
    searchResult, 
    searchState, 
    searchError, 
    jumpToTimestamp, 
    takeScreenshot 
  } = useScreenshotSearch();

  // Get screenshots from search result
  const screenshots = searchResult?.matches || [];

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleScreenshot = async () => {
    try {
      await takeScreenshot();
      setToast('Screenshot saved!');
      setTimeout(() => setToast(''), 1800);
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      setToast('Failed to take screenshot');
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimestampClick = async (idx: number, ts: string) => {
    setClicked(idx);
    setToast(`Jumped to ${ts}`);
    setTimeout(() => setToast(''), 1200);
    
    try {
      await jumpToTimestamp(ts);
      // In a real implementation, this would control the video player
      if (videoRef.current) {
        // Convert timestamp to seconds and seek
        const [hours, minutes, seconds] = ts.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        videoRef.current.currentTime = totalSeconds;
      }
    } catch (error) {
      console.error('Failed to jump to timestamp:', error);
      setToast('Failed to jump to timestamp');
    }
  };

  return (
    <StageCard
      title="Screenshot Timestamps"
      icon={Clock}
    >
      {/* Main Content */}
      <div className="px-6 py-8 flex-1 flex flex-col">
        {/* Video Player Section */}
        {error && (
          <div className="w-full mb-4 animate-shake">
            <div className="flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#dc2626' }}>Playback Error</p>
                <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Error */}
        {searchError && (
          <div className="w-full mb-4">
            <div className="flex items-start space-x-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#dc2626' }}>Search Error</p>
                <p className="text-sm" style={{ color: '#991b1b' }}>{searchError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Player */}
        <div className="w-full max-w-xl aspect-video rounded-lg flex items-center justify-center overflow-hidden border mb-2" style={{ background: '#fdfcfb', borderColor: '#e8e6e3' }}>
          <video
            ref={videoRef}
            src={decodedVideoUrl}
            className="w-full h-full object-contain rounded-lg"
            controls
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => setError('Failed to load video.')}
            style={{ background: '#fdfcfb' }}
          />
        </div>
        
        {/* Timestamp */}
        <div className="w-full max-w-xl mb-6" style={{ textAlign: 'left' }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace', fontWeight: 400 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Screenshots Grid */}
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
        
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 border rounded-lg shadow-lg px-6 py-3 flex items-center space-x-2 animate-fade-in" style={{ background: '#fdfcfb', borderColor: '#14b8a6', zIndex: 50 }}>
            <Clock className="w-5 h-5" style={{ color: '#14b8a6' }} />
            <span className="font-semibold text-sm" style={{ color: '#14b8a6' }}>{toast}</span>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </StageCard>
  );
};

export default Step10ShowTimestamps;