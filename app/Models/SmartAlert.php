<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmartAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'alert_type',
        'symbol',
        'target_value',
        'direction',
        'configuration',
        'is_active',
        'last_triggered_at',
        'trigger_count',
    ];

    protected $casts = [
        'target_value' => 'decimal:8',
        'configuration' => 'array',
        'is_active' => 'boolean',
        'last_triggered_at' => 'datetime',
        'trigger_count' => 'integer',
    ];

    const ALERT_TYPES = [
        'price_target' => 'Price Target',
        'portfolio_rebalance' => 'Portfolio Rebalance',
        'tax_optimization' => 'Tax Optimization',
        'risk_threshold' => 'Risk Threshold',
        'market_sentiment' => 'Market Sentiment',
        'dca_reminder' => 'DCA Reminder',
        'profit_taking' => 'Profit Taking',
    ];

    const DIRECTIONS = [
        'above' => 'Above',
        'below' => 'Below',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('alert_type', $type);
    }

    public function scopeForSymbol($query, string $symbol)
    {
        return $query->where('symbol', $symbol);
    }

    public function getFormattedTargetValue(): string
    {
        if (!$this->target_value) {
            return 'N/A';
        }

        switch ($this->alert_type) {
            case 'price_target':
                return '$' . number_format($this->target_value, 2);
            case 'risk_threshold':
                return number_format($this->target_value, 1) . '%';
            default:
                return (string) $this->target_value;
        }
    }

    public function getAlertTypeLabel(): string
    {
        return self::ALERT_TYPES[$this->alert_type] ?? ucfirst(str_replace('_', ' ', $this->alert_type));
    }

    public function getDirectionLabel(): string
    {
        return self::DIRECTIONS[$this->direction] ?? ucfirst($this->direction ?? '');
    }

    public function shouldTrigger(float $currentValue): bool
    {
        if (!$this->is_active || !$this->target_value) {
            return false;
        }

        switch ($this->direction) {
            case 'above':
                return $currentValue >= $this->target_value;
            case 'below':
                return $currentValue <= $this->target_value;
            default:
                return false;
        }
    }

    public function trigger(): void
    {
        $this->update([
            'last_triggered_at' => now(),
            'trigger_count' => $this->trigger_count + 1,
        ]);
    }

    public function getConfigurationValue(string $key, $default = null)
    {
        return $this->configuration[$key] ?? $default;
    }
}