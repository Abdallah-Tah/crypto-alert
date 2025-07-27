export interface PortfolioHolding {
    id: number;
    symbol: string;
    name?: string;
    current_price: number;
    price_change_24h: number;
    holdings_amount: number;
    holdings_type: 'usd_value' | 'coin_quantity';
    purchase_price?: number;
    logo?: string;
    total_value?: number;
    quantity?: number; // For backward compatibility
}

export interface AllocationData {
    symbol: string;
    name: string;
    value: number;
    percentage: number;
    color: string;
    priceChange24h: number;
    currentPrice: number;
    logo?: string;
    holdings: number;
    holdingsType: string;
}
