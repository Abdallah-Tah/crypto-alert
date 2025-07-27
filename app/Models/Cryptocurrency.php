<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Cryptocurrency extends Model
{
    protected $fillable = [
        'coingecko_id',
        'symbol',
        'name',
        'trading_symbol',
        'image_url',
        'current_price',
        'market_cap',
        'market_cap_rank',
        'total_volume',
        'price_change_24h',
        'is_active',
        'last_updated',
    ];

    protected $casts = [
        'current_price' => 'decimal:8',
        'market_cap' => 'decimal:2',
        'total_volume' => 'decimal:2',
        'price_change_24h' => 'decimal:4',
        'is_active' => 'boolean',
        'last_updated' => 'datetime',
    ];

    /**
     * Scope to get only active cryptocurrencies
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to search cryptocurrencies by name or symbol
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
                ->orWhere('symbol', 'LIKE', "%{$search}%")
                ->orWhere('trading_symbol', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Scope to get top cryptocurrencies by market cap
     */
    public function scopeTopByMarketCap(Builder $query, int $limit = 100): Builder
    {
        return $query->active()
            ->whereNotNull('market_cap_rank')
            ->orderBy('market_cap_rank')
            ->limit($limit);
    }

    /**
     * Get formatted trading symbol (removes /USDT for display)
     */
    public function getDisplaySymbolAttribute(): string
    {
        return str_replace('/USDT', '', $this->trading_symbol);
    }

    /**
     * Get formatted price with proper decimals
     */
    public function getFormattedPriceAttribute(): string
    {
        if (!$this->current_price) {
            return 'N/A';
        }

        if ($this->current_price >= 1) {
            return '$' . number_format($this->current_price, 2);
        } else {
            return '$' . number_format($this->current_price, 6);
        }
    }

    /**
     * Get formatted market cap
     */
    public function getFormattedMarketCapAttribute(): string
    {
        if (!$this->market_cap) {
            return 'N/A';
        }

        if ($this->market_cap >= 1_000_000_000) {
            return '$' . number_format($this->market_cap / 1_000_000_000, 2) . 'B';
        } elseif ($this->market_cap >= 1_000_000) {
            return '$' . number_format($this->market_cap / 1_000_000, 2) . 'M';
        } else {
            return '$' . number_format($this->market_cap / 1_000, 2) . 'K';
        }
    }

    /**
     * Check if price data is stale (older than 1 hour)
     */
    public function isPriceStale(): bool
    {
        if (!$this->last_updated) {
            return true;
        }

        return $this->last_updated->diffInHours(now()) > 1;
    }
}
