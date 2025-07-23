<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'symbol',
        'message',
        'triggered_at',
        'type',
        'target_price',
        'current_price',
        'acknowledged',
    ];

    protected $casts = [
        'triggered_at' => 'datetime',
        'target_price' => 'decimal:8',
        'current_price' => 'decimal:8',
        'acknowledged' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnacknowledged($query)
    {
        return $query->where('acknowledged', false);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForSymbol($query, string $symbol)
    {
        return $query->where('symbol', $symbol);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('triggered_at', '>=', now()->subHours($hours));
    }

    public function markAsAcknowledged(): bool
    {
        return $this->update(['acknowledged' => true]);
    }
}
