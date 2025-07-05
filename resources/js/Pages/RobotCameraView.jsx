import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import Toast from '@/Components/Toast';

export default function RobotCameraView({ auth, flash, alerts }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [selectedRobot, setSelectedRobot] = useState('robot1');
    const [videoKey, setVideoKey] = useState(0); // Key to force video reload

    const { data, setData, post, processing, reset, errors } = useForm({
        image: null,
        mediaType: 'image', // Track whether we're using image or video
    });

    const simulateInspection = () => {
        // Use different media based on selected robot
        const mediaPath = selectedRobot === 'robot1' 
            ? '/storage/rusting-pipe.mp4'
            : '/storage/sample-hazard.jpg';
        
        fetch(mediaPath)
            .then(response => response.blob())
            .then(blob => {
                const fileType = selectedRobot === 'robot1' ? 'video/mp4' : 'image/jpeg';
                const fileName = selectedRobot === 'robot1' ? 'robot-inspection.mp4' : 'robot-inspection.jpg';
                const file = new File([blob], fileName, { type: fileType });
                setData(prev => ({
                    ...prev,
                    image: file,
                    mediaType: selectedRobot === 'robot1' ? 'video' : 'image'
                }));
                
                post('/api/robot/inspect', {
                    onSuccess: () => {
                        setToastType('success');
                        setToastMessage('Inspection completed successfully');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                    },
                    onError: () => {
                        setToastType('error');
                        setToastMessage('Failed to process inspection');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                    },
                });
            })
            .catch(error => {
                console.error('Error loading media:', error);
                setToastType('error');
                setToastMessage('Failed to load media file');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            });
    };

    const handleRobotChange = (event) => {
        setSelectedRobot(event.target.value);
        setData(prev => ({ ...prev, image: null, mediaType: 'image' }));
        setVideoKey(prev => prev + 1); // Force video reload when switching robots
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Robot Camera View</h2>}
        >
            <Head title="Robot Camera View" />

            <div className="py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-0">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Camera Feed Section */}
                            <div className="lg:col-span-2">
                                <div className="bg-white border border-gray-200 rounded-lg p-4 h-[500px] flex flex-col">
                                    <div className="mb-4">
                                        <label htmlFor="robot-camera" className="block text-sm font-semibold text-gray-800 mb-1">
                                            Select Robot/Camera:
                                        </label>
                                        <select
                                            id="robot-camera"
                                            value={selectedRobot}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            onChange={handleRobotChange}
                                        >
                                            <option value="robot1">Robot 1 - Front Camera</option>
                                            <option value="robot2">Robot 2 - Side Camera</option>
                                            <option value="robot3">Robot 3 - Rear Camera</option>
                                        </select>
                                    </div>

                                    {/* Live Feed / Placeholder */}
                                    {data.image ? (
                                        <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
                                            {data.mediaType === 'video' ? (
                                                <video
                                                    key={videoKey}
                                                    src={URL.createObjectURL(data.image)}
                                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={URL.createObjectURL(data.image)}
                                                    alt="Robot camera feed"
                                                    className="absolute inset-0 w-full h-full object-contain"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-[300px] bg-black rounded-md flex items-center justify-center border border-dashed border-gray-500">
                                            <span className="text-gray-400 text-sm">📷 Live Video Feed Placeholder</span>
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <PrimaryButton
                                            onClick={simulateInspection}
                                            disabled={processing}
                                        >
                                            {processing ? 'Processing...' : 'Simulate Robot Inspection'}
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>

                            {/* Alert Panel */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Inspection Alerts</h3>
                                    <div className="space-y-4">
                                        {/* Render alerts here */}
                                        {alerts && alerts.length > 0 ? (
                                            alerts.map((alert, index) => {
                                                // Determine background color based on severity
                                                const severityClasses = {
                                                    critical: 'bg-red-100 border-red-300 text-red-900',
                                                    high: 'bg-orange-100 border-orange-300 text-orange-900',
                                                    medium: 'bg-yellow-100 border-yellow-300 text-yellow-900',
                                                    low: 'bg-blue-100 border-blue-300 text-blue-900'
                                                };
                                                
                                                const severityClass = severityClasses[alert.severity.toLowerCase()] || 'bg-gray-100 border-gray-300';
                                                
                                                return (
                                                    <div key={index} className={`p-3 border rounded-md ${severityClass}`}>
                                                        <p className="font-semibold">{alert.type}</p>
                                                        <p className="mt-1">{alert.description}</p>
                                                        <p className="text-sm mt-2 font-medium">
                                                            Severity: {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-600">No alerts to display.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
        </AuthenticatedLayout>
    );
} 