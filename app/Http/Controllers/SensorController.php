<?php

namespace App\Http\Controllers;

use App\Models\Sensor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Cache;

class SensorController extends Controller
{
    /**
     * Display the sensors dashboard page with pagination, search, and filters.
     */
    public function index(Request $request): Response
    {
        // Get filter parameters from request
        $filters = $request->only(['search', 'status', 'type', 'page']);
        $perPage = $request->input('per_page', 10);
        
        // Build the query with filters
        $query = Sensor::query()
            ->when($filters['search'] ?? null, function($q, $search) {
                $q->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, function($q, $status) {
                $q->where('status', $status);
            })
            ->when($filters['type'] ?? null, function($q, $type) {
                $q->where('type', $type);
            })
            ->orderBy('created_at', 'desc');
        
        // Get paginated results with query string
        $sensors = $query->paginate($perPage)->withQueryString();
        
        // Get unique sensor types and statuses for filters
        $sensorTypes = Sensor::distinct()->pluck('type');
        $statusOptions = Sensor::distinct()->pluck('status');
        
        // Calculate statistics (using cached values for better performance)
        $stats = Cache::remember('sensor_stats', 60, function() {
            return [
                'total' => Sensor::count(),
                'online' => Sensor::where('status', 'online')->count(),
                'offline' => Sensor::where('status', 'offline')->count(),
                'maintenance' => Sensor::where('status', 'maintenance')->count(),
                'low_battery' => Sensor::where('battery_level', '<', 25)->count(),
            ];
        });
        
        return Inertia::render('SensorHealth', [
            'sensors' => $sensors,
            'stats' => $stats,
            'filters' => array_merge($filters, ['per_page' => $perPage]),
            'sensorTypes' => $sensorTypes,
            'statusOptions' => $statusOptions,
        ]);
    }

    /**
     * Store a newly created sensor in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'type' => 'required|string|in:Methane,Smoke,Temperature,Pressure,Humidity,CO2,Oxygen',
            'status' => 'required|string|in:online,offline,maintenance',
            'battery_level' => 'required|integer|min:0|max:100',
        ]);

        Sensor::create($validated);
        Cache::forget('sensor_stats'); // Clear stats cache

        return Redirect::route('sensor-health.index', request()->query())
            ->with('success', 'Sensor created successfully.');
    }

    /**
     * Update the specified sensor in storage.
     */
    public function update(Request $request, Sensor $sensorHealth): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'type' => 'required|string|in:Methane,Smoke,Temperature,Pressure,Humidity,CO2,Oxygen',
            'status' => 'required|string|in:online,offline,maintenance',
            'battery_level' => 'required|integer|min:0|max:100',
        ]);

        $sensorHealth->update($validated);
        Cache::forget('sensor_stats'); // Clear stats cache

        return Redirect::route('sensor-health.index', request()->query())
            ->with('success', 'Sensor updated successfully.');
    }

    /**
     * Remove the specified sensor from storage.
     */
    public function destroy(Sensor $sensorHealth): RedirectResponse
    {
        $sensorHealth->delete();
        Cache::forget('sensor_stats'); // Clear stats cache

        return Redirect::route('sensor-health.index', request()->query())
            ->with('success', 'Sensor deleted successfully.');
    }
} 