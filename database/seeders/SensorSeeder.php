<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sensor;
use Carbon\Carbon;

class SensorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sensors = [
            [
                'name' => 'SN-001',
                'location' => 'Sector A - Processing Unit 1',
                'type' => 'Methane',
                'status' => 'online',
                'battery_level' => 89,
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subMinutes(5),
            ],
            [
                'name' => 'SN-002',
                'location' => 'Sector A - Processing Unit 2',
                'type' => 'Temperature',
                'status' => 'online',
                'battery_level' => 76,
                'created_at' => Carbon::now()->subDays(28),
                'updated_at' => Carbon::now()->subMinutes(3),
            ],
            [
                'name' => 'SN-003',
                'location' => 'Sector B - Chemical Storage Area',
                'type' => 'Smoke',
                'status' => 'online',
                'battery_level' => 92,
                'created_at' => Carbon::now()->subDays(25),
                'updated_at' => Carbon::now()->subMinutes(2),
            ],
            [
                'name' => 'SN-004',
                'location' => 'Sector B - Chemical Storage Tank 1',
                'type' => 'Hydrogen Sulfide',
                'status' => 'maintenance',
                'battery_level' => 45,
                'created_at' => Carbon::now()->subDays(22),
                'updated_at' => Carbon::now()->subHours(6),
            ],
            [
                'name' => 'SN-005',
                'location' => 'Sector C - Pipeline Junction Alpha',
                'type' => 'Pressure',
                'status' => 'online',
                'battery_level' => 88,
                'created_at' => Carbon::now()->subDays(20),
                'updated_at' => Carbon::now()->subMinutes(1),
            ],
            [
                'name' => 'SN-006',
                'location' => 'Sector C - Pipeline Junction Beta',
                'type' => 'Methane',
                'status' => 'offline',
                'battery_level' => 12,
                'created_at' => Carbon::now()->subDays(18),
                'updated_at' => Carbon::now()->subHours(12),
            ],
            [
                'name' => 'SN-007',
                'location' => 'Sector D - Loading Bay North',
                'type' => 'Carbon Monoxide',
                'status' => 'online',
                'battery_level' => 67,
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subMinutes(8),
            ],
            [
                'name' => 'SN-008',
                'location' => 'Sector D - Loading Bay South',
                'type' => 'Oxygen',
                'status' => 'online',
                'battery_level' => 95,
                'created_at' => Carbon::now()->subDays(14),
                'updated_at' => Carbon::now()->subMinutes(4),
            ],
            [
                'name' => 'SN-009',
                'location' => 'Sector A - Ventilation System',
                'type' => 'Humidity',
                'status' => 'online',
                'battery_level' => 73,
                'created_at' => Carbon::now()->subDays(12),
                'updated_at' => Carbon::now()->subMinutes(6),
            ],
            [
                'name' => 'SN-010',
                'location' => 'Sector E - Control Room',
                'type' => 'Smoke',
                'status' => 'online',
                'battery_level' => 81,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subMinutes(2),
            ],
            [
                'name' => 'SN-011',
                'location' => 'Sector F - Waste Management',
                'type' => 'Methane',
                'status' => 'online',
                'battery_level' => 58,
                'created_at' => Carbon::now()->subDays(8),
                'updated_at' => Carbon::now()->subMinutes(7),
            ],
            [
                'name' => 'SN-012',
                'location' => 'Sector G - Power Distribution',
                'type' => 'Temperature',
                'status' => 'maintenance',
                'battery_level' => 34,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subHours(3),
            ],
            [
                'name' => 'SN-013',
                'location' => 'Sector C - Emergency Exit Route',
                'type' => 'Smoke',
                'status' => 'online',
                'battery_level' => 94,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subMinutes(1),
            ],
            [
                'name' => 'SN-014',
                'location' => 'Sector H - Raw Material Storage',
                'type' => 'Hydrogen Sulfide',
                'status' => 'online',
                'battery_level' => 71,
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subMinutes(9),
            ],
            [
                'name' => 'SN-015',
                'location' => 'Sector I - Quality Control Lab',
                'type' => 'CO2',
                'status' => 'online',
                'battery_level' => 85,
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subMinutes(3),
            ],
            [
                'name' => 'SN-016',
                'location' => 'Sector B - Chemical Mixing Station',
                'type' => 'Carbon Monoxide',
                'status' => 'offline',
                'battery_level' => 8,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subHours(18),
            ],
            [
                'name' => 'SN-017',
                'location' => 'Sector J - Maintenance Workshop',
                'type' => 'Temperature',
                'status' => 'online',
                'battery_level' => 62,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subMinutes(5),
            ],
            [
                'name' => 'SN-018',
                'location' => 'Sector K - Compressed Air System',
                'type' => 'Pressure',
                'status' => 'online',
                'battery_level' => 79,
                'created_at' => Carbon::now()->subHours(18),
                'updated_at' => Carbon::now()->subMinutes(4),
            ],
            [
                'name' => 'SN-019',
                'location' => 'Sector L - Emergency Assembly Point',
                'type' => 'Oxygen',
                'status' => 'online',
                'battery_level' => 91,
                'created_at' => Carbon::now()->subHours(12),
                'updated_at' => Carbon::now()->subMinutes(2),
            ],
            [
                'name' => 'SN-020',
                'location' => 'Sector M - Cafeteria and Break Area',
                'type' => 'Smoke',
                'status' => 'online',
                'battery_level' => 87,
                'created_at' => Carbon::now()->subHours(6),
                'updated_at' => Carbon::now()->subMinutes(6),
            ],
        ];

        foreach ($sensors as $sensorData) {
            Sensor::create($sensorData);
        }

        $this->command->info('Created ' . count($sensors) . ' sensor records successfully.');
    }
} 