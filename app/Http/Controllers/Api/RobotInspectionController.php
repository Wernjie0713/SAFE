<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RobotInspectionController extends Controller
{
    // Only for backup usage, when Vertex AI is clash or not setup properly in comp
    private $possibleAlerts = [
        [
            'type' => 'Corrosion Alert',
            'description' => 'Severe rust detected on pipe joints, potential structural weakness.',
            'severity' => 'critical'
        ],
        [
            'type' => 'Material Degradation',
            'description' => 'Surface rust spreading along pipe exterior, early intervention recommended.',
            'severity' => 'medium'
        ],
        [
            'type' => 'Pipe Integrity Warning',
            'description' => 'Deep rust penetration observed, possible leak risk.',
            'severity' => 'high'
        ],
        [
            'type' => 'Maintenance Alert',
            'description' => 'Initial rust formation detected on pipe surface, preventive maintenance needed.',
            'severity' => 'low'
        ],
        [
            'type' => 'Structural Warning',
            'description' => 'Advanced corrosion at pipe support points, stability concerns.',
            'severity' => 'high'
        ],
        [
            'type' => 'Safety Hazard',
            'description' => 'Rust-induced pipe thinning detected, pressure containment risk.',
            'severity' => 'critical'
        ]
    ];

    private function getRandomAlerts($count = 2)
    {
        $alerts = $this->possibleAlerts;
        shuffle($alerts);
        return array_slice($alerts, 0, min($count, count($alerts)));
    }

    /**
     * Process a robot inspection image and create alerts if hazards are detected.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function inspect(Request $request)
    {
        $request->validate([
            'image' => ['nullable', 'image', 'max:10240'], // Max 10MB
        ]);

        if ($request->query('test') === 'true') {
            return response()->json([
                'hazard' => 'fire',
                'message' => 'Sample hazard detected for testing purposes.'
            ]);
        }

        try {
            // Use sample image if no image is uploaded
            $imagePath = $request->file('image') ? $request->file('image')->store('temp/inspections', 'public') : 'sample-hazard.jpg';
            $imageUrl = Storage::url($imagePath);
            
            // If using the sample image, ensure it exists
            if ($imagePath === 'sample-hazard.jpg' && !Storage::disk('public')->exists($imagePath)) {
                return back()->with('error', 'Sample image not found.');
            }

            // Get the Vision AI configuration
            $visionApiEndpoint = config('services.vertex_ai.vision_endpoint');
            $apiKey = config('services.vertex_ai.api_key');

            // Check if the endpoint is null
            if (is_null($visionApiEndpoint)) {
                // Return an Inertia response with random alerts if the Vision API endpoint is not configured
                return Inertia::render('RobotCameraView', [
                    'hazard' => 'sample_hazard',
                    'message' => 'Sample output due to Vision API endpoint not configured.',
                    'alerts' => $this->getRandomAlerts(rand(1, 3)), // Return 1-3 random alerts
                ]);
            }

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
                // Return a sample output if there is an issue with Vision AI
                return response()->json([
                    'hazard' => 'sample_hazard',
                    'message' => 'Sample output due to Vision AI issue.'
                ]);
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