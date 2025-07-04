import { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard({ auth, quickStats, sensorDistribution, incidentTrends }) {
    const [alerts, setAlerts] = useState([]);
    const [alertStats, setAlertStats] = useState({
        total_new: 0,
        by_severity: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        }
    });

    const fetchAlerts = useCallback(async () => {
        try {
            const [alertsResponse, statsResponse] = await Promise.all([
                axios.get('/api/alerts'),
                axios.get('/api/alerts/stats')
            ]);
            
            setAlerts(alertsResponse.data);
            setAlertStats(statsResponse.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    }, []);

    // Set up polling interval
    useEffect(() => {
        fetchAlerts(); // Initial fetch
        const interval = setInterval(fetchAlerts, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    const handleAlertAction = async (alertId, action) => {
        try {
            await axios.patch(`/api/alerts/${alertId}`, {
                status: action
            });
            fetchAlerts();
        } catch (error) {
            console.error('Error updating alert:', error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Chart configurations
    const doughnutChartData = {
        labels: sensorDistribution.labels,
        datasets: [
            {
                data: sensorDistribution.data,
                backgroundColor: sensorDistribution.labels.map(
                    status => sensorDistribution.colors[status]
                ),
                borderWidth: 0,
            },
        ],
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
        cutout: '70%',
    };

    const lineChartData = {
        labels: incidentTrends.labels,
        datasets: [
            {
                label: 'Safety Incidents',
                data: incidentTrends.data,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-0">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-900 text-lg font-semibold mb-2">Sensors Offline</div>
                            <div className="text-3xl font-bold text-red-600">{quickStats.sensorsOffline}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-900 text-lg font-semibold mb-2">Active Leaks</div>
                            <div className="text-3xl font-bold text-orange-600">{quickStats.activeLeaks}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-900 text-lg font-semibold mb-2">Critical Alerts</div>
                            <div className="text-3xl font-bold text-red-600">{quickStats.criticalAlerts}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-900 text-lg font-semibold mb-2">24h Incidents</div>
                            <div className="text-3xl font-bold text-blue-600">{quickStats.incidentsLast24h}</div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Sensor Status Distribution */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Status Distribution</h3>
                            <div className="h-[300px]">
                                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                            </div>
                        </div>

                        {/* Safety Incident Trends */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Incident Trends</h3>
                            <div className="h-[300px]">
                                <Line data={lineChartData} options={lineChartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Live Alert Feed */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Alert Feed</h3>
                            <div className="space-y-4">
                                {alerts.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No new alerts</p>
                                ) : (
                                    alerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                                        {alert.severity.toUpperCase()}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {alert.sensor.name} ({alert.sensor.type})
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {alert.created_at}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-600">{alert.description}</p>
                                            <div className="mt-3 flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleAlertAction(alert.id, 'acknowledged')}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Acknowledge
                                                </button>
                                                <button
                                                    onClick={() => handleAlertAction(alert.id, 'resolved')}
                                                    className="text-sm text-green-600 hover:text-green-800"
                                                >
                                                    Mark as Resolved
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

