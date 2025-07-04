<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Sensor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with all required statistics.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        return Inertia::render('Dashboard', [
            'quickStats' => $this->getQuickStats(),
            'sensorDistribution' => $this->getSensorDistribution(),
            'incidentTrends' => $this->getIncidentTrends(),
        ]);
    }

    /**
     * Get quick statistics for the dashboard.
     *
     * @return array
     */
    private function getQuickStats()
    {
        $now = Carbon::now();
        $twentyFourHoursAgo = $now->copy()->subHours(24);

        return [
            'sensorsOffline' => Sensor::offline()->count(),
            'activeLeaks' => Alert::where('type', 'leak')
                ->whereIn('status', ['new', 'acknowledged'])
                ->count(),
            'criticalAlerts' => Alert::where('severity', 'critical')
                ->whereIn('status', ['new', 'acknowledged'])
                ->count(),
            'incidentsLast24h' => Alert::where('created_at', '>=', $twentyFourHoursAgo)
                ->count(),
        ];
    }

    /**
     * Get sensor status distribution.
     *
     * @return array
     */
    private function getSensorDistribution()
    {
        $distribution = Sensor::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            })
            ->toArray();

        // Ensure all possible statuses are represented
        $allStatuses = ['online', 'offline', 'maintenance'];
        foreach ($allStatuses as $status) {
            if (!isset($distribution[$status])) {
                $distribution[$status] = 0;
            }
        }

        return [
            'labels' => array_keys($distribution),
            'data' => array_values($distribution),
            'colors' => [
                'online' => '#10B981', // green
                'offline' => '#EF4444', // red
                'maintenance' => '#F59E0B', // yellow
            ],
        ];
    }

    /**
     * Get incident trends for the last 7 days.
     *
     * @return array
     */
    private function getIncidentTrends()
    {
        $startDate = Carbon::now()->subDays(6)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $dailyCounts = Alert::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $trends = [];
        $labels = [];

        // Fill in all days, including those with no incidents
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dateStr = $date->format('Y-m-d');
            $labels[] = $date->format('M d');
            $trends[] = $dailyCounts->get($dateStr)?->count ?? 0;
        }

        return [
            'labels' => $labels,
            'data' => $trends,
        ];
    }
} 