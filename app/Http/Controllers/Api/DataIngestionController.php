<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SensorReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DataIngestionController extends Controller
{
    /**
     * Store a new sensor reading.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'sensor_id' => 'required|exists:sensors,id',
            'value' => 'required|numeric'
        ]);

        try {
            $reading = SensorReading::create([
                'sensor_id' => $request->sensor_id,
                'value' => $request->value
            ]);

            return response()->json([
                'message' => 'Reading recorded successfully',
                'data' => $reading
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error storing sensor reading:', [
                'sensor_id' => $request->sensor_id,
                'value' => $request->value,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to store sensor reading',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 