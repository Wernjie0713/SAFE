<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DataIngestionController;
use App\Http\Controllers\Api\RobotInspectionController;
use App\Http\Controllers\Api\AiAssistantController;
use App\Http\Controllers\Api\AlertController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes that require web session authentication
Route::middleware(['auth:sanctum', 'web'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Alert Management Routes
    Route::prefix('alerts')->group(function () {
        Route::get('/', [AlertController::class, 'index'])
            ->name('api.alerts.index');
        Route::get('/stats', [AlertController::class, 'stats'])
            ->name('api.alerts.stats');
        Route::get('/{alert}', [AlertController::class, 'show'])
            ->name('api.alerts.show');
        Route::post('/{alert}/generate-summary', [AlertController::class, 'generateSummary'])
            ->name('api.alerts.generate-summary')
            ->middleware('throttle:6,1'); // Limit to 6 requests per minute
        Route::patch('/{alert}', [AlertController::class, 'update'])
            ->name('api.alerts.update');
    });

    // Robot Inspection Routes
    Route::get('/robot/status', [RobotInspectionController::class, 'status']);
    Route::post('/robot/start-inspection', [RobotInspectionController::class, 'startInspection']);
    Route::post('/robot/stop-inspection', [RobotInspectionController::class, 'stopInspection']);
    
    // AI Assistant Routes
    Route::prefix('ai-assistant')->group(function () {
        Route::post('/chat', [AiAssistantController::class, 'chat'])
            ->name('api.ai-assistant.chat')
            ->middleware('throttle:60,1'); // Limit to 60 requests per minute
        Route::get('/summary', [AiAssistantController::class, 'getSummary'])
            ->name('api.ai-assistant.summary');
    });
});

// Data Ingestion Routes (separate middleware for M2M communication)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/ingest/sensor-data', [DataIngestionController::class, 'store']);
}); 