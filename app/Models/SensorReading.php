<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SensorReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'sensor_id',
        'value',
        'reading_time',
    ];

    protected $casts = [
        'value' => 'float',
        'reading_time' => 'datetime',
    ];

    /**
     * Get the sensor that owns the reading.
     */
    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class);
    }
} 