import { useState, useEffect } from 'react';

interface UseMediaQueryOptions {
    defaultValue?: boolean;
    initializeWithValue?: boolean;
}

/**
 * Custom hook for responsive design using media queries
 * @param query - CSS media query string
 * @param options - Configuration options
 */
export function useMediaQuery(
    query: string,
    { defaultValue = false, initializeWithValue = true }: UseMediaQueryOptions = {}
): boolean {
    const getMatches = (query: string): boolean => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return defaultValue;
    };

    const [matches, setMatches] = useState<boolean>(() => {
        if (initializeWithValue) {
            return getMatches(query);
        }
        return defaultValue;
    });

    useEffect(() => {
        const matchMedia = window.matchMedia(query);

        // Triggered at the first client-side load and if query changes
        const handleChange = () => {
            setMatches(matchMedia.matches);
        };

        // Listen matchMedia
        if (matchMedia.addListener) {
            matchMedia.addListener(handleChange);
        } else {
            matchMedia.addEventListener('change', handleChange);
        }

        return () => {
            if (matchMedia.removeListener) {
                matchMedia.removeListener(handleChange);
            } else {
                matchMedia.removeEventListener('change', handleChange);
            }
        };
    }, [query]);

    return matches;
}

// Predefined breakpoint hooks for common responsive patterns
export const useBreakpoint = () => {
    const isSm = useMediaQuery('(min-width: 640px)');
    const isMd = useMediaQuery('(min-width: 768px)');
    const isLg = useMediaQuery('(min-width: 1024px)');
    const isXl = useMediaQuery('(min-width: 1280px)');
    const is2xl = useMediaQuery('(min-width: 1536px)');
    
    const isMobile = !isSm;
    const isTablet = isSm && !isLg;
    const isDesktop = isLg;

    return {
        isSm,
        isMd,
        isLg,
        isXl,
        is2xl,
        isMobile,
        isTablet,
        isDesktop,
        current: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
    };
};
