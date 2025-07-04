<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Alert;
use App\Models\Sensor;
use App\Models\SensorReading;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AiAssistantController extends Controller
{
    /**
     * Base system prompt that defines the AI assistant's behavior.
     */
    private string $baseSystemPrompt = "You are SAFE AI, an expert assistant for the SAFE factory monitoring system. 
        Your role is to help users understand sensor data, alerts, and safety protocols. 
        You have access to real-time data about sensor readings, alerts, and system status.
        Always prioritize safety and provide clear, actionable advice. 
        
        When responding:
        1. Always reference the real-time data provided in the context when relevant
        2. Be specific about sensor IDs, locations, and alert details when discussing them
        3. If suggesting actions, ensure they align with the current system state
        4. For critical situations, emphasize the urgency and recommend immediate actions
        5. When discussing sensor readings, consider both the current value and any active alerts
        6. Pay attention to patterns across multiple sensors in the same location
        7. When asked about a specific location, focus on providing detailed information about that area first
        
        If you're unsure about any information, acknowledge the uncertainty and suggest consulting the system documentation or a supervisor.";

    /**
     * Keywords for intent detection
     */
    private array $intentKeywords = [
        'sensor_status' => ['offline', 'down', 'not working', 'status', 'health', 'condition', 'state', 'online', 'active'],
        'alerts' => ['alert', 'warning', 'alarm', 'notification', 'incident', 'emergency'],
        'readings' => ['reading', 'measurement', 'value', 'data', 'temperature', 'pressure', 'level', 'quality', 'air'],
        'trends' => ['trend', 'pattern', 'history', 'historical', 'over time', 'graph', 'chart'],
        'safety' => ['safety', 'risk', 'hazard', 'danger', 'emergency', 'protocol', 'procedure']
    ];

    /**
     * Known location patterns for intent detection
     */
    private array $locationPatterns = [
        'sector a', 'sector b', 'sector c', 'sector d',
        'area 1', 'area 2', 'area 3', 'area 4',
        'zone 1', 'zone 2', 'zone 3', 'zone 4'
    ];

    /**
     * Get system summary information.
     */
    public function getSummary(): JsonResponse
    {
        Log::info('Fetching system summary', [
            'user_id' => Auth::id()
        ]);
        
        try {
            // Log the start of database queries
            Log::info('Querying for latest critical/high alert');
            
            // Get the most recent critical or warning alert
            $latestAlert = Alert::where('severity', 'critical')
                ->orWhere('severity', 'high')
                ->with('sensor')
                ->latest()
                ->first();

            Log::info('Latest alert query result', [
                'alert_found' => !is_null($latestAlert),
                'alert_data' => $latestAlert ? [
                    'id' => $latestAlert->id,
                    'type' => $latestAlert->type,
                    'severity' => $latestAlert->severity,
                    'sensor_id' => $latestAlert->sensor->id,
                ] : null
            ]);

            // Count offline sensors
            Log::info('Counting offline sensors');
            $offlineSensorsCount = Sensor::where('status', 'offline')->count();
            Log::info('Offline sensors count', ['count' => $offlineSensorsCount]);

            // Get the last AI recommendation from cache
            Log::info('Fetching last AI recommendation from cache');
            $lastRecommendation = Cache::get('last_ai_recommendation', 'No recent recommendations');

            // For demo purposes, randomly set robot patrol status
            $robotStatus = rand(0, 1) ? 'Patrolling Sector C' : 'Charging at Station 2';

            $responseData = [
                'latest_alert' => $latestAlert ? [
                    'type' => $latestAlert->type,
                    'severity' => $latestAlert->severity,
                    'description' => $latestAlert->description,
                    'location' => $latestAlert->sensor->location,
                    'created_at' => $latestAlert->created_at->diffForHumans(),
                ] : null,
                'offline_sensors_count' => $offlineSensorsCount,
                'last_recommendation' => $lastRecommendation,
                'robot_status' => $robotStatus,
            ];

            Log::info('System summary response prepared', ['response' => $responseData]);
            return response()->json($responseData);

        } catch (\Exception $e) {
            Log::error('System Summary Error', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to fetch system summary'
            ], 500);
        }
    }

    /**
     * Process a chat message and return the AI's response with context awareness.
     */
    public function chat(Request $request): JsonResponse
    {
        Log::info('Chat request received', [
            'user_id' => Auth::id(),
            'user_message' => $request->message,
            'conversation_id' => $request->conversation_id
        ]);

        $request->validate([
            'message' => 'required|string|max:1000',
            'conversation_id' => 'nullable|string',
        ]);

        try {
            $conversationId = $request->input('conversation_id') ?? uniqid('conv_');
            $userMessage = $request->message;
            
            // Step 1: Analyze user intent and location context
            $analysis = $this->analyzeIntent($userMessage);
            Log::info('Message analysis', [
                'intents' => $analysis['intents'],
                'location' => $analysis['location']
            ]);

            // Step 2: Fetch contextual data based on intents and location
            $contextData = $this->fetchContextualData($analysis['intents'], $analysis['location']);
            Log::info('Fetched contextual data', ['context_data' => $contextData]);

            // Step 3: Build context-rich system prompt
            $systemPrompt = $this->buildContextualPrompt($contextData, $analysis['location']);
            Log::info('Built contextual prompt', ['prompt_length' => strlen($systemPrompt)]);

            // Get conversation history
            $history = $this->getConversationHistory($conversationId);

            // Prepare the chat messages with context-rich prompt
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
                ...$history,
                ['role' => 'user', 'content' => $userMessage],
            ];

            // Make API call to OpenAI
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model'),
                'messages' => $messages,
                'temperature' => config('services.openai.temperature'),
                'max_tokens' => config('services.openai.max_tokens'),
            ]);

            if (!$response->successful()) {
                Log::error('OpenAI API Error', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                return response()->json([
                    'error' => 'Failed to get response from AI service'
                ], 500);
            }

            $aiResponse = $response->json()['choices'][0]['message']['content'];

            // Store the conversation history
            $this->storeConversationHistory($conversationId, [
                ['role' => 'user', 'content' => $userMessage],
                ['role' => 'assistant', 'content' => $aiResponse],
            ]);

            return response()->json([
                'message' => $aiResponse,
                'conversation_id' => $conversationId,
            ]);

        } catch (\Exception $e) {
            Log::error('AI Assistant Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'An error occurred while processing your request'
            ], 500);
        }
    }

    /**
     * Analyze the user's message to detect intents and location references.
     */
    private function analyzeIntent(string $message): array
    {
        $message = Str::lower($message);
        $detectedIntents = [];
        $locationContext = null;

        // Check for location references
        foreach ($this->locationPatterns as $location) {
            if (Str::contains($message, $location)) {
                $locationContext = $location;
                break;
            }
        }

        // Detect intents
        foreach ($this->intentKeywords as $intent => $keywords) {
            foreach ($keywords as $keyword) {
                if (Str::contains($message, $keyword)) {
                    $detectedIntents[] = $intent;
                    break;
                }
            }
        }

        // If no specific intent is detected, include basic system status
        if (empty($detectedIntents)) {
            $detectedIntents[] = 'sensor_status';
        }

        return [
            'intents' => array_unique($detectedIntents),
            'location' => $locationContext
        ];
    }

    /**
     * Fetch relevant contextual data based on detected intents and location.
     */
    private function fetchContextualData(array $intents, ?string $location = null): array
    {
        $contextData = [];
        $locationCondition = $location ? DB::raw("LOWER(sensors.location) = '" . Str::lower($location) . "'") : null;

        foreach ($intents as $intent) {
            switch ($intent) {
                case 'sensor_status':
                    // Get all sensors with their latest readings
                    $query = Sensor::select(
                        'sensors.id',
                        'sensors.name',
                        'sensors.location',
                        'sensors.type',
                        'sensors.status',
                        'sensors.battery_level',
                        DB::raw('(SELECT value FROM sensor_readings WHERE sensor_id = sensors.id ORDER BY reading_time DESC LIMIT 1) as latest_reading'),
                        DB::raw('(SELECT reading_time FROM sensor_readings WHERE sensor_id = sensors.id ORDER BY reading_time DESC LIMIT 1) as last_reading_time')
                    );

                    if ($locationCondition) {
                        $query->where($locationCondition);
                    }

                    $sensors = $query->get()->groupBy('status');

                    // Organize sensors by status
                    $contextData['sensor_summary'] = [
                        'total' => $sensors->flatten()->count(),
                        'online_count' => $sensors->get('online', collect())->count(),
                        'offline_count' => $sensors->get('offline', collect())->count(),
                        'maintenance_count' => $sensors->get('maintenance', collect())->count()
                    ];

                    $contextData['offline_sensors'] = $sensors->get('offline', collect());
                    $contextData['online_sensors'] = $sensors->get('online', collect());
                    $contextData['maintenance_sensors'] = $sensors->get('maintenance', collect());

                    // Get sensors with active high/critical alerts
                    $alertQuery = Alert::with(['sensor' => function ($query) {
                        $query->select('id', 'name', 'location', 'type', 'status');
                    }])
                    ->whereIn('severity', ['high', 'critical'])
                    ->where('status', '!=', 'resolved')
                    ->where('created_at', '>=', now()->subHour());

                    if ($locationCondition) {
                        $alertQuery->whereHas('sensor', function ($query) use ($locationCondition) {
                            $query->where($locationCondition);
                        });
                    }

                    $contextData['sensors_with_warnings'] = $alertQuery
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->unique('sensor_id')
                        ->take(5);
                    break;

                case 'alerts':
                    $alertQuery = Alert::with(['sensor' => function ($query) {
                        $query->select('id', 'name', 'location', 'type', 'status');
                    }])
                    ->where('status', '!=', 'resolved')
                    ->orderBy('created_at', 'desc');

                    if ($locationCondition) {
                        $alertQuery->whereHas('sensor', function ($query) use ($locationCondition) {
                            $query->where($locationCondition);
                        });
                    }

                    $contextData['recent_alerts'] = $alertQuery
                        ->take(5)
                        ->get()
                        ->map(function ($alert) {
                            return [
                                'type' => $alert->type,
                                'severity' => $alert->severity,
                                'description' => $alert->description,
                                'location' => $alert->sensor->location,
                                'sensor_name' => $alert->sensor->name,
                                'sensor_type' => $alert->sensor->type,
                                'sensor_status' => $alert->sensor->status,
                                'alert_status' => $alert->status,
                                'created_at' => $alert->created_at->diffForHumans()
                            ];
                        });
                    break;

                case 'readings':
                    // Get latest readings grouped by location with active alerts
                    $query = DB::table('sensors')
                        ->select(
                            'location',
                            DB::raw('COUNT(DISTINCT sensors.id) as sensor_count'),
                            DB::raw('COUNT(DISTINCT CASE WHEN alerts.severity IN ("high", "critical") AND alerts.status != "resolved" THEN sensors.id END) as warning_count')
                        )
                        ->leftJoin('alerts', function ($join) {
                            $join->on('sensors.id', '=', 'alerts.sensor_id')
                                ->where('alerts.created_at', '>=', now()->subDay());
                        })
                        ->where('sensors.status', 'online');

                    if ($locationCondition) {
                        $query->where($locationCondition);
                    }

                    $contextData['location_readings'] = $query
                        ->groupBy('location')
                        ->having('sensor_count', '>', 0)
                        ->get();

                    // Get recent readings for sensors with active alerts
                    $readingQuery = SensorReading::with(['sensor' => function ($query) {
                        $query->select('id', 'name', 'location', 'type', 'status');
                    }])
                    ->whereHas('sensor', function ($query) use ($locationCondition) {
                        $query->whereHas('alerts', function ($alertQuery) {
                            $alertQuery->whereIn('severity', ['high', 'critical'])
                                     ->where('status', '!=', 'resolved')
                                     ->where('created_at', '>=', now()->subHours(2));
                        });
                        if ($locationCondition) {
                            $query->where($locationCondition);
                        }
                    })
                    ->orderBy('reading_time', 'desc');

                    $contextData['abnormal_readings'] = $readingQuery
                        ->take(5)
                        ->get()
                        ->map(function ($reading) {
                            return [
                                'sensor_name' => $reading->sensor->name,
                                'location' => $reading->sensor->location,
                                'sensor_type' => $reading->sensor->type,
                                'sensor_status' => $reading->sensor->status,
                                'value' => $reading->value,
                                'unit' => $reading->unit,
                                'timestamp' => $reading->reading_time->diffForHumans()
                            ];
                        });
                    break;

                case 'safety':
                    $alertQuery = Alert::with(['sensor' => function ($query) {
                        $query->select('id', 'name', 'location', 'type', 'status');
                    }])
                    ->where('severity', 'critical')
                    ->where('status', '!=', 'resolved')
                    ->where('created_at', '>=', now()->subDay())
                    ->orderBy('created_at', 'desc');

                    if ($locationCondition) {
                        $alertQuery->whereHas('sensor', function ($query) use ($locationCondition) {
                            $query->where($locationCondition);
                        });
                    }

                    $contextData['critical_alerts'] = $alertQuery
                        ->take(3)
                        ->get()
                        ->map(function ($alert) {
                            return [
                                'type' => $alert->type,
                                'description' => $alert->description,
                                'location' => $alert->sensor->location,
                                'sensor_name' => $alert->sensor->name,
                                'sensor_type' => $alert->sensor->type,
                                'sensor_status' => $alert->sensor->status,
                                'alert_status' => $alert->status,
                                'created_at' => $alert->created_at->diffForHumans()
                            ];
                        });
                    break;
            }
        }

        return $contextData;
    }

    /**
     * Build a context-rich system prompt using the fetched data.
     */
    private function buildContextualPrompt(array $contextData, ?string $location = null): string
    {
        $contextualInfo = "CURRENT SYSTEM STATUS:";
        
        if ($location) {
            $contextualInfo .= "\nFocused Location: " . Str::upper($location) . "\n";
        }
        $contextualInfo .= "\n";

        // Add comprehensive sensor status information
        if (isset($contextData['sensor_summary'])) {
            $summary = $contextData['sensor_summary'];
            $contextualInfo .= ($location ? "Location" : "Overall") . " Sensor Status:\n";
            $contextualInfo .= "- Total Sensors: {$summary['total']}\n";
            $contextualInfo .= "- Online: {$summary['online_count']}\n";
            $contextualInfo .= "- Offline: {$summary['offline_count']}\n";
            $contextualInfo .= "- In Maintenance: {$summary['maintenance_count']}\n\n";

            // Add offline sensors
            if (isset($contextData['offline_sensors']) && $contextData['offline_sensors']->isNotEmpty()) {
                $contextualInfo .= "Offline Sensors:\n";
                foreach ($contextData['offline_sensors'] as $sensor) {
                    $contextualInfo .= "- {$sensor->name} (ID: {$sensor->id}) in {$sensor->location} - Type: {$sensor->type}, Battery: {$sensor->battery_level}%\n";
                }
                $contextualInfo .= "\n";
            }

            // Add online sensors with active alerts
            if (isset($contextData['sensors_with_warnings']) && $contextData['sensors_with_warnings']->isNotEmpty()) {
                $contextualInfo .= "Online Sensors with Active Alerts:\n";
                foreach ($contextData['sensors_with_warnings'] as $alert) {
                    $contextualInfo .= "- {$alert->sensor->name} in {$alert->sensor->location} - Type: {$alert->sensor->type}, Alert: {$alert->severity} - {$alert->description}\n";
                }
                $contextualInfo .= "\n";
            }
        }

        // Add location-based readings summary
        if (isset($contextData['location_readings']) && $contextData['location_readings']->isNotEmpty()) {
            $contextualInfo .= ($location ? "Detailed Location" : "Location") . " Status Summary:\n";
            foreach ($contextData['location_readings'] as $loc) {
                $contextualInfo .= "- {$loc->location}: {$loc->sensor_count} active sensors";
                if ($loc->warning_count > 0) {
                    $contextualInfo .= " ({$loc->warning_count} with active alerts)";
                }
                $contextualInfo .= "\n";
            }
            $contextualInfo .= "\n";
        }

        // Add recent alerts
        if (isset($contextData['recent_alerts']) && $contextData['recent_alerts']->isNotEmpty()) {
            $contextualInfo .= ($location ? "Location" : "Recent") . " Active Alerts:\n";
            foreach ($contextData['recent_alerts'] as $alert) {
                $contextualInfo .= "- {$alert['severity']} alert ({$alert['alert_status']}): {$alert['description']} from {$alert['sensor_name']} ({$alert['sensor_type']}) in {$alert['location']} (Status: {$alert['sensor_status']}, {$alert['created_at']})\n";
            }
            $contextualInfo .= "\n";
        }

        // Add abnormal readings
        if (isset($contextData['abnormal_readings']) && $contextData['abnormal_readings']->isNotEmpty()) {
            $contextualInfo .= ($location ? "Location" : "Recent") . " Readings from Alerted Sensors:\n";
            foreach ($contextData['abnormal_readings'] as $reading) {
                $contextualInfo .= "- {$reading['sensor_name']} ({$reading['sensor_type']}) in {$reading['location']}: {$reading['value']} {$reading['unit']} ({$reading['timestamp']})\n";
            }
            $contextualInfo .= "\n";
        }

        // Add critical safety information
        if (isset($contextData['critical_alerts']) && $contextData['critical_alerts']->isNotEmpty()) {
            $contextualInfo .= ($location ? "Location" : "Active") . " Critical Alerts (Last 24 Hours):\n";
            foreach ($contextData['critical_alerts'] as $alert) {
                $contextualInfo .= "- {$alert['description']} from {$alert['sensor_name']} in {$alert['location']} (Status: {$alert['alert_status']}, {$alert['created_at']})\n";
            }
            $contextualInfo .= "\n";
        }

        // Combine base prompt with contextual information
        return $this->baseSystemPrompt . "\n\n" . $contextualInfo;
    }

    /**
     * Get the conversation history from cache.
     */
    private function getConversationHistory(string $conversationId): array
    {
        return Cache::get("chat_history_{$conversationId}", []);
    }

    /**
     * Store new messages in the conversation history.
     */
    private function storeConversationHistory(string $conversationId, array $newMessages): void
    {
        $history = $this->getConversationHistory($conversationId);
        $history = array_merge($history, $newMessages);

        // Keep only the last 10 messages to maintain context without exceeding token limits
        if (count($history) > 10) {
            $history = array_slice($history, -10);
        }

        // Store for 24 hours
        Cache::put("chat_history_{$conversationId}", $history, now()->addHours(24));
    }
} 