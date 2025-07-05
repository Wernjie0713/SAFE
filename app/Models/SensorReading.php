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
    ];

    protected $casts = [
        'value' => 'float',
    ];

    /**
     * Get the sensor that owns this reading.
     */
    public function sensor(): BelongsTo
    {
        return $this->belongsTo(Sensor::class);
    }
} 