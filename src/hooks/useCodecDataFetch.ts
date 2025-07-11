import { useCallback, useState } from 'react';

interface VideoData {
    psnr: number;
    video_url: string;
}

type Codec = 'av1' | 'h264' | 'h265';

export const useCodecDataFetch = (key: string) => {
    const [videoDataMap, setVideoDataMap] = useState<Record<Codec, VideoData | null>>({
        av1: null,
        h264: null,
        h265: null,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async (quality: string = 'medium') => {
        setLoading(true);
        setError(null);

        try {
            const codecs: Codec[] = ['av1', 'h264', 'h265'];
            const results: Record<Codec, VideoData | null> = {
                av1: null,
                h264: null,
                h265: null,
            };

            for (const codec of codecs) {
                const res = await fetch('http://localhost:9000/encode_and_psnr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, codec, quality }),
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch data for codec: ${codec}`);
                }

                const result = await res.json();

                if (result.result !== 'ok') {
                    throw new Error(`Error for codec ${codec}: ${result.message}`);
                }

                results[codec] = {
                    psnr: typeof result.data.psnr === 'number' ? parseFloat(result.data.psnr) : result.data.psnr,
                    video_url: `http://localhost:9000/stream/${result.data.encoded_path}`,
                };
            }

            setVideoDataMap(results);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setLoading(false);
        }
    }, [key]);

    return { videoDataMap, loading, error, fetchData };
};
