<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Sensor;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AlertSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all sensor IDs to ensure we only reference existing sensors
        $sensorIds = Sensor::pluck('id')->toArray();
        
        // Define alert types based on sensor types
        $alertTypes = [
            'Temperature' => [
                'High Temperature' => [
                    'description' => 'Temperature exceeds safe threshold at :location. Current reading: :value°C',
                    'values' => [45, 52, 68, 75, 82]
                ],
                'Critical Heat' => [
                    'description' => 'Critical temperature level detected at :location. Immediate action required. Reading: :value°C',
                    'values' => [90, 95, 98, 105, 110]
                ]
            ],
            'Methane' => [
                'Gas Leak' => [
                    'description' => 'Methane concentration above safety limit in :location. Level: :value ppm',
                    'values' => [300, 450, 600, 750, 900]
                ],
                'Critical Gas Level' => [
                    'description' => 'Dangerous methane levels detected in :location. Evacuation may be required. Level: :value ppm',
                    'values' => [1200, 1500, 1800, 2000, 2500]
                ]
            ],
            'Smoke' => [
                'Smoke Detection' => [
                    'description' => 'Smoke detected in :location. Current density: :value ppm',
                    'values' => [150, 180, 220, 250, 280]
                ],
                'Fire Risk' => [
                    'description' => 'High smoke concentration in :location indicates possible fire. Density: :value ppm',
                    'values' => [350, 400, 450, 500, 550]
                ]
            ],
            'Pressure' => [
                'High Pressure' => [
                    'description' => 'Pressure exceeds normal range in :location. Current reading: :value PSI',
                    'values' => [130, 140, 145, 150, 155]
                ],
                'Critical Pressure' => [
                    'description' => 'Dangerous pressure levels in :location. System shutdown may be required. Reading: :value PSI',
                    'values' => [160, 165, 170, 175, 180]
                ]
            ],
            'Humidity' => [
                'High Humidity' => [
                    'description' => 'Humidity above acceptable range in :location. Level: :value%',
                    'values' => [85, 87, 89, 91, 93]
                ],
                'Critical Humidity' => [
                    'description' => 'Critically high humidity in :location. Equipment damage possible. Level: :value%',
                    'values' => [95, 96, 97, 98, 99]
                ]
            ],
            'CO2' => [
                'Elevated CO2' => [
                    'description' => 'CO2 levels above normal in :location. Concentration: :value ppm',
                    'values' => [2200, 2500, 2800, 3000, 3300]
                ],
                'Dangerous CO2' => [
                    'description' => 'Hazardous CO2 concentration in :location. Ventilation required. Level: :value ppm',
                    'values' => [4000, 4500, 5000, 5500, 6000]
                ]
            ],
            'Oxygen' => [
                'Low Oxygen' => [
                    'description' => 'Oxygen level below safe threshold in :location. Current level: :value%',
                    'values' => [18.5, 18.0, 17.5, 17.0, 16.5]
                ],
                'Critical Oxygen' => [
                    'description' => 'Dangerously low oxygen levels in :location. Evacuation required. Level: :value%',
                    'values' => [16.0, 15.5, 15.0, 14.5, 14.0]
                ]
            ]
        ];

        // Generate 25-30 alerts
        $numberOfAlerts = rand(25, 30);
        $now = Carbon::now();

        for ($i = 0; $i < $numberOfAlerts; $i++) {
            // Get a random sensor
            $sensor = Sensor::find($sensorIds[array_rand($sensorIds)]);
            
            // Get alert types for this sensor's type
            $sensorAlertTypes = $alertTypes[$sensor->type] ?? [];
            if (empty($sensorAlertTypes)) continue;

            // Select a random alert type for this sensor
            $alertType = array_rand($sensorAlertTypes);
            $alertInfo = $sensorAlertTypes[$alertType];
            
            // Generate a random timestamp within the last 30 days
            $createdAt = $now->copy()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            
            // Determine status based on age and random factor
            $daysAgo = $now->diffInDays($createdAt);
            $statuses = ['new', 'acknowledged', 'resolved'];
            $status = 'new';
            
            if ($daysAgo > 20) {
                // Older alerts are more likely to be resolved
                $status = $statuses[rand(1, 2)];
            } elseif ($daysAgo > 10) {
                // Medium-age alerts might be acknowledged or resolved
                $status = $statuses[rand(0, 2)];
            } else {
                // Newer alerts are more likely to be new or acknowledged
                $status = $statuses[rand(0, 1)];
            }

            // Get a random value for this alert type
            $value = $alertInfo['values'][array_rand($alertInfo['values'])];
            
            // Determine severity based on alert type
            $severity = str_contains($alertType, 'Critical') ? 'critical' : 
                       (str_contains($alertType, 'High') || str_contains($alertType, 'Dangerous') ? 'high' : 
                       (str_contains($alertType, 'Low') ? 'medium' : 'low'));

            // Create the alert
            Alert::create([
                'sensor_id' => $sensor->id,
                'type' => $alertType,
                'severity' => $severity,
                'description' => str_replace(
                    [':location', ':value'],
                    [$sensor->location, $value],
                    $alertInfo['description']
                ),
                'status' => $status,
                'created_at' => $createdAt,
                'updated_at' => $status !== 'new' ? $createdAt->copy()->addHours(rand(1, 48)) : $createdAt
            ]);
        }
    }
} 