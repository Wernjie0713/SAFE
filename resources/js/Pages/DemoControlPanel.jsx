import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function DemoControlPanel({ auth }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState(1); // Default to first sensor

    const triggerScenario = async (scenario) => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/demo/trigger-scenario', {
                scenario,
                sensor_id: selectedSensor
            });
            
            toast.success(response.data.description);
        } catch (error) {
            toast.error('Failed to trigger scenario: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Demo Control Panel</h2>}
        >
            <Head title="Demo Control Panel" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Sensor Selection</h3>
                                <select
                                    value={selectedSensor}
                                    onChange={(e) => setSelectedSensor(Number(e.target.value))}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    disabled={isLoading}
                                >
                                    <option value={1}>Sensor A (Gas Detection)</option>
                                    <option value={2}>Sensor B (Pressure)</option>
                                    <option value={3}>Sensor C (Temperature)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => triggerScenario('critical_leak')}
                                    disabled={isLoading}
                                    className="bg-red-600 text-white px-4 py-3 rounded-lg shadow hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    Simulate Critical Leak
                                </button>

                                <button
                                    onClick={() => triggerScenario('minor_leak')}
                                    disabled={isLoading}
                                    className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow hover:bg-yellow-600 transition-colors disabled:opacity-50"
                                >
                                    Simulate Minor Leak
                                </button>

                                <button
                                    onClick={() => triggerScenario('sensor_offline')}
                                    disabled={isLoading}
                                    className="bg-gray-600 text-white px-4 py-3 rounded-lg shadow hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                    Simulate Sensor Offline
                                </button>
                            </div>

                            {isLoading && (
                                <div className="mt-4 text-center text-gray-600">
                                    Simulation in progress...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 