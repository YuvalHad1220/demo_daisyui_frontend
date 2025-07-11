import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback, memo } from 'react';
import Hls from 'hls.js';

export interface HlsPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  className?: string;
  style?: React.CSSProperties;
}

export interface HlsPlayerRef {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  currentTime: number;
  duration: number;
  paused: boolean;
  ended: boolean;
  videoElement: HTMLVideoElement | null;
}

/**
 * HlsPlayer - A unified video player component that handles both HLS streams and regular video files
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const playerRef = useRef<HlsPlayerRef>(null);
 *   const [currentTime, setCurrentTime] = useState(0);
 *   const [duration, setDuration] = useState(0);
 * 
 *   const handleSeek = () => {
 *     playerRef.current?.seek(30); // Seek to 30 seconds
 *   };
 * 
 *   return (
 *     <HlsPlayer
 *       ref={playerRef}
 *       src="http://localhost:9000/hls/video/stream.m3u8"
 *       onTimeUpdate={setCurrentTime}
 *       onLoadedMetadata={setDuration}
 *       onError={(error) => console.error(error)}
 *       controls
 *       className="w-full h-full"
 *     />
 *   );
 * };
 * ```
 */
const HlsPlayer = memo(forwardRef<HlsPlayerRef, HlsPlayerProps>(({
  src,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onEnded,
  onError,
  onLoadStart,
  onCanPlay,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  preload = 'metadata',
  className = '',
  style = {},
}, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Memoize event handlers to prevent re-renders
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && onLoadedMetadata) {
      onLoadedMetadata(videoRef.current.duration);
    }
  }, [onLoadedMetadata]);

  const handlePlay = useCallback(() => {
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback(() => {
    onError?.('Failed to load video');
  }, [onError]);

  const handleLoadStart = useCallback(() => {
    onLoadStart?.();
  }, [onLoadStart]);

  const handleCanPlay = useCallback(() => {
    onCanPlay?.();
  }, [onCanPlay]);

  // Expose video methods and properties through ref
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (videoRef.current) {
        return videoRef.current.play();
      }
      return Promise.resolve();
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    get currentTime() {
      return videoRef.current?.currentTime || 0;
    },
    get duration() {
      return videoRef.current?.duration || 0;
    },
    get paused() {
      return videoRef.current?.paused || true;
    },
    get ended() {
      return videoRef.current?.ended || false;
    },
    get videoElement() {
      return videoRef.current;
    },
  }), []);

  // HLS setup
  useEffect(() => {
    if (!videoRef.current || !src) {
      return;
    }

    console.log('HlsPlayer: Setting up video with URL:', src);

    // Clear any existing source
    videoRef.current.src = '';

    if (src.includes('.m3u8')) {
      // Handle HLS streams
      if (Hls.isSupported()) {
        console.log('HlsPlayer: Using HLS.js for video playback');
        
        // Destroy existing HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        hlsRef.current = new Hls({
          debug: false,
          enableWorker: true,
          xhrSetup: (xhr, url) => {
            // Ensure proper headers for HLS requests
            xhr.setRequestHeader('Accept', 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*');
          }
        });

        hlsRef.current.loadSource(src);
        hlsRef.current.attachMedia(videoRef.current);

        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HlsPlayer: HLS manifest parsed, video ready to play');
          if (videoRef.current?.duration) {
            onLoadedMetadata?.(videoRef.current.duration);
          }
        });

        hlsRef.current.on(Hls.Events.LEVEL_LOADED, () => {
          if (videoRef.current?.duration) {
            onLoadedMetadata?.(videoRef.current.duration);
          }
        });

        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          console.error('HlsPlayer: HLS error:', data);
          if (data.fatal) {
            onError?.(`HLS playback error: ${data.details}`);
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log('HlsPlayer: Using native HLS support');
        videoRef.current.src = src;
      } else {
        onError?.('HLS playback not supported in this browser');
      }
    } else {
      // Handle regular video files
      console.log('HlsPlayer: Using regular video playback');
      videoRef.current.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, onLoadedMetadata, onError]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      preload={preload}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
      onError={handleError}
      onLoadStart={handleLoadStart}
      onCanPlay={handleCanPlay}
      {...(!src?.includes('.m3u8') && { src })}
    />
  );
}));

HlsPlayer.displayName = 'HlsPlayer';

export default HlsPlayer; 