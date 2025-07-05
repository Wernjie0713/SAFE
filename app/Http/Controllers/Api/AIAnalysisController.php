<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Sensor;
use App\Models\SensorReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIAnalysisController extends Controller
{
    /**
     * Risk thresholds for gas sensor readings (in ppm)
     */
    private const RISK_THRESHOLDS = [
        'normal' => [
            'max' => 50,
            'description' => 'Safe operating conditions'
        ],
        'warning' => [
            'min' => 50,
            'max' => 150,
            'description' => 'Elevated levels requiring monitoring'
        ],
        'critical' => [
            'min' => 150,
            'description' => 'Dangerous levels requiring immediate action'
        ]
    ];

    /**
     * Rate of change thresholds (ppm per minute)
     */
    private const RATE_THRESHOLDS = [
        'normal' => 5,    // Up to 5 ppm/min is normal
        'warning' => 15,  // Up to 15 ppm/min is concerning
        'critical' => 15  // Above 15 ppm/min is critical
    ];

    /**
     * Analyze specific sensor readings and create an alert if necessary.
     */
    public function analyzeSensorReadings(Request $request): JsonResponse
    {
        $request->validate([
            'sensor_id' => 'required|exists:sensors,id',
            'reading_ids' => 'required|array|min:1',
            'reading_ids.*' => 'required|exists:sensor_readings,id'
        ]);

        try {
            $sensor = Sensor::findOrFail($request->sensor_id);

            // Get the specified readings with timestamps
            $readings = SensorReading::whereIn('id', $request->reading_ids)
                ->where('sensor_id', $sensor->id)
                ->orderBy('created_at', 'asc')
                ->get();

            if ($readings->isEmpty()) {
                return response()->json([
                    'message' => 'No readings found for analysis',
                    'data' => ['risk_level' => 'Normal']
                ]);
            }

            // Calculate rate of change (ppm per minute)
            $firstReading = $readings->first();
            $lastReading = $readings->last();
            $timeSpanMinutes = max(1, $lastReading->created_at->diffInMinutes($firstReading->created_at) ?: 1);
            $totalChange = abs($lastReading->value - $firstReading->value);
            $rateOfChange = $totalChange / $timeSpanMinutes;

            // Extract just the values for the prompt
            $readingValues = $readings->pluck('value')->toArray();
            $latestValue = end($readingValues);

            Log::info('Analyzing specific readings', [
                'sensor_id' => $sensor->id,
                'reading_count' => count($readingValues),
                'rate_of_change' => $rateOfChange,
                'latest_value' => $latestValue
            ]);

            // Build a detailed context-rich prompt
            $prompt = $this->buildAnalysisPrompt(
                $readingValues,
                $rateOfChange,
                $sensor->type ?? 'gas',
                $sensor->location ?? 'facility'
            );

            // Make API request to GPT-4
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an industrial safety AI expert specializing in gas detection systems. Always respond in valid JSON format and strictly follow the provided thresholds for risk assessment.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.3,
            ]);

            if ($response->failed()) {
                throw new \Exception('Failed to get AI analysis: ' . $response->body());
            }

            // Parse AI response
            $aiResponse = json_decode($response['choices'][0]['message']['content'], true);
            
            if (!$aiResponse || !isset($aiResponse['risk_level'])) {
                throw new \Exception('Invalid AI response format');
            }

            Log::info('AI analysis completed', [
                'risk_level' => $aiResponse['risk_level'],
                'readings_analyzed' => count($readingValues),
                'latest_value' => $latestValue,
                'rate_of_change' => $rateOfChange
            ]);

            // Create alert if risk level is not Normal
            $alert = null;
            if ($aiResponse['risk_level'] !== 'Normal') {
                $alert = Alert::create([
                    'sensor_id' => $sensor->id,
                    'type' => 'AI Predictive Alert',
                    'severity' => strtolower($aiResponse['risk_level']),
                    'description' => $aiResponse['explanation'] ?? 'No explanation provided',
                    'status' => 'new',
                    'ai_summary' => json_encode([
                        'readings' => $readingValues,
                        'analysis' => $aiResponse,
                        'reading_ids' => $request->reading_ids,
                        'metrics' => [
                            'rate_of_change' => $rateOfChange,
                            'latest_value' => $latestValue,
                            'time_span_minutes' => $timeSpanMinutes
                        ]
                    ]),
                    'ai_suggestion' => $aiResponse['recommended_action'] ?? ''
                ]);
            }

            $result = [
                'message' => 'Analysis completed successfully',
                'data' => [
                    'risk_level' => $aiResponse['risk_level'],
                    'explanation' => $aiResponse['explanation'] ?? '',
                    'recommended_action' => $aiResponse['recommended_action'] ?? '',
                    'alert_id' => $alert ? $alert->id : null,
                    'readings_analyzed' => count($readingValues),
                    'metrics' => [
                        'latest_value' => $latestValue,
                        'rate_of_change' => round($rateOfChange, 2),
                        'time_span_minutes' => $timeSpanMinutes
                    ]
                ]
            ];

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Error in AI analysis:', [
                'sensor_id' => $request->sensor_id,
                'reading_ids' => $request->reading_ids ?? [],
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to analyze sensor readings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Build a detailed, context-rich prompt for the AI analysis
     */
    private function buildAnalysisPrompt(array $readings, float $rateOfChange, string $sensorType, string $location): string
    {
        $latestValue = end($readings);
        $startValue = reset($readings);
        $trendDirection = $latestValue > $startValue ? "increasing" : ($latestValue < $startValue ? "decreasing" : "stable");

        // Convert arrays to JSON strings for string interpolation
        $readingsJson = json_encode($readings);
        $thresholds = [
            'normal' => [
                'max' => self::RISK_THRESHOLDS['normal']['max'],
                'description' => self::RISK_THRESHOLDS['normal']['description']
            ],
            'warning' => [
                'min' => self::RISK_THRESHOLDS['warning']['min'],
                'max' => self::RISK_THRESHOLDS['warning']['max'],
                'description' => self::RISK_THRESHOLDS['warning']['description']
            ],
            'critical' => [
                'min' => self::RISK_THRESHOLDS['critical']['min'],
                'description' => self::RISK_THRESHOLDS['critical']['description']
            ]
        ];

        return <<<EOT
You are an industrial safety AI analyzing gas sensor readings from a {$sensorType} sensor in the {$location}.

Safety Thresholds (in parts per million - ppm):
- Normal: Below {$thresholds['normal']['max']} ppm
  ({$thresholds['normal']['description']})
- Warning: {$thresholds['warning']['min']} to {$thresholds['warning']['max']} ppm
  ({$thresholds['warning']['description']})
- Critical: Above {$thresholds['critical']['min']} ppm
  ({$thresholds['critical']['description']})

Rate of Change Thresholds (ppm per minute):
- Normal: Up to " . self::RATE_THRESHOLDS['normal'] . " ppm/min
- Warning: " . self::RATE_THRESHOLDS['normal'] . " to " . self::RATE_THRESHOLDS['warning'] . " ppm/min
- Critical: Above " . self::RATE_THRESHOLDS['critical'] . " ppm/min

Current Metrics:
- Data Sequence: {$readingsJson}
- Latest Value: {$latestValue} ppm
- Trend Direction: {$trendDirection}
- Rate of Change: {$rateOfChange} ppm/min

Your Task:
1. Compare the latest value against the PPM thresholds
2. Evaluate the rate of change against rate thresholds
3. Consider the overall trend pattern

Classify the risk as either 'Normal', 'Warning', or 'Critical' based on BOTH:
a) The actual values compared to thresholds
b) The rate of change and trend direction

Respond in this JSON format:
{
  "risk_level": "Normal|Warning|Critical",
  "explanation": "Brief analysis of both the values and the trend",
  "recommended_action": "Specific steps to take based on the risk level"
}

Important: Even if values are increasing, maintain 'Normal' classification if they stay well below thresholds and rate of change is normal.
EOT;
    }
} 