<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Sensor;

class DemoController extends Controller
{
    private array $scenarios = [
        'critical_leak' => [
            'values' => [10, 12, 15, 80, 150, 250, 400],
            'description' => 'Critical gas leak detected in Sector A',
            'delay' => 1000 // milliseconds
        ],
        'minor_leak' => [
            'values' => [10, 11, 12, 45, 60, 85],
            'description' => 'Minor gas leak detected in Sector B',
            'delay' => 1500
        ],
        'sensor_offline' => [
            'values' => [-1, -1, -1], // Negative values to simulate sensor failure
            'description' => 'Sensor offline detected',
            'delay' => 2000
        ]
    ];

    public function triggerScenario(Request $request)
    {
        $request->validate([
            'scenario' => 'required|string|in:' . implode(',', array_keys($this->scenarios)),
            'sensor_id' => 'required|exists:sensors,id'
        ]);

        $scenario = $this->scenarios[$request->scenario];
        $sensor = Sensor::findOrFail($request->sensor_id);

        // Dispatch a job to handle the scenario simulation
        dispatch(function () use ($scenario, $sensor) {
            foreach ($scenario['values'] as $value) {
                Http::post(url('/api/ingest'), [
                    'sensor_id' => $sensor->id,
                    'value' => $value,
                    'timestamp' => now()->toDateTimeString()
                ]);
                
                usleep($scenario['delay'] * 1000); // Convert milliseconds to microseconds
            }
        })->afterResponse();

        return response()->json([
            'message' => 'Scenario simulation started',
            'description' => $scenario['description'],
            'sensor_id' => $sensor->id
        ]);
    }
} 