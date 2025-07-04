<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
{
    /**
     * Display the specified alert.
     */
    public function show(Alert $alert): Response
    {
        // Load the alert with its related sensor
        $alert->load('sensor');

        // Format the alert data for the frontend
        $alertData = [
            'id' => $alert->id,
            'type' => $alert->type,
            'severity' => $alert->severity,
            'description' => $alert->description,
            'status' => $alert->status,
            'created_at' => $alert->created_at->format('F j, Y g:i A'),
            'created_at_diff' => $alert->created_at->diffForHumans(),
            'updated_at' => $alert->updated_at->format('F j, Y g:i A'),
            'ai_summary' => $alert->ai_summary,
            'ai_suggestion' => $alert->ai_suggestion,
            'sensor' => [
                'id' => $alert->sensor->id,
                'name' => $alert->sensor->name,
                'type' => $alert->sensor->type,
                'location' => $alert->sensor->location,
                'status' => $alert->sensor->status,
                'battery_level' => $alert->sensor->battery_level,
                'battery_status' => $alert->sensor->battery_status,
            ],
        ];

        return Inertia::render('AlertDetail', [
            'alert' => $alertData,
        ]);
    }

    /**
     * Update the specified alert's status.
     */
    public function update(Request $request, Alert $alert)
    {
        $request->validate([
            'status' => 'required|string|in:acknowledged,resolved',
        ]);

        $alert->status = $request->status;
        $alert->save();

        return redirect()->back()->with('success', 'Alert status updated successfully.');
    }

    /**
     * Generate AI summary and suggestions for an alert.
     */
    public function generateSummary(Alert $alert)
    {
        try {
            // Check if summary already exists
            if ($alert->ai_summary !== null) {
                return response()->json([
                    'ai_summary' => $alert->ai_summary,
                    'ai_suggestion' => $alert->ai_suggestion,
                ]);
            }

            // Load sensor relationship if not already loaded
            if (!$alert->relationLoaded('sensor')) {
                $alert->load('sensor');
            }

            // Construct the context for the AI
            $context = [
                'alert_type' => $alert->type,
                'severity' => $alert->severity,
                'description' => $alert->description,
                'sensor_name' => $alert->sensor->name,
                'sensor_type' => $alert->sensor->type,
                'location' => $alert->sensor->location,
                'status' => $alert->status,
                'occurred_at' => $alert->created_at->format('F j, Y g:i A'),
            ];

            // Construct the prompt for the AI
            $prompt = "You are SAFE AI, an expert assistant for the SAFE factory monitoring system. 
                Analyze this alert and provide:
                1. A clear, concise summary of the incident (2-3 sentences)
                2. A prioritized list of 2-3 specific, actionable suggestions for the safety officer

                Alert Context:
                - Type: {$context['alert_type']}
                - Severity: {$context['severity']}
                - Description: {$context['description']}
                - Sensor: {$context['sensor_name']} ({$context['sensor_type']})
                - Location: {$context['location']}
                - Status: {$context['status']}
                - Occurred: {$context['occurred_at']}

                Format your response in JSON with two fields:
                {
                    \"summary\": \"your incident summary here\",
                    \"suggestions\": \"your prioritized suggestions here\"
                }";

            // Make API call to OpenAI
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model'),
                'messages' => [
                    ['role' => 'system', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens' => 500,
                'response_format' => ['type' => 'json_object'],
            ]);

            if (!$response->successful()) {
                Log::error('OpenAI API Error', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                return response()->json([
                    'error' => 'Failed to generate AI summary'
                ], 500);
            }

            // Parse the AI response
            $aiResponse = json_decode($response->json()['choices'][0]['message']['content'], true);

            // Update the alert with AI-generated content
            $alert->update([
                'ai_summary' => $aiResponse['summary'],
                'ai_suggestion' => $aiResponse['suggestions']
            ]);

            return response()->json([
                'ai_summary' => $aiResponse['summary'],
                'ai_suggestion' => $aiResponse['suggestions']
            ]);

        } catch (\Exception $e) {
            Log::error('AI Summary Generation Error', [
                'message' => $e->getMessage(),
                'alert_id' => $alert->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to generate AI summary'
            ], 500);
        }
    }
} 