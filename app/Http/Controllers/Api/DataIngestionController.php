<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Sensor;
use App\Models\SensorReading;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class DataIngestionController extends Controller
{
    /**
     * Store a new sensor reading and analyze for potential alerts.
     */
    public function store(Request $request): JsonResponse
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'sensor_id' => 'required|exists:sensors,id',
            'value' => 'required|numeric',
            'reading_time' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get the sensor
            $sensor = Sensor::findOrFail($request->sensor_id);

            // Create the sensor reading
            $reading = SensorReading::create([
                'sensor_id' => $request->sensor_id,
                'value' => $request->value,
                'reading_time' => $request->reading_time ?? now(),
            ]);

            // Analyze the reading with AI and create alert if necessary
            $this->analyzeReadingAndCreateAlert($sensor, $reading);

            return response()->json([
                'message' => 'Reading recorded successfully',
                'data' => $reading
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error ingesting sensor data: ' . $e->getMessage(), [
                'sensor_id' => $request->sensor_id,
                'value' => $request->value,
                'exception' => $e
            ]);

            return response()->json([
                'message' => 'Error processing sensor data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Analyze sensor reading using Vertex AI and create alert if necessary.
     */
    private function analyzeReadingAndCreateAlert(Sensor $sensor, SensorReading $reading): void
    {
        try {
            // Get historical readings for context
            $historicalReadings = $this->getHistoricalReadings($sensor);
            
            // Prepare data for AI analysis
            $aiPayload = $this->prepareAIPayload($sensor, $reading, $historicalReadings);
            
            // Get prediction from Vertex AI
            $prediction = $this->getPredictionFromVertexAI($aiPayload);
            
            // Create alert if prediction indicates an issue
            if ($prediction && $prediction !== 'Normal') {
                $this->createAlertFromPrediction($sensor, $reading, $prediction);
            }
        } catch (\Exception $e) {
            Log::error('Error in AI analysis: ' . $e->getMessage(), [
                'sensor_id' => $sensor->id,
                'reading_id' => $reading->id,
                'exception' => $e
            ]);
            
            // Fallback to basic threshold check if AI fails
            $this->fallbackThresholdCheck($sensor, $reading);
        }
    }

    /**
     * Get historical readings for the sensor.
     */
    private function getHistoricalReadings(Sensor $sensor): array
    {
        $historyWindow = config('services.vertex_ai.history_window', 10);
        
        return SensorReading::where('sensor_id', $sensor->id)
            ->orderBy('reading_time', 'desc')
            ->take($historyWindow)
            ->get()
            ->map(function ($reading) {
                return [
                    'value' => $reading->value,
                    'timestamp' => $reading->reading_time->timestamp
                ];
            })
            ->toArray();
    }

    /**
     * Prepare payload for Vertex AI prediction.
     */
    private function prepareAIPayload(Sensor $sensor, SensorReading $reading, array $historicalReadings): array
    {
        return [
            'instances' => [[
                'sensor_type' => $sensor->type,
                'current_reading' => $reading->value,
                'location' => $sensor->location,
                'historical_readings' => $historicalReadings,
                'metadata' => [
                    'sensor_id' => $sensor->id,
                    'reading_time' => $reading->reading_time->toIso8601String()
                ]
            ]]
        ];
    }

    /**
     * Get prediction from Vertex AI.
     */
    private function getPredictionFromVertexAI(array $payload): ?string
    {
        $endpoint = config('services.vertex_ai.endpoint');
        $apiKey = config('services.vertex_ai.api_key');
        
        if (!$endpoint || !$apiKey) {
            throw new \RuntimeException('Vertex AI configuration is missing');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json'
        ])->post($endpoint, $payload);

        if (!$response->successful()) {
            Log::error('Vertex AI API error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return null;
        }

        $result = $response->json();
        return $result['predictions'][0]['label'] ?? null;
    }

    /**
     * Create an alert based on AI prediction.
     */
    private function createAlertFromPrediction(Sensor $sensor, SensorReading $reading, string $prediction): void
    {
        // Map AI predictions to severity levels
        $severityMap = [
            'Critical' => 'critical',
            'Warning' => 'high',
            'Attention' => 'medium',
            'Anomaly' => 'low'
        ];

        $severity = $severityMap[$prediction] ?? 'medium';
        
        // Create descriptive message based on prediction
        $description = $this->generateAlertDescription($sensor, $reading, $prediction);

        Alert::create([
            'sensor_id' => $sensor->id,
            'type' => 'ai_prediction',
            'severity' => $severity,
            'description' => $description,
            'status' => 'new'
        ]);
    }

    /**
     * Generate a descriptive alert message.
     */
    private function generateAlertDescription(Sensor $sensor, SensorReading $reading, string $prediction): string
    {
        $baseMessage = match($prediction) {
            'Critical' => 'Critical condition detected',
            'Warning' => 'Warning condition detected',
            'Attention' => 'Abnormal pattern detected',
            'Anomaly' => 'Unusual behavior detected',
            default => 'Potential issue detected'
        };

        return sprintf(
            '%s by AI analysis for %s sensor in %s. Current reading: %s. Requires immediate attention.',
            $baseMessage,
            $sensor->type,
            $sensor->location,
            $reading->value
        );
    }

    /**
     * Fallback to basic threshold check if AI analysis fails.
     */
    private function fallbackThresholdCheck(Sensor $sensor, SensorReading $reading): void
    {
        $thresholds = [
            'Temperature' => ['critical' => 100, 'high' => 80],
            'Pressure' => ['critical' => 150, 'high' => 120],
            'Humidity' => ['critical' => 90, 'high' => 80],
            'CO2' => ['critical' => 5000, 'high' => 2000],
            'Methane' => ['critical' => 1000, 'high' => 500],
            'Smoke' => ['critical' => 300, 'high' => 200],
            'Oxygen' => ['critical' => 25, 'high' => 23],
        ];

        if (!isset($thresholds[$sensor->type])) return;

        $value = $reading->value;
        $sensorThresholds = $thresholds[$sensor->type];

        if ($value >= $sensorThresholds['critical']) {
            Alert::create([
                'sensor_id' => $sensor->id,
                'type' => 'threshold_exceeded',
                'severity' => 'critical',
                'description' => "Critical threshold exceeded for {$sensor->type} in {$sensor->location}. Value: {$value}",
                'status' => 'new'
            ]);
        } elseif ($value >= $sensorThresholds['high']) {
            Alert::create([
                'sensor_id' => $sensor->id,
                'type' => 'threshold_exceeded',
                'severity' => 'high',
                'description' => "High threshold exceeded for {$sensor->type} in {$sensor->location}. Value: {$value}",
                'status' => 'new'
            ]);
        }
    }
} 