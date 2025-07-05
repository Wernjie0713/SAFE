<?php

namespace Database\Seeders;

use App\Models\DemoScenario;
use Illuminate\Database\Seeder;

class DemoScenarioSeeder extends Seeder
{
    public function run()
    {
        DemoScenario::create([
            'scenario_name' => 'critical_leak',
            'description' => 'Simulates a sudden critical gas leak with rapidly increasing sensor readings',
            'data_sequence' => [10, 15, 25, 80, 150, 250, 400, 600, 800],
        ]);

        DemoScenario::create([
            'scenario_name' => 'minor_leak',
            'description' => 'Simulates a slow, minor gas leak with gradually increasing readings',
            'data_sequence' => [10, 12, 15, 18, 22, 25, 30, 35, 42],
        ]);

        DemoScenario::create([
            'scenario_name' => 'normal_operation',
            'description' => 'Simulates normal sensor fluctuations within safe ranges',
            'data_sequence' => [10, 11, 9, 12, 10, 11, 9, 10, 11],
        ]);
    }
} 