import { useCallback, useState, useRef, useEffect } from 'react';

interface CodecData {
    path: string;
    psnr: number;
    file_size: number;
    compression_ratio: number;
    status: 'success' | 'error' | 'skipped' | 'no_encoder' | 'original';
}

interface VideoData {
    psnr: number;
    video_url: string;
    file_size: number;
    compression_ratio: number;
    status: 'success' | 'error' | 'skipped' | 'no_encoder' | 'original';
}

type Codec = 'av1' | 'h264' | 'h265' | 'base';

export const useCodecDataFetch = (key: string) => {
    const [videoDataMap, setVideoDataMap] = useState<Record<Codec, VideoData | null>>({
        av1: null,
        h264: null,
        h265: null,
        base: null,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);
    const retryTimeoutRef = useRef<number | null>(null);

    const fetchData = useCallback(async (force_reencode: boolean = false, isRetry: boolean = false) => {
        if (!isRetry) {
            setLoading(true);
            setError(null);
            setRetryCount(0);
        }

        try {
            const res = await fetch('http://localhost:9000/encode_and_psnr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, force_reencode }),
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch video data: ${res.status} ${res.statusText}`);
            }

            const result = await res.json();

            if (result.result !== 'ok') {
                throw new Error(`Error: ${result.message}`);
            }

            const results: Record<Codec, VideoData | null> = {
                av1: null,
                h264: null,
                h265: null,
                base: null,
            };

            // Process the codecs data from the response
            const codecsData = result.data.codecs as Record<string, CodecData>;
            
            // Map the codec names to our expected format
            const codecMapping: Record<string, Codec> = {
                'av1': 'av1',
                'h264': 'h264', 
                'h265': 'h265',
                'base': 'base'
            };

            for (const [codecName, codecData] of Object.entries(codecsData)) {
                const mappedCodec = codecMapping[codecName];
                if (mappedCodec && codecData.status !== 'error') {
                    results[mappedCodec] = {
                        psnr: codecData.psnr,
                        video_url: `http://localhost:9000/stream/${codecData.path}`,
                        file_size: codecData.file_size,
                        compression_ratio: codecData.compression_ratio,
                        status: codecData.status,
                    };
                }
            }

            setVideoDataMap(results);
            setLoading(false);
            setError(null);
            
            // Clear any pending retry timeout
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
            
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred');
            setError(error);
            
            // Always retry on failure with 2-second cooldown
            const newRetryCount = retryCount + 1;
            setRetryCount(newRetryCount);
            
            console.log(`Video fetch failed (attempt ${newRetryCount}):`, error.message);
            console.log('Retrying in 2 seconds...');
            
            // Clear any existing timeout
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            
            // Set up retry with 2-second delay
            retryTimeoutRef.current = setTimeout(() => {
                console.log(`Retrying video fetch (attempt ${newRetryCount + 1})...`);
                fetchData(force_reencode, true);
            }, 2000);
            
            // Don't set loading to false on retry attempts to keep the loading state
            if (!isRetry) {
                setLoading(false);
            }
        }
    }, [key, retryCount]);

    // Cleanup timeout on unmount
    const cleanup = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return { videoDataMap, loading, error, fetchData, retryCount };
};
