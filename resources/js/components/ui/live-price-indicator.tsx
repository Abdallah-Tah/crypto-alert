import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Pause, Play, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivePriceIndicatorProps {
    isActive: boolean;
    lastUpdate: string;
    error?: string | null;
    onToggle: () => void;
    onRefresh: () => void;
    className?: string;
}

export function LivePriceIndicator({ 
    isActive, 
    lastUpdate, 
    error, 
    onToggle, 
    onRefresh, 
    className 
}: LivePriceIndicatorProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Status indicator */}
            <div className="flex items-center gap-1">
                {error ? (
                    <WifiOff className="h-4 w-4 text-red-500" />
                ) : (
                    <Wifi className={cn("h-4 w-4", isActive ? "text-green-500" : "text-yellow-500")} />
                )}
                <Badge 
                    variant={error ? "destructive" : isActive ? "default" : "secondary"}
                    className="text-xs"
                >
                    {error ? "Error" : isActive ? "Live" : "Paused"}
                </Badge>
            </div>

            {/* Last update time */}
            {lastUpdate && !error && (
                <span className="text-xs text-muted-foreground">
                    Updated: {lastUpdate}
                </span>
            )}

            {/* Controls */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="h-6 w-6 p-0"
                    title={isActive ? "Pause live updates" : "Resume live updates"}
                >
                    {isActive ? (
                        <Pause className="h-3 w-3" />
                    ) : (
                        <Play className="h-3 w-3" />
                    )}
                </Button>
                
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    className="h-6 w-6 p-0"
                    title="Refresh now"
                >
                    <RefreshCw className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
