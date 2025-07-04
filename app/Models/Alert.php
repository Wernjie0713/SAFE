<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'sensor_id',
        'type',
        'severity',
        'description',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [];

    /**
     * Get the sensor that triggered the alert.
     */
    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class);
    }

    /**
     * Scope a query to only include new alerts.
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope a query to only include recent alerts.
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
} 