import { useEffect, useState, useRef, useCallback } from 'react';
import { useEcho } from '@laravel/echo-react';
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
    portfolioHoldings?: Array<{
        id: number;
        symbol: string;
        current_price: number;
        price_change_24h: number;
        holdings_amount: number;
        holdings_type: string;
        purchase_price?: number;
    }>;
    timestamp: string;
    lastUpdate: string;
}

interface CoinPrice {
    symbol: string;
    current_price: number;
    price_change_24h: number;
    last_updated: string;
}

interface UseLivePricesOptions {
    interval?: number; // in milliseconds
    enabled?: boolean;
}

// Overload for general dashboard usage
export function useLivePrices(options?: UseLivePricesOptions): {
    data: LivePriceData | null;
    loading: boolean;
    error: string | null;
    lastUpdate: string;
    refetch: () => void;
    pause: () => void;
    resume: () => void;
    isActive: boolean;
};

// Overload for specific symbols (watchlist usage)
export function useLivePrices(symbols: string[]): {
    prices: CoinPrice[];
    isLoading: boolean;
    error: string | null;
    lastUpdate: string;
    refetch: () => void;
};

export function useLivePrices(optionsOrSymbols?: UseLivePricesOptions | string[]) {
    const isSymbolsArray = Array.isArray(optionsOrSymbols);
    const options = isSymbolsArray ? {} : (optionsOrSymbols || {});
    const symbols = isSymbolsArray ? optionsOrSymbols : undefined;
    
    const { interval = 5000, enabled = true } = options; // Default 5 seconds
    const [data, setData] = useState<LivePriceData | null>(null);
    const [prices, setPrices] = useState<CoinPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchLivePrices = useCallback(async () => {
        try {
            setError(null); // Clear previous errors
            
            // Always fetch from the main live-prices API
            const response = await axios.get('/api/crypto/live-prices');
            
            if (response.data.success) {
                const apiData = response.data.data;
                
                if (symbols) {
                    // Filter the topMovers data to match requested symbols
                    const filteredPrices: CoinPrice[] = symbols.map((symbol) => {
                        const foundCoin = apiData.topMovers.find((coin: {symbol: string; current_price: number; price_change_24h: number; timestamp: string}) => 
                            coin.symbol === symbol || coin.symbol.startsWith(symbol.split('/')[0])
                        );
                        
                        if (foundCoin) {
                            return {
                                symbol,
                                current_price: foundCoin.current_price,
                                price_change_24h: foundCoin.price_change_24h,
                                last_updated: foundCoin.timestamp
                            };
                        }
                        
                        // Return placeholder data if not found
                        return {
                            symbol,
                            current_price: 0,
                            price_change_24h: 0,
                            last_updated: apiData.timestamp
                        };
                    });
                    
                    setPrices(filteredPrices);
                    setLastUpdate(apiData.lastUpdate);
                } else {
                    // Set dashboard data
                    setData(apiData);
                    setLastUpdate(apiData.lastUpdate);
                }
                
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
    }, [symbols]);

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
    }, [interval, enabled, fetchLivePrices]);

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

    // Return different data based on usage type
    if (symbols) {
        return {
            prices,
            isLoading: loading,
            error,
            lastUpdate,
            refetch
        };
    }

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
