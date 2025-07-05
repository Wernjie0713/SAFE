<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sensor;
use Illuminate\Http\JsonResponse;

class SensorController extends Controller
{
    public function index(): JsonResponse
    {
        $sensors = Sensor::select('id', 'name', 'location', 'type')
            ->orderBy('name')
            ->get();

        return response()->json($sensors);
    }
} 