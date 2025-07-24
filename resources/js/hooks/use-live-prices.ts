import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface LivePriceData {
    topMovers: Array<{
        symbol: string;
        current_price: number;
        price_change_24h: number;
    }>;
    watchlistSummary?: {
        total_coins: number;
        alerts_active: number;
        total_value: number;
    };
    timestamp: string;
    lastUpdate: string;
}

interface UseLivePricesOptions {
    interval?: number; // in milliseconds
    enabled?: boolean;
}

export function useLivePrices(options: UseLivePricesOptions = {}) {
    const { interval = 5000, enabled = true } = options; // Default 5 seconds
    const [data, setData] = useState<LivePriceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchLivePrices = async () => {
        try {
            setError(null); // Clear previous errors
            const response = await axios.get('/api/crypto/live-prices');
            
            if (response.data.success) {
                setData(response.data.data);
                setLastUpdate(response.data.data.lastUpdate);
                setError(null);
            } else {
                setError('Failed to fetch live prices');
                console.error('API error:', response.data);
            }
        } catch (err) {
            setError('Network error while fetching prices');
            console.error('Live prices fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetchLivePrices();

        // Set up interval
        intervalRef.current = setInterval(fetchLivePrices, interval);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [interval, enabled]);

    const refetch = () => {
        setLoading(true);
        fetchLivePrices();
    };

    const pause = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const resume = () => {
        if (!intervalRef.current && enabled) {
            intervalRef.current = setInterval(fetchLivePrices, interval);
        }
    };

    return {
        data,
        loading,
        error,
        lastUpdate,
        refetch,
        pause,
        resume,
        isActive: !!intervalRef.current
    };
}
