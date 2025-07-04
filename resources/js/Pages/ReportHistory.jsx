import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import debounce from 'lodash/debounce';

export default function ReportHistory({ auth, alerts, filters, filterOptions, summary }) {
    const [isLoading, setIsLoading] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    // Debounced filter update function
    const updateFilters = debounce((newFilters) => {
        setIsLoading(true);
        router.get(
            route('reports.history'),
            newFilters,
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            }
        );
    }, 300);

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        updateFilters(newFilters);
    };

    // Reset filters
    const resetFilters = () => {
        const defaultFilters = {
            start_date: '',
            end_date: '',
            type: '',
            severity: '',
            status: '',
            location: '',
            per_page: 25,
        };
        setLocalFilters(defaultFilters);
        updateFilters(defaultFilters);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800';
            case 'acknowledged':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Historical Reports</h2>}
        >
            <Head title="Historical Reports" />

            <div className="py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-0">
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-900 text-lg font-semibold mb-2">Total Alerts</div>
                            <div className="text-3xl font-bold text-blue-600">{summary.total_alerts}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-900 text-lg font-semibold mb-2">By Severity</div>
                            <div className="space-y-2">
                                {Object.entries(summary.by_severity).map(([severity, count]) => (
                                    <div key={severity} className="flex justify-between items-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}>
                                            {severity.toUpperCase()}
                                        </span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-gray-900 text-lg font-semibold mb-2">By Status</div>
                            <div className="space-y-2">
                                {Object.entries(summary.by_status).map(([status, count]) => (
                                    <div key={status} className="flex justify-between items-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                                            {status.toUpperCase()}
                                        </span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div>
                                <InputLabel htmlFor="start_date" value="Start Date" />
                                <TextInput
                                    id="start_date"
                                    type="date"
                                    value={localFilters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="end_date" value="End Date" />
                                <TextInput
                                    id="end_date"
                                    type="date"
                                    value={localFilters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="type" value="Alert Type" />
                                <select
                                    id="type"
                                    value={localFilters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Types</option>
                                    {filterOptions.types.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="severity" value="Severity" />
                                <select
                                    id="severity"
                                    value={localFilters.severity}
                                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Severities</option>
                                    {filterOptions.severities.map((severity) => (
                                        <option key={severity} value={severity}>{severity.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    value={localFilters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Statuses</option>
                                    {filterOptions.statuses.map((status) => (
                                        <option key={status} value={status}>{status.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <InputLabel htmlFor="location" value="Location" />
                                <select
                                    id="location"
                                    value={localFilters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Locations</option>
                                    {filterOptions.locations.map((location) => (
                                        <option key={location} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Show</span>
                                <select
                                    value={localFilters.per_page}
                                    onChange={(e) => handleFilterChange('per_page', e.target.value)}
                                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-gray-600">entries</span>
                            </div>
                            <SecondaryButton onClick={resetFilters}>
                                Reset Filters
                            </SecondaryButton>
                        </div>
                    </div>

                    {/* Alerts Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date/Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Severity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sensor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {alerts.data.map((alert) => (
                                        <tr
                                            key={alert.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.visit(route('alerts.show', alert.id))}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>{alert.created_at}</div>
                                                <div className="text-xs text-gray-500">{alert.created_at_diff}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {alert.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                                    {alert.severity.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                                                    {alert.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {alert.sensor.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {alert.sensor.location}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {alert.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {alerts.links.length > 3 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {alerts.from} to {alerts.to} of {alerts.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {alerts.links.map((link, index) => {
                                            if (link.url === null) return null;
                                            return (
                                                <button
                                                    key={index}
                                                    className={`px-3 py-1 rounded text-sm font-medium ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => router.visit(link.url, {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                    })}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 