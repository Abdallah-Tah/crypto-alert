import { useEffect, useState, useRef, useCallback } from 'react';
import { useEcho } from '@laravel/echo-react';
import axios from 'axios';

interface ReverbLivePriceData {
    topMovers: Array<{
        symbol: string;
        current_price: number;
        price_change_24h: number;
    }>;
    watchlistSummary?: {
        total_coins: number;
        alerts_active: number;
        total_value: number;
        initial_investment: number;
        total_profit: number;
        profit_percent: number;
    };
    portfolioHoldings?: Array<{
        id: number;
        symbol: string;
        current_price: number;
        price_change_24h: number;
        holdings_amount: number;
        holdings_type: string;
        purchase_price?: number;
        name?: string;
        logo?: string;
    }>;
    timestamp: string;
    lastUpdate: string;
}

interface UseReverbLivePricesOptions {
    interval?: number; // Fallback polling interval
    symbols?: string[];
    userId?: number;
}

export function useReverbLivePrices({ interval = 60000, symbols = [], userId }: UseReverbLivePricesOptions = {}) {
    const [data, setData] = useState<ReverbLivePriceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [isActive, setIsActive] = useState(true);
    const [connected, setConnected] = useState(false);
    
    const fetchTimeoutRef = useRef<NodeJS.Timeout>();
    const abortControllerRef = useRef<AbortController>();
    const echo = useEcho();

    // Fallback data fetching
    const fetchData = useCallback(async () => {
        if (!isActive) return;

        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();
            setError(null);

            const response = await axios.get('/api/dashboard/live-data', {
                signal: abortControllerRef.current.signal,
                params: symbols.length > 0 ? { symbols: symbols.join(',') } : {},
                timeout: 10000,
            });

            const newData = response.data;
            setData(newData);
            setLastUpdate(new Date().toLocaleTimeString());
            setLoading(false);
        } catch (err: any) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                setError(err.message || 'Failed to fetch live data');
                setLoading(false);
                console.error('Live prices fetch error:', err);
            }
        }
    }, [isActive, symbols]);

    // Set up Laravel Echo/Reverb real-time listeners
    useEffect(() => {
        if (!echo || !isActive) return;

        // Listen for public crypto price updates
        const publicChannel = echo.channel('crypto-prices.public');
        
        publicChannel.subscribed(() => {
            console.log('Connected to public crypto prices channel');
            setConnected(true);
        });

        publicChannel.error((error: any) => {
            console.error('Public channel error:', error);
            setError('Real-time connection error');
        });
        
        publicChannel.listen('.price.updated', (event: any) => {
            console.log('Real-time price update received:', event);
            setData(prevData => {
                if (!prevData) return prevData;
                
                // Update the price data with new information
                const updatedData = { ...prevData };
                if (event.prices && Array.isArray(event.prices)) {
                    // Update top movers if available
                    if (updatedData.topMovers) {
                        updatedData.topMovers = updatedData.topMovers.map(mover => {
                            const updatedPrice = event.prices.find((p: any) => p.symbol === mover.symbol);
                            return updatedPrice ? { ...mover, ...updatedPrice } : mover;
                        });
                    }
                }
                updatedData.timestamp = event.timestamp;
                return updatedData;
            });
            setLastUpdate(new Date().toLocaleTimeString());
            setError(null); // Clear errors on successful update
        });

        // Listen for private user-specific updates if authenticated and userId provided
        let privateChannel: any = null;
        if (userId) {
            try {
                privateChannel = echo.private(`crypto-prices.${userId}`);
                
                privateChannel.subscribed(() => {
                    console.log(`Connected to private crypto prices channel for user ${userId}`);
                });

                privateChannel.error((error: any) => {
                    console.error('Private channel error:', error);
                });
                
                privateChannel.listen('.price.updated', (event: any) => {
                    console.log('Private price update received:', event);
                    setData(prevData => {
                        if (!prevData) return prevData;
                        
                        const updatedData = { ...prevData };
                        if (event.prices && Array.isArray(event.prices)) {
                            // Update portfolio holdings
                            if (updatedData.portfolioHoldings) {
                                updatedData.portfolioHoldings = updatedData.portfolioHoldings.map(holding => {
                                    const updatedPrice = event.prices.find((p: any) => p.symbol === holding.symbol);
                                    return updatedPrice ? { ...holding, ...updatedPrice } : holding;
                                });
                            }
                        }
                        updatedData.timestamp = event.timestamp;
                        return updatedData;
                    });
                    setLastUpdate(new Date().toLocaleTimeString());
                    setError(null); // Clear errors on successful update
                });
            } catch (err) {
                console.log('Private channel not available (user not authenticated)');
            }
        }

        // Listen for watchlist updates
        if (userId) {
            try {
                const watchlistChannel = echo.private(`watchlist.${userId}`);
                
                watchlistChannel.listen('.watchlist.updated', (event: any) => {
                    console.log('Watchlist update received:', event);
                    setData(prevData => {
                        if (!prevData) return prevData;
                        return {
                            ...prevData,
                            ...event.watchlist,
                            timestamp: event.timestamp,
                        };
                    });
                    setLastUpdate(new Date().toLocaleTimeString());
                });
            } catch (err) {
                console.log('Watchlist channel not available');
            }
        }

        return () => {
            echo.leaveChannel('crypto-prices.public');
            if (privateChannel) {
                try {
                    echo.leaveChannel(`crypto-prices.${userId}`);
                } catch (err) {
                    // Channel might not exist
                }
            }
            if (userId) {
                try {
                    echo.leaveChannel(`watchlist.${userId}`);
                } catch (err) {
                    // Channel might not exist
                }
            }
            setConnected(false);
        };
    }, [echo, isActive, userId]);

    // Initial data fetch and periodic fallback polling
    useEffect(() => {
        if (!isActive) return;

        // Initial fetch
        fetchData();

        // Set up periodic fallback fetching (longer interval since we have real-time updates)
        if (interval > 0) {
            fetchTimeoutRef.current = setInterval(fetchData, interval);
        }

        return () => {
            if (fetchTimeoutRef.current) {
                clearInterval(fetchTimeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, interval]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const pause = useCallback(() => {
        setIsActive(false);
        setConnected(false);
        if (fetchTimeoutRef.current) {
            clearInterval(fetchTimeoutRef.current);
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const resume = useCallback(() => {
        setIsActive(true);
    }, []);

    return {
        data,
        loading,
        error,
        lastUpdate,
        connected,
        refetch,
        pause,
        resume,
        isActive,
    };
}
