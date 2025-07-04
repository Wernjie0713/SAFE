<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    /**
     * Get recent alerts for the dashboard.
     */
    public function index(): JsonResponse
    {
        $alerts = Alert::with('sensor')
            ->new()
            ->recent()
            ->take(5)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'sensor' => [
                        'id' => $alert->sensor->id,
                        'name' => $alert->sensor->name,
                        'type' => $alert->sensor->type,
                        'location' => $alert->sensor->location,
                    ],
                    'type' => $alert->type,
                    'severity' => $alert->severity,
                    'description' => $alert->description,
                    'created_at' => $alert->created_at->diffForHumans(),
                    'created_at_raw' => $alert->created_at,
                ];
            });

        return response()->json($alerts);
    }

    /**
     * Update alert status (e.g., mark as acknowledged).
     */
    public function update(Request $request, Alert $alert): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:acknowledged,resolved',
        ]);

        $alert->update($validated);

        return response()->json([
            'message' => 'Alert status updated successfully',
            'alert' => $alert
        ]);
    }

    /**
     * Get alert statistics for the dashboard.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_new' => Alert::new()->count(),
            'by_severity' => [
                'critical' => Alert::new()->where('severity', 'critical')->count(),
                'high' => Alert::new()->where('severity', 'high')->count(),
                'medium' => Alert::new()->where('severity', 'medium')->count(),
                'low' => Alert::new()->where('severity', 'low')->count(),
            ],
        ];

        return response()->json($stats);
    }
} 