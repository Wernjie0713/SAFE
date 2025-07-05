<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SensorController;
use App\Http\Controllers\DashboardController;
use App\Models\Alert;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $initialAlerts = Alert::with('sensor')
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

    return Inertia::render('Dashboard', [
        'initialAlerts' => $initialAlerts,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Sensor Health & Management Routes
    Route::resource('sensor-health', SensorController::class);
    
    Route::get('/robot-camera-view', function () {
        $alerts = Alert::where('type', 'Visual Hazard')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();
            
        return Inertia::render('RobotCameraView', [
            'alerts' => $alerts
        ]);
    })->name('robot.camera');

    Route::post('/robot-camera-view/inspect', [App\Http\Controllers\Api\RobotInspectionController::class, 'inspect'])
        ->name('robot.inspect');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/alerts/{alert}', [AlertController::class, 'show'])->name('alerts.show');
    Route::patch('/alerts/{alert}', [AlertController::class, 'update'])->name('alerts.update');

    Route::get('/historical-reports', [ReportController::class, 'index'])->name('reports.history');

    Route::get('/ai-assistant', function () {
        return Inertia::render('ChatbotAI');
    })->name('ai-assistant');

    Route::get('/sensors', [SensorController::class, 'index'])->name('sensors');
    Route::get('/alerts', [AlertController::class, 'index'])->name('alerts');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports');
    Route::get('/robot-camera', fn() => Inertia::render('RobotCameraView'))->name('robot-camera');
    Route::get('/chatbot', fn() => Inertia::render('ChatbotAI'))->name('chatbot');
    Route::get('/demo-controls', fn() => Inertia::render('DemoControlPanel'))->name('demo-controls');
});

require __DIR__.'/auth.php';
