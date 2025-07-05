<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemoScenario extends Model
{
    use HasFactory;

    protected $fillable = [
        'scenario_name',
        'description',
        'data_sequence'
    ];

    protected $casts = [
        'data_sequence' => 'array'
    ];

    /**
     * Get the data sequence as an array of numeric values.
     */
    public function getDataSequenceAttribute($value)
    {
        $sequence = json_decode($value, true);
        return is_array($sequence) ? array_map('floatval', $sequence) : [];
    }

    /**
     * Set the data sequence, ensuring it's stored as JSON.
     */
    public function setDataSequenceAttribute($value)
    {
        $this->attributes['data_sequence'] = is_array($value) ? json_encode($value) : $value;
    }
} 