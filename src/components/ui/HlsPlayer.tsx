import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  memo,
} from 'react';
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
  onBuffering?: (isBuffering: boolean) => void; // ✅ New prop
  onReady?: () => void; // ✅ New prop
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  className?: string;
  style?: React.CSSProperties;
  playbackRate?: number;
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
  onBuffering, // ✅ New prop
  onReady, // ✅ New prop
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  preload = 'metadata',
  className = '',
  style = {},
  playbackRate = (30 / 7), // Default is the diff between input and decoded output
}, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

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

  // ✅ New buffering event handlers
  const handleWaiting = useCallback(() => {
    onBuffering?.(true);
  }, [onBuffering]);

  const handleCanPlayThrough = useCallback(() => {
    onBuffering?.(false);
    onReady?.();
  }, [onBuffering, onReady]);

  const handleSeeking = useCallback(() => {
    onBuffering?.(true);
  }, [onBuffering]);

  const handleSeeked = useCallback(() => {
    onBuffering?.(false);
  }, [onBuffering]);

  const handlePlaying = useCallback(() => {
    onBuffering?.(false);
  }, [onBuffering]);

  // Expose methods
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

    videoRef.current.src = '';

    if (src.includes('.m3u8')) {
      // Handle HLS streams
      if (Hls.isSupported()) {
        console.log('HlsPlayer: Using HLS.js for video playback');

        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        hlsRef.current = new Hls({
          debug: false,
          enableWorker: true,
          xhrSetup: (xhr, url) => {
            xhr.setRequestHeader('Accept', 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*');
          }
        });

        hlsRef.current.loadSource(src);
        hlsRef.current.attachMedia(videoRef.current);

        // Apply playbackRate
        if (videoRef.current && playbackRate && playbackRate !== 1.0) {
          videoRef.current.playbackRate = playbackRate;
        }

        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HlsPlayer: HLS manifest parsed, video ready to play');
          if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate || 1.0;
            if (videoRef.current.duration) {
              onLoadedMetadata?.(videoRef.current.duration);
            }
          }
        });

        hlsRef.current.on(Hls.Events.LEVEL_LOADED, () => {
          if (videoRef.current?.duration) {
            onLoadedMetadata?.(videoRef.current.duration);
          }
        });

        // ✅ Enhanced HLS buffering events
        hlsRef.current.on(Hls.Events.BUFFER_APPENDING, () => {
          onBuffering?.(true);
        });

        hlsRef.current.on(Hls.Events.BUFFER_APPENDED, () => {
          onBuffering?.(false);
        });

        hlsRef.current.on(Hls.Events.BUFFER_EOS, () => {
          onBuffering?.(false);
          onReady?.();
        });

        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          console.error('HlsPlayer: HLS error:', data);
          if (data.fatal) {
            onError?.(`HLS playback error: ${data.details}`);
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('HlsPlayer: Using native HLS support');
        videoRef.current.src = src;
        videoRef.current.playbackRate = playbackRate || 1.0;
      } else {
        onError?.('HLS playback not supported in this browser');
      }
    } else {
      // Regular video files
      console.log('HlsPlayer: Using regular video playback');
      videoRef.current.src = src;
      videoRef.current.playbackRate = playbackRate || 1.0;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, playbackRate, onLoadedMetadata, onError, onBuffering, onReady]);

  // Reactively apply playbackRate on changes
  useEffect(() => {
    if (videoRef.current && playbackRate && playbackRate !== 1.0) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

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
      // ✅ New buffering event listeners
      onWaiting={handleWaiting}
      onCanPlayThrough={handleCanPlayThrough}
      onSeeking={handleSeeking}
      onSeeked={handleSeeked}
      onPlaying={handlePlaying}
      {...(!src?.includes('.m3u8') && { src })}
    />
  );
}));

HlsPlayer.displayName = 'HlsPlayer';

export default HlsPlayer;