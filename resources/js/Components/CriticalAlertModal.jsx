import { useState, useEffect, useCallback } from 'react';
import Modal from '@/Components/Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CriticalAlertModal({ show, onClose, alert }) {
    const [countdown, setCountdown] = useState(10);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [isAcknowledging, setIsAcknowledging] = useState(false);

    // Handle countdown timer
    useEffect(() => {
        let timer;
        if (show && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setIsButtonEnabled(true);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [show]);

    // Reset state when modal is opened
    useEffect(() => {
        if (show) {
            setCountdown(10);
            setIsButtonEnabled(false);
            setIsAcknowledging(false);
        }
    }, [show]);

    // Handle alert acknowledgment
    const handleAcknowledge = useCallback(async () => {
        if (!isButtonEnabled || isAcknowledging) return;
        
        setIsAcknowledging(true);
        try {
            onClose();
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
            setIsAcknowledging(false);
        }
    }, [isButtonEnabled, isAcknowledging, onClose]);

    // Format timestamp if available
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        try {
            return new Date(timestamp).toLocaleString();
        } catch (e) {
            return timestamp;
        }
    };

    return (
        <Modal show={show} onClose={() => {}} maxWidth="md" closeable={false}>
            <div className="p-6">
                {/* Alert Icon */}
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-red-100 rounded-full p-3 animate-pulse">
                        <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
                    </div>
                </div>

                {/* Alert Content */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-red-600">
                            CRITICAL ALERT
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {alert?.type || 'System Alert'}
                        </span>
                    </div>

                    {/* Location and Timestamp */}
                    <div className="mb-4">
                        <p className="text-lg font-semibold text-gray-900">
                            {alert?.sensor?.location || 'Unknown Location'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {formatTimestamp(alert?.created_at)}
                        </p>
                    </div>

                    {/* Alert Description */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-gray-700">
                            {alert?.description || 'No description available'}
                        </p>
                    </div>

                    {/* Sensor Details */}
                    {alert?.sensor && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Sensor Type</p>
                                    <p className="font-medium">{alert.sensor.type}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Sensor Status</p>
                                    <p className="font-medium">{alert.sensor.status}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Suggestion */}
                    {alert?.ai_suggestion && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                                Recommended Action:
                            </p>
                            <p className="text-sm text-gray-600">{alert.ai_suggestion}</p>
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div className="flex flex-col items-center">
                    {!isButtonEnabled && (
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <p className="text-sm text-gray-500">
                                Please review this alert carefully. You can acknowledge it in {countdown} seconds.
                            </p>
                        </div>
                    )}
                    <PrimaryButton
                        onClick={handleAcknowledge}
                        disabled={!isButtonEnabled || isAcknowledging}
                        className={`w-full justify-center ${
                            !isButtonEnabled || isAcknowledging ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isAcknowledging ? (
                            'Acknowledging...'
                        ) : isButtonEnabled ? (
                            'Acknowledge Alert'
                        ) : (
                            `Wait ${countdown}s`
                        )}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
} 