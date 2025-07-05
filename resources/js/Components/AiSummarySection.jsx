import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function AiSummarySection({ summary, suggestions, isLoading, error }) {
    // Parse the JSON summary
    const parseSummary = (summaryText) => {
        if (!summaryText) return null;
        try {
            return typeof summaryText === 'string' ? JSON.parse(summaryText) : summaryText;
        } catch (e) {
            console.error('Failed to parse AI summary:', e);
            return null;
        }
    };

    const parsedData = parseSummary(summary);

    // Helper function to get risk level color
    const getRiskLevelColor = (level) => {
        const colors = {
            'Critical': 'bg-red-100 text-red-800 border-red-200',
            'High': 'bg-orange-100 text-orange-800 border-orange-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Low': 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Prepare chart data
    const chartData = parsedData?.readings?.map((value, index) => ({
        index: index + 1,
        value
    })) || [];

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error Loading AI Analysis</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!parsedData) {
        return (
            <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-800">No AI Analysis Available</h3>
                        <div className="mt-2 text-sm text-gray-600">AI analysis has not been generated for this alert yet.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Risk Level Badge */}
            <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(parsedData.analysis.risk_level)}`}>
                    {parsedData.analysis.risk_level}
                </span>
                <span className="text-sm text-gray-500">Risk Level</span>
            </div>

            {/* Sensor Readings Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b border-gray-100">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <h3 className="ml-2 text-sm font-semibold text-gray-900">Sensor Reading Trend</h3>
                    </div>
                </div>
                <div className="p-4">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Explanation Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b border-gray-100">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="ml-2 text-sm font-semibold text-gray-900">Incident Analysis</h3>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{parsedData.analysis.explanation}</p>
                </div>
            </div>

            {/* Recommended Actions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b border-gray-100">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="ml-2 text-sm font-semibold text-gray-900">Recommended Actions</h3>
                    </div>
                </div>
                <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                        <div className="text-sm text-gray-600 leading-relaxed">
                            {parsedData.analysis.recommended_action}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 