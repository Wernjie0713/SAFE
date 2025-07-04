<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class RobotInspectionController extends Controller
{
    /**
     * Process a robot inspection image and create alerts if hazards are detected.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function inspect(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:10240'], // Max 10MB
        ]);

        try {
            // Store the uploaded image temporarily
            $imagePath = $request->file('image')->store('temp/inspections', 'public');
            $imageUrl = Storage::url($imagePath);
            
            // Get the Vision AI configuration
            $visionApiEndpoint = config('services.vertex_ai.vision_endpoint');
            $apiKey = config('services.vertex_ai.api_key');

            // Send image to Vision AI service
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post($visionApiEndpoint, [
                'image' => [
                    'content' => base64_encode(Storage::disk('public')->get($imagePath)),
                ],
                'features' => [
                    ['type' => 'OBJECT_DETECTION'],
                    ['type' => 'SAFETY_DETECTION'],
                ],
            ]);

            // Clean up temporary image
            Storage::disk('public')->delete($imagePath);

            if (!$response->successful()) {
                Log::error('Vision AI API error', [
                    'status' => $response->status(),
                    'response' => $response->json(),
                ]);
                return back()->with('error', 'Failed to analyze image. Please try again.');
            }

            $analysis = $response->json();
            
            // Process detected hazards and create alerts
            if (isset($analysis['hazard'])) {
                Alert::create([
                    'type' => 'Visual Hazard',
                    'severity' => $this->determineSeverity($analysis['hazard']),
                    'description' => $analysis['hazard'],
                    'status' => 'new',
                ]);

                return back()->with('success', 'Visual inspection completed. Hazard detected and alert created.');
            }

            return back()->with('success', 'Visual inspection completed. No hazards detected.');

        } catch (\Exception $e) {
            Log::error('Robot inspection error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'An error occurred during the inspection. Please try again.');
        }
    }

    /**
     * Determine alert severity based on the hazard type.
     *
     * @param  string  $hazard
     * @return string
     */
    private function determineSeverity($hazard)
    {
        $criticalHazards = ['fire', 'smoke', 'explosion', 'chemical leak'];
        $highHazards = ['corrosion', 'structural damage', 'electrical hazard'];
        $mediumHazards = ['obstruction', 'spill', 'equipment malfunction'];

        $hazardLower = strtolower($hazard);

        foreach ($criticalHazards as $critical) {
            if (str_contains($hazardLower, $critical)) {
                return 'critical';
            }
        }

        foreach ($highHazards as $high) {
            if (str_contains($hazardLower, $high)) {
                return 'high';
            }
        }

        foreach ($mediumHazards as $medium) {
            if (str_contains($hazardLower, $medium)) {
                return 'medium';
            }
        }

        return 'low';
    }
} 