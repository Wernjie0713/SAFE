import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Toast from '@/Components/Toast';
import AiSummarySection from '@/Components/AiSummarySection';
import axios from 'axios';

// Create an axios instance with the CSRF token
const api = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true // This is important for sending cookies
});

export default function AlertDetail({ auth, alert }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const { flash } = usePage().props;
    const [aiData, setAiData] = useState({
        summary: alert.ai_summary,
        suggestion: alert.ai_suggestion,
        loading: false,
        error: null
    });

    useEffect(() => {
        if (flash?.success) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    useEffect(() => {
        const generateAiSummary = async () => {
            // Only generate if we don't have a summary yet
            if (!alert.ai_summary) {
                setAiData(prev => ({ ...prev, loading: true, error: null }));
                try {
                    const response = await api.post(`/api/alerts/${alert.id}/generate-summary`);
                    setAiData({
                        summary: response.data.ai_summary,
                        suggestion: response.data.ai_suggestion,
                        loading: false,
                        error: null
                    });
                } catch (error) {
                    console.error('Failed to generate AI summary:', error);
                    let errorMessage = 'Failed to generate AI summary. Please try again later.';
                    
                    // Add more specific error messages based on the error type
                    if (error.response) {
                        switch (error.response.status) {
                            case 401:
                                errorMessage = 'Authentication required. Please refresh the page and try again.';
                                break;
                            case 403:
                                errorMessage = 'You do not have permission to perform this action.';
                                break;
                            case 429:
                                errorMessage = 'Too many requests. Please wait a moment and try again.';
                                break;
                            case 500:
                                errorMessage = 'Server error occurred while generating summary.';
                                break;
                        }
                    }
                    
                    setAiData(prev => ({
                        ...prev,
                        loading: false,
                        error: errorMessage
                    }));
                }
            }
        };

        generateAiSummary();
    }, [alert.id, alert.ai_summary]);

    const handleAlertAction = (action) => {
        setIsUpdating(true);
        router.patch(route('alerts.update', alert.id), {
            status: action
        }, {
            onSuccess: () => {
                setIsUpdating(false);
            },
            onError: () => {
                setIsUpdating(false);
            },
            preserveScroll: true,
        });
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

    const getSensorStatusColor = (status) => {
        switch (status) {
            case 'online':
                return 'bg-green-100 text-green-800';
            case 'offline':
                return 'bg-red-100 text-red-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getBatteryLevelColor = (level) => {
        if (level >= 75) return 'bg-green-100 text-green-800';
        if (level >= 25) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Alert Details</h2>
                    <SecondaryButton onClick={() => router.visit(route('reports.history'))}>
                        Back
                    </SecondaryButton>
                </div>
            }
        >
            <Head title="Alert Details" />

            {showToast && flash?.success && (
                <Toast
                    message={flash.success}
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-0">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Alert Header */}
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                                        {alert.severity.toUpperCase()}
                                    </span>
                                    <span className="text-lg font-medium text-gray-900">
                                        {alert.type}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {alert.created_at_diff}
                                </div>
                            </div>
                        </div>

                        {/* Alert Content */}
                        <div className="p-6">
                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600">{alert.description}</p>
                            </div>

                            {/* Timestamps */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Created:</span>
                                        <span className="text-gray-900">{alert.created_at}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Last Updated:</span>
                                        <span className="text-gray-900">{alert.updated_at}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Status:</span>
                                        <span className="font-medium capitalize">{alert.status}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sensor Information */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Sensor Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Name</p>
                                            <p className="font-medium">{alert.sensor.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Type</p>
                                            <p className="font-medium">{alert.sensor.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Location</p>
                                            <p className="font-medium">{alert.sensor.location}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Status</p>
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getSensorStatusColor(alert.sensor.status)}`}>
                                                {alert.sensor.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Battery Level</p>
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getBatteryLevelColor(alert.sensor.battery_level)}`}>
                                                {alert.sensor.battery_level}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary & Suggestions */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Summary & Suggestions</h3>
                                <AiSummarySection
                                    summary={aiData.summary}
                                    suggestions={aiData.suggestion}
                                    isLoading={aiData.loading}
                                    error={aiData.error}
                                />
                            </div>

                            {/* Action Buttons */}
                            {alert.status === 'new' && (
                                <div className="flex space-x-4">
                                    <PrimaryButton
                                        onClick={() => handleAlertAction('acknowledged')}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Processing...' : 'Acknowledge Alert'}
                                    </PrimaryButton>
                                    <SecondaryButton
                                        onClick={() => handleAlertAction('resolved')}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Processing...' : 'Mark as Resolved'}
                                    </SecondaryButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 