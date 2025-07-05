import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import Toast from '@/Components/Toast';

export default function DemoControlPanel({ auth }) {
    const [scenarios, setScenarios] = useState([]);
    const [selectedSensor, setSelectedSensor] = useState('');
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get CSRF cookie first
                await axios.get('/sanctum/csrf-cookie');
                
                // Then make the API requests
                const [scenariosResponse, sensorsResponse] = await Promise.all([
                    axios.get('/api/demo/scenarios'),
                    axios.get('/api/sensors')
                ]);

                setScenarios(scenariosResponse.data);
                setSensors(sensorsResponse.data);
                if (sensorsResponse.data.length > 0) {
                    setSelectedSensor(sensorsResponse.data[0].id);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                let errorMessage = 'Failed to load data';
                if (error.response) {
                    if (error.response.status === 401) {
                        errorMessage = 'Session expired. Please log in again.';
                        router.visit('/login');
                    } else if (error.response.status === 404) {
                        errorMessage = 'Required data not found';
                    } else if (error.response.status === 419) {
                        errorMessage = 'Session expired. Refreshing page...';
                        window.location.reload();
                    }
                }
                showToast(errorMessage, 'error');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const triggerScenario = async (scenarioName) => {
        if (!selectedSensor) {
            showToast('Please select a sensor first', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/demo/trigger-scenario', {
                scenario_name: scenarioName,
                sensor_id: selectedSensor
            });
            
            const result = response.data;
            const riskLevel = result.risk_level;
            const message = `Scenario triggered: ${riskLevel} - ${result.explanation}`;
            showToast(message, riskLevel === 'Critical' ? 'error' : 'success');
        } catch (error) {
            console.error('Error triggering scenario:', error);
            let errorMessage = 'Failed to trigger scenario';
            if (error.response?.status === 401) {
                errorMessage = 'Session expired. Please log in again.';
                router.visit('/login');
            } else if (error.response?.status === 419) {
                errorMessage = 'Session expired. Refreshing page...';
                window.location.reload();
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Demo Control Panel</h2>}
            >
                <Head title="Demo Control Panel" />
                <div className="py-0">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-0">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                <span className="ml-2">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Demo Control Panel</h2>}
        >
            <Head title="Demo Control Panel" />

            <div className="py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-0">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {sensors.length === 0 ? (
                            <div className="text-center text-gray-600">
                                <p>No sensors available. Please add sensors to use the demo features.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Sensor
                                    </label>
                                    <select
                                        value={selectedSensor}
                                        onChange={(e) => setSelectedSensor(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        {sensors.map((sensor) => (
                                            <option key={sensor.id} value={sensor.id}>
                                                {sensor.name} - {sensor.location} ({sensor.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {scenarios.map((scenario) => (
                                        <div
                                            key={scenario.scenario_name}
                                            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                                        >
                                            <h3 className="text-lg font-semibold mb-2">
                                                {scenario.scenario_name.split('_').map(word => 
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </h3>
                                            <p className="text-gray-600 mb-4">{scenario.description}</p>
                                            <button
                                                onClick={() => triggerScenario(scenario.scenario_name)}
                                                disabled={loading}
                                                className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${
                                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                {loading ? 'Running...' : 'Run Scenario'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}
        </AuthenticatedLayout>
    );
} 