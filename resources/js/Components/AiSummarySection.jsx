import React from 'react';

export default function AiSummarySection({ summary, suggestions, isLoading, error }) {
    // Helper function to extract key data points from summary text
    const extractKeyData = (summaryText) => {
        if (!summaryText) return {
            severity: 'N/A',
            detectedValue: 'N/A',
            threshold: 'N/A',
            location: 'N/A'
        };

        // Default values
        let data = {
            severity: 'N/A',
            detectedValue: 'N/A',
            threshold: 'N/A',
            location: 'N/A'
        };

        // Extract severity (assuming it's mentioned in the text)
        const severityMatch = summaryText.match(/(?:critical|high|medium|low)/i);
        if (severityMatch) {
            data.severity = severityMatch[0].charAt(0).toUpperCase() + severityMatch[0].slice(1);
        }

        // Extract numeric values (assuming they're in the text)
        const valueMatch = summaryText.match(/(\d+(?:\.\d+)?)\s*(?:ppm|°C|%|mg\/m³)/i);
        if (valueMatch) {
            data.detectedValue = valueMatch[0];
        }

        // Extract location (assuming it's mentioned with "in" or "at")
        const locationMatch = summaryText.match(/(?:in|at)\s+(Sector\s+[A-Z]|Area\s+\d+|Zone\s+\d+)/i);
        if (locationMatch) {
            data.location = locationMatch[1];
        }

        return data;
    };

    // Helper function to parse suggestions JSON string
    const parseSuggestions = (suggestionsText) => {
        if (!suggestionsText) return [];
        
        // If suggestionsText is already an array, return it
        if (Array.isArray(suggestionsText)) {
            return suggestionsText;
        }

        // Convert to string if it's not already
        const textToProcess = String(suggestionsText);
        
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(textToProcess);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            // If it's not an array, return as single item array
            return [textToProcess];
        } catch (e) {
            // If JSON parsing fails, fall back to text splitting
            return textToProcess
                .split(/(?:\d+\.|•|\n-|\n\*)/g)
                .map(s => s.trim())
                .filter(s => s.length > 0);
        }
    };

    const keyData = extractKeyData(summary);
    const suggestionsList = suggestions ? parseSuggestions(suggestions) : [];

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

    if (!summary && !suggestions) {
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
            {/* Incident Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b border-gray-100">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="ml-2 text-sm font-semibold text-gray-900">Incident Summary</h3>
                    </div>
                </div>
                <div className="p-4">
                    {/* Key Data Points Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs font-medium text-gray-500 uppercase">Severity</div>
                            <div className="mt-1 font-medium text-gray-900">{keyData.severity}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs font-medium text-gray-500 uppercase">Location</div>
                            <div className="mt-1 font-medium text-gray-900">{keyData.location}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs font-medium text-gray-500 uppercase">Detected Value</div>
                            <div className="mt-1 font-medium text-gray-900">{keyData.detectedValue}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs font-medium text-gray-500 uppercase">Threshold</div>
                            <div className="mt-1 font-medium text-gray-900">{keyData.threshold}</div>
                        </div>
                    </div>
                    {/* Full Summary Text */}
                    <div className="text-sm text-gray-600 leading-relaxed">{summary}</div>
                </div>
            </div>

            {/* Suggested Actions Card */}
            {suggestionsList.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-transparent border-b border-gray-100">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <h3 className="ml-2 text-sm font-semibold text-gray-900">Suggested Actions</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <ol className="space-y-4">
                            {suggestionsList.map((suggestion, index) => (
                                <li key={index} className="flex items-start group">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-150">
                                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150" 
                                                 fill="none" 
                                                 stroke="currentColor" 
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" 
                                                      strokeLinejoin="round" 
                                                      strokeWidth={2} 
                                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="ml-2 text-sm text-gray-700">{suggestion}</span>
                                        </div>
                                        <div className="mt-1 h-px bg-gray-100 group-hover:bg-blue-100 transition-colors duration-150"></div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
} 