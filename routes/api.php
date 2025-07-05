<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DataIngestionController;
use App\Http\Controllers\Api\RobotInspectionController;
use App\Http\Controllers\Api\AiAssistantController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\DemoController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\AIAnalysisController;

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
    Route::post('/robot/inspect', [RobotInspectionController::class, 'inspect']);
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

// Apply web middleware first to ensure session is available
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::post('/ingest', [DataIngestionController::class, 'store']);
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts/{alert}/acknowledge', [AlertController::class, 'acknowledge']);
    
    // Sensor routes
    Route::get('/sensors', [SensorController::class, 'index']);
    
    // AI routes
    Route::post('/ai/analyze', [AiAssistantController::class, 'analyze']);
    Route::post('/ai/chat', [AiAssistantController::class, 'chat']);
    Route::post('/ai/analyze-readings', [AIAnalysisController::class, 'analyzeSensorReadings']);
    
    // Robot inspection routes
    Route::get('/robot/status', [RobotInspectionController::class, 'status']);
    Route::post('/robot/start-inspection', [RobotInspectionController::class, 'startInspection']);
    Route::post('/robot/stop-inspection', [RobotInspectionController::class, 'stopInspection']);
    
    // Demo scenario routes
    Route::get('/demo/scenarios', [DemoController::class, 'listScenarios']);
    Route::post('/demo/trigger-scenario', [DemoController::class, 'triggerScenario']);
}); 