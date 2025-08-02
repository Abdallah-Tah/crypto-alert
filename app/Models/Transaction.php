<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'symbol',
        'type',
        'quantity',
        'price_per_unit',
        'total_value',
        'fees',
        'exchange',
        'external_id',
        'notes',
        'transaction_date',
        'is_taxable',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'decimal:8',
        'price_per_unit' => 'decimal:8',
        'total_value' => 'decimal:8',
        'fees' => 'decimal:8',
        'transaction_date' => 'datetime',
        'is_taxable' => 'boolean',
        'metadata' => 'array',
    ];

    public const TRANSACTION_TYPES = [
        'buy' => 'Buy',
        'sell' => 'Sell',
        'transfer_in' => 'Transfer In',
        'transfer_out' => 'Transfer Out',
        'staking_reward' => 'Staking Reward',
        'airdrop' => 'Airdrop',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForSymbol($query, string $symbol)
    {
        return $query->where('symbol', $symbol);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeTaxable($query)
    {
        return $query->where('is_taxable', true);
    }

    public function scopeInDateRange($query, Carbon $startDate, Carbon $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    public function scopeBuys($query)
    {
        return $query->where('type', 'buy');
    }

    public function scopeSells($query)
    {
        return $query->where('type', 'sell');
    }

    public function isBuy(): bool
    {
        return $this->type === 'buy';
    }

    public function isSell(): bool
    {
        return $this->type === 'sell';
    }

    public function isShortTerm(): bool
    {
        return $this->transaction_date->diffInDays(now()) <= 365;
    }

    public function isLongTerm(): bool
    {
        return !$this->isShortTerm();
    }

    public function getNetValue(): float
    {
        if ($this->isBuy()) {
            return -($this->total_value + $this->fees);
        }
        
        return $this->total_value - $this->fees;
    }

    public function getCostBasis(): float
    {
        if ($this->isBuy()) {
            return $this->total_value + $this->fees;
        }
        
        return 0;
    }

    public function getTypeLabel(): string
    {
        return self::TRANSACTION_TYPES[$this->type] ?? ucfirst($this->type);
    }

    public function getFormattedValue(): string
    {
        return '$' . number_format((float) $this->total_value, 2);
    }

    public function getFormattedQuantity(): string
    {
        return number_format((float) $this->quantity, 8) . ' ' . $this->symbol;
    }
}
