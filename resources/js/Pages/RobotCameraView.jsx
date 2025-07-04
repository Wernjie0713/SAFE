import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import Toast from '@/Components/Toast';

export default function RobotCameraView({ auth, flash }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    const { data, setData, post, processing, reset, errors } = useForm({
        image: null,
    });

    const simulateInspection = () => {
        // Use a sample image for simulation
        const sampleImagePath = '/storage/sample-hazard.jpg';
        
        fetch(sampleImagePath)
            .then(response => response.blob())
            .then(blob => {
                const file = new File([blob], 'robot-inspection.jpg', { type: 'image/jpeg' });
                setData('image', file);
                
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
                console.error('Error loading sample image:', error);
                setToastType('error');
                setToastMessage('Failed to load sample image');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            });
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
                                <div className="bg-gray-100 rounded-lg p-4 h-[500px] flex flex-col items-center justify-center">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Robot Camera Feed</h3>
                                        <p className="text-sm text-gray-600">
                                            Click the button below to simulate a robot inspection using a sample image
                                        </p>
                                    </div>
                                    
                                    {data.image ? (
                                        <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(data.image)}
                                                alt="Robot camera feed"
                                                className="absolute inset-0 w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500">No camera feed available</span>
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
                                        {/* Alert items will be populated here when created */}
                                        <p className="text-sm text-gray-600">
                                            Recent visual hazard alerts will appear here after inspection
                                        </p>
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