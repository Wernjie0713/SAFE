<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DemoScenario;
use App\Models\Sensor;
use App\Models\SensorReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DemoController extends Controller
{
    /**
     * Trigger a demo scenario by simulating sensor readings over time.
     */
    public function triggerScenario(Request $request): JsonResponse
    {
        Log::info('Starting demo scenario trigger', [
            'request_data' => $request->all()
        ]);

        $request->validate([
            'scenario_name' => 'required|string|exists:demo_scenarios,scenario_name',
            'sensor_id' => 'required|exists:sensors,id'
        ]);

        try {
            // Get the demo scenario
            $scenario = DemoScenario::where('scenario_name', $request->scenario_name)->firstOrFail();
            
            Log::info('Found demo scenario', [
                'scenario_name' => $scenario->scenario_name,
                'data_sequence_count' => count($scenario->data_sequence)
            ]);

            // Verify sensor exists
            $sensor = Sensor::findOrFail($request->sensor_id);
            
            Log::info('Found sensor', [
                'sensor_id' => $sensor->id,
                'sensor_name' => $sensor->name
            ]);

            // Process each reading in the sequence with a delay
            $readingIds = [];
            foreach ($scenario->data_sequence as $index => $value) {
                Log::info('Processing reading', [
                    'index' => $index,
                    'value' => $value,
                    'sensor_id' => $request->sensor_id
                ]);

                try {
                    // Store the reading directly using the model
                    $reading = SensorReading::create([
                        'sensor_id' => $request->sensor_id,
                        'value' => $value
                    ]);

                    $readingIds[] = $reading->id;

                    Log::info('Successfully stored reading', [
                        'index' => $index,
                        'reading_id' => $reading->id
                    ]);

                    // Add a small delay between readings (500ms)
                    usleep(500000);
                } catch (\Exception $e) {
                    Log::error('Failed to store reading', [
                        'index' => $index,
                        'error' => $e->getMessage()
                    ]);
                    throw new \Exception('Failed to store reading: ' . $e->getMessage());
                }
            }

            Log::info('All readings stored, triggering AI analysis', [
                'reading_ids' => $readingIds
            ]);

            // After all readings are stored, trigger AI analysis with specific reading IDs
            $aiController = new AIAnalysisController();
            $analysisRequest = new Request([
                'sensor_id' => $request->sensor_id,
                'reading_ids' => $readingIds
            ]);

            $analysisResponse = $aiController->analyzeSensorReadings($analysisRequest);
            $analysis = json_decode($analysisResponse->getContent(), true);

            if (!isset($analysis['data'])) {
                throw new \Exception('Invalid analysis response format');
            }

            Log::info('Demo scenario completed successfully', [
                'analysis_result' => $analysis['data']
            ]);

            return response()->json([
                'message' => 'Demo scenario completed successfully',
                'scenario' => $scenario->scenario_name,
                'readings_count' => count($scenario->data_sequence),
                'risk_level' => $analysis['data']['risk_level'],
                'explanation' => $analysis['data']['explanation'],
                'recommended_action' => $analysis['data']['recommended_action'] ?? null,
                'alert_id' => $analysis['data']['alert_id']
            ]);

        } catch (\Exception $e) {
            Log::error('Error in demo scenario:', [
                'scenario' => $request->scenario_name,
                'sensor_id' => $request->sensor_id,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to process demo scenario',
                'error' => $e->getMessage(),
                'details' => app()->environment('local') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * List available demo scenarios.
     */
    public function listScenarios(): JsonResponse
    {
        try {
            $scenarios = DemoScenario::select('scenario_name', 'description')->get();
            return response()->json($scenarios);
        } catch (\Exception $e) {
            Log::error('Error listing scenarios:', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to list scenarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}