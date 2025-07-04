<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Sensor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the historical reports page.
     */
    public function index(Request $request): Response
    {
        // Validate filter inputs
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'type' => 'nullable|string',
            'severity' => 'nullable|string|in:critical,high,medium,low',
            'status' => 'nullable|string|in:new,acknowledged,resolved',
            'location' => 'nullable|string',
            'per_page' => 'nullable|integer|min:10|max:100',
        ]);

        // Build query with filters
        $query = Alert::with('sensor')
            ->select('alerts.*')
            ->join('sensors', 'alerts.sensor_id', '=', 'sensors.id')
            ->when($request->filled('start_date'), function ($query) use ($request) {
                $query->where('alerts.created_at', '>=', Carbon::parse($request->start_date)->startOfDay());
            })
            ->when($request->filled('end_date'), function ($query) use ($request) {
                $query->where('alerts.created_at', '<=', Carbon::parse($request->end_date)->endOfDay());
            })
            ->when($request->filled('type'), function ($query) use ($request) {
                $query->where('alerts.type', $request->type);
            })
            ->when($request->filled('severity'), function ($query) use ($request) {
                $query->where('alerts.severity', $request->severity);
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('alerts.status', $request->status);
            })
            ->when($request->filled('location'), function ($query) use ($request) {
                $query->where('sensors.location', 'like', '%' . $request->location . '%');
            })
            ->orderBy('alerts.created_at', 'desc');

        // Get filter options for dropdowns
        $filterOptions = [
            'types' => Alert::select('type')->distinct()->pluck('type'),
            'severities' => ['critical', 'high', 'medium', 'low'],
            'statuses' => ['new', 'acknowledged', 'resolved'],
            'locations' => Sensor::select('location')->distinct()->pluck('location'),
        ];

        // Get summary statistics
        $summary = [
            'total_alerts' => $query->count(),
            'by_severity' => Alert::select('severity', DB::raw('count(*) as count'))
                ->groupBy('severity')
                ->pluck('count', 'severity'),
            'by_status' => Alert::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
        ];

        // Paginate results
        $alerts = $query->paginate($request->input('per_page', 25))
            ->withQueryString()
            ->through(function ($alert) {
                return [
                    'id' => $alert->id,
                    'type' => $alert->type,
                    'severity' => $alert->severity,
                    'status' => $alert->status,
                    'description' => $alert->description,
                    'created_at' => $alert->created_at->format('Y-m-d H:i:s'),
                    'created_at_diff' => $alert->created_at->diffForHumans(),
                    'sensor' => [
                        'name' => $alert->sensor->name,
                        'location' => $alert->sensor->location,
                        'type' => $alert->sensor->type,
                    ],
                ];
            });

        return Inertia::render('ReportHistory', [
            'alerts' => $alerts,
            'filters' => [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'type' => $request->type,
                'severity' => $request->severity,
                'status' => $request->status,
                'location' => $request->location,
                'per_page' => $request->input('per_page', 25),
            ],
            'filterOptions' => $filterOptions,
            'summary' => $summary,
        ]);
    }
} 