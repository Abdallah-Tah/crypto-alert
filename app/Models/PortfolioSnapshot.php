<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_value',
        'snapshot_date',
        'metadata',
    ];

    protected $casts = [
        'total_value' => 'decimal:8',
        'snapshot_date' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getPerformanceData(): array
    {
        $metadata = $this->metadata ?? [];
        
        return [
            'total_value' => $this->total_value,
            'holdings' => $metadata['holdings'] ?? [],
            'btc_price' => $metadata['btc_price'] ?? null,
            'eth_price' => $metadata['eth_price'] ?? null,
            'market_cap' => $metadata['total_market_cap'] ?? null,
        ];
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('snapshot_date', [$startDate, $endDate]);
    }

    public function scopeLatest($query, int $limit = 30)
    {
        return $query->orderBy('snapshot_date', 'desc')->limit($limit);
    }
}