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
use Illuminate\Support\Facades\Auth;

class AiAssistantController extends Controller
{
    /**
     * The system prompt that defines the AI assistant's behavior.
     */
    private string $systemPrompt = "You are SAFE AI, an expert assistant for the SAFE factory monitoring system. 
        Your role is to help users understand sensor data, alerts, and safety protocols. 
        You have access to historical data about sensor readings, alerts, and safety incidents. 
        Always prioritize safety and provide clear, actionable advice. 
        If you're unsure about any information, acknowledge the uncertainty and suggest consulting the system documentation or a supervisor.";

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
     * Process a chat message and return the AI's response.
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
            
            Log::info('Fetching conversation history', ['conversation_id' => $conversationId]);
            $history = $this->getConversationHistory($conversationId);
            Log::info('Conversation history retrieved', [
                'history_count' => count($history),
                'history' => $history
            ]);

            // Prepare the chat message for the AI
            $messages = [
                ['role' => 'system', 'content' => $this->systemPrompt],
                ...$history,
                ['role' => 'user', 'content' => $request->message],
            ];

            Log::info('Preparing OpenAI API request', [
                'model' => config('services.openai.model'),
                'messages_count' => count($messages),
                'temperature' => config('services.openai.temperature'),
                'max_tokens' => config('services.openai.max_tokens')
            ]);

            // Log the full messages payload for debugging
            Log::debug('Full OpenAI request payload', [
                'messages' => $messages,
                'api_key_set' => !empty(config('services.openai.api_key'))
            ]);

            // Make API call to the LLM service
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model'),
                'messages' => $messages,
                'temperature' => config('services.openai.temperature'),
                'max_tokens' => config('services.openai.max_tokens'),
            ]);

            // Log the complete API response for debugging
            Log::debug('OpenAI API response', [
                'status' => $response->status(),
                'body' => $response->json(),
                'headers' => $response->headers()
            ]);

            if (!$response->successful()) {
                Log::error('OpenAI API Error', [
                    'status' => $response->status(),
                    'response' => $response->json(),
                    'headers' => $response->headers()
                ]);
                return response()->json([
                    'error' => 'Failed to get response from AI service'
                ], 500);
            }

            $aiResponse = $response->json()['choices'][0]['message']['content'];
            Log::info('Successfully received AI response', [
                'response_length' => strlen($aiResponse)
            ]);

            // Store the conversation history
            Log::info('Storing updated conversation history');
            $this->storeConversationHistory($conversationId, [
                ['role' => 'user', 'content' => $request->message],
                ['role' => 'assistant', 'content' => $aiResponse],
            ]);

            return response()->json([
                'message' => $aiResponse,
                'conversation_id' => $conversationId,
            ]);

        } catch (\Exception $e) {
            Log::error('AI Assistant Error', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => [
                    'message' => $request->message,
                    'conversation_id' => $request->conversation_id
                ]
            ]);

            return response()->json([
                'error' => 'An error occurred while processing your request'
            ], 500);
        }
    }

    /**
     * Get the conversation history from cache.
     */
    private function getConversationHistory(string $conversationId): array
    {
        $history = Cache::get("chat_history_{$conversationId}", []);
        Log::debug('Retrieved conversation history', [
            'conversation_id' => $conversationId,
            'history_count' => count($history)
        ]);
        return $history;
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

        Log::debug('Storing conversation history', [
            'conversation_id' => $conversationId,
            'total_messages' => count($history),
            'new_messages_count' => count($newMessages)
        ]);

        // Store for 24 hours
        Cache::put("chat_history_{$conversationId}", $history, now()->addHours(24));
    }
} 