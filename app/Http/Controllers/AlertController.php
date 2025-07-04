<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;
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
} 