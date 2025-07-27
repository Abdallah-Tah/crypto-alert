import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Coins, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function CryptoSearch({ value, onValueChange, placeholder = 'Search cryptocurrencies...', disabled = false, className }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef();

    // Find selected option
    const selectedOption = options.find((option) => option.symbol === value);

    // Debounced search function
    const debouncedSearch = (query) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const url = `/api/crypto/search?q=${encodeURIComponent(query)}`;
                console.log('CryptoSearch: Making API call to:', url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                console.log('CryptoSearch: Response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('CryptoSearch: Received data:', data);
                    setOptions(data.results || []);
                } else {
                    const errorText = await response.text();
                    console.error('CryptoSearch: API response not ok:', response.status, response.statusText, errorText);
                    setOptions([]);
                }
            } catch (error) {
                console.error('CryptoSearch: Failed to search cryptocurrencies:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    // Load initial popular coins
    useEffect(() => {
        debouncedSearch('');
    }, []);

    // Search when query changes
    useEffect(() => {
        debouncedSearch(searchQuery);
    }, [searchQuery]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground', className)}
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        {selectedOption ? (
                            <>
                                <Coins className="h-4 w-4 flex-shrink-0 text-green-500" />
                                <span className="truncate">
                                    {selectedOption.symbol} - {selectedOption.name}
                                </span>
                            </>
                        ) : (
                            <>
                                <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                <span className="truncate">{placeholder}</span>
                            </>
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <Command shouldFilter={false}>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder="Search by name or symbol..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 p-0 text-sm focus-visible:ring-0"
                        />
                    </div>
                    <CommandList className="max-h-[300px]">
                        {loading && (
                            <div className="flex items-center justify-center py-6">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                            </div>
                        )}

                        {!loading && options.length === 0 && (
                            <CommandEmpty>
                                <div className="flex flex-col items-center py-6">
                                    <Coins className="h-12 w-12 text-muted-foreground/50" />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {searchQuery ? `No cryptocurrencies found for "${searchQuery}"` : 'No cryptocurrencies available'}
                                    </p>
                                </div>
                            </CommandEmpty>
                        )}

                        {!loading && options.length > 0 && (
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.symbol}
                                        value={option.symbol}
                                        onSelect={(currentValue) => {
                                            onValueChange(currentValue === value ? '' : currentValue);
                                            setOpen(false);
                                        }}
                                        className="flex cursor-pointer items-center justify-between"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
                                                <Coins className="h-4 w-4 text-green-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-medium">{option.symbol.replace('/USDT', '')}</span>
                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">USDT</span>
                                                </div>
                                                <p className="truncate text-sm text-muted-foreground">{option.name}</p>
                                            </div>
                                        </div>
                                        <Check
                                            className={cn(
                                                'ml-2 h-4 w-4 flex-shrink-0 text-green-500',
                                                value === option.symbol ? 'opacity-100' : 'opacity-0',
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
