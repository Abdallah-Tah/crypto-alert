import { Brain, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CryptoLoadingCard({ title, icon: Icon, description }) {
    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-50 opacity-50 dark:from-slate-950/20 dark:to-gray-950/20" />
            <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground animate-pulse" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    );
}

export function PriceLoadingSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-5 w-20" />
            <div className="ml-auto">
                <Skeleton className="h-4 w-12" />
            </div>
        </div>
    );
}

export function DashboardLoadingState() {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                <CryptoLoadingCard 
                    title="AI Suggestions" 
                    icon={Brain} 
                    description="Loading recent suggestions..."
                />
                <CryptoLoadingCard 
                    title="Top Movers" 
                    icon={TrendingUp} 
                    description="Fetching price movements..."
                />
            </div>

            {/* Recent Alerts Skeleton */}
            <CryptoLoadingCard 
                title="Recent Alerts" 
                icon={Star} 
                description="Loading alert history..."
            />
        </div>
    );
}
