<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\DataIngestionController;
use App\Http\Controllers\Api\RobotInspectionController;
use App\Http\Controllers\Api\AiAssistantController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Data Ingestion Endpoint (no auth for M2M communication)
Route::post('/ingest', [DataIngestionController::class, 'store']);

// Protected routes that require web session authentication
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::get('/alerts/stats', [AlertController::class, 'stats']);
    Route::patch('/alerts/{alert}', [AlertController::class, 'update']);
    Route::post('/robot/inspect', [RobotInspectionController::class, 'inspect']);
    Route::post('/ai-assistant/chat', [AiAssistantController::class, 'chat']);
    Route::get('/ai-assistant/summary', [AiAssistantController::class, 'getSummary']);
}); 