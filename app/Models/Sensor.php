<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'location',
        'type',
        'status',
        'battery_level',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'battery_level' => 'integer',
    ];

    /**
     * Get the battery level status.
     */
    public function getBatteryStatusAttribute(): string
    {
        if ($this->battery_level >= 75) {
            return 'good';
        } elseif ($this->battery_level >= 25) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Get the status color for UI display.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'online' => 'green',
            'offline' => 'red',
            'maintenance' => 'yellow',
            default => 'gray',
        };
    }

    /**
     * Scope a query to only include online sensors.
     */
    public function scopeOnline($query)
    {
        return $query->where('status', 'online');
    }

    /**
     * Scope a query to only include offline sensors.
     */
    public function scopeOffline($query)
    {
        return $query->where('status', 'offline');
    }
} 