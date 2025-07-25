<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Watchlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'symbol',
        'alert_price',
        'alert_target',
        'alert_type',
        'alert_enabled',
        'enabled',
        'holdings_amount',
        'holdings_type',
        'initial_investment_usd',
        'purchase_price',
        'purchase_date',
    ];

    protected $casts = [
        'alert_price' => 'decimal:8',
        'alert_target' => 'decimal:8',
        'purchase_price' => 'decimal:8',
        'holdings_amount' => 'decimal:8',
        'initial_investment_usd' => 'decimal:2',
        'enabled' => 'boolean',
        'alert_enabled' => 'boolean',
        'purchase_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'symbol', 'symbol');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForSymbol($query, string $symbol)
    {
        return $query->where('symbol', $symbol);
    }

    public function shouldAlert(float $currentPrice): bool
    {
        return $this->enabled &&
            $this->alert_price &&
            $currentPrice >= $this->alert_price;
    }
}
