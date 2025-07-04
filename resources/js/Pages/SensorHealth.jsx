import { useState, useCallback, memo, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import debounce from 'lodash/debounce';

// Memoized Modal component to prevent unnecessary re-renders
const Modal = memo(({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
                
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
});

// Memoized Pagination component using Inertia Link
const Pagination = memo(({ links, from, to, total }) => {
    if (!links || links.length <= 3) return null;

    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                {links[0].url && (
                    <Link
                        href={links[0].url}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        preserveScroll
                    >
                        Previous
                    </Link>
                )}
                {links[links.length - 1].url && (
                    <Link
                        href={links[links.length - 1].url}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        preserveScroll
                    >
                        Next
                    </Link>
                )}
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{from}</span> to{' '}
                        <span className="font-medium">{to}</span> of{' '}
                        <span className="font-medium">{total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {links.map((link, i) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={i}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        link.active
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                    preserveScroll
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
});

export default function SensorHealth({ sensors = {}, stats = {}, filters = {}, sensorTypes = [], statusOptions = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingSensor, setEditingSensor] = useState(null);
    const [deletingSensor, setDeletingSensor] = useState(null);
    
    // Search and filter state with refs for change detection
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    
    // Refs to track actual changes in filter values
    const prevFilters = useRef({ search: searchTerm, status: statusFilter, type: typeFilter });
    
    // Debounced filter update function
    const debouncedFilterUpdate = useCallback(
        debounce((search, status, type) => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (status) params.set('status', status);
            if (type) params.set('type', type);
            
            router.get(
                route('sensor-health.index') + (params.toString() ? `?${params.toString()}` : ''),
                {},
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300),
        []
    );

    // Effect to handle filter changes
    useEffect(() => {
        const filtersChanged = 
            prevFilters.current.search !== searchTerm ||
            prevFilters.current.status !== statusFilter ||
            prevFilters.current.type !== typeFilter;

        if (filtersChanged) {
            prevFilters.current = { search: searchTerm, status: statusFilter, type: typeFilter };
            debouncedFilterUpdate(searchTerm, statusFilter, typeFilter);
        }
    }, [searchTerm, statusFilter, typeFilter]);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setStatusFilter('');
        setTypeFilter('');
        router.get(route('sensor-health.index'), {}, { 
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, []);

    // Create separate forms with proper reset handling
    const addForm = useForm({
        name: '',
        location: '',
        type: sensorTypes[0] || 'Temperature',
        status: statusOptions[0] || 'online',
        battery_level: 100
    });
    
    const editForm = useForm({
        name: '',
        location: '',
        type: '',
        status: '',
        battery_level: 100
    });
    
    const deleteForm = useForm({});

    const defaultSensorTypes = ['Methane', 'Smoke', 'Temperature', 'Pressure', 'Humidity', 'CO2', 'Oxygen'];
    const defaultStatusOptions = ['online', 'offline', 'maintenance'];
    
    const availableSensorTypes = sensorTypes.length > 0 ? sensorTypes : defaultSensorTypes;
    const availableStatusOptions = statusOptions.length > 0 ? statusOptions : defaultStatusOptions;

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addForm.post(route('sensor-health.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                addForm.reset();
            },
            preserveScroll: true,
            preserveState: true
        });
    };
    
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (editingSensor) {
            editForm.put(route('sensor-health.update', editingSensor), {
                onSuccess: () => {
                    setShowEditModal(false);
                    setEditingSensor(null);
                    editForm.reset();
                },
                preserveScroll: true,
                preserveState: true
            });
        }
    };

    const handleEdit = useCallback((sensor) => {
        setEditingSensor(sensor);
        editForm.setData({
            name: sensor.name,
            location: sensor.location,
            type: sensor.type,
            status: sensor.status,
            battery_level: sensor.battery_level
        });
        setShowEditModal(true);
    }, []);

    const handleDeleteClick = useCallback((sensor) => {
        setDeletingSensor(sensor);
        setShowDeleteModal(true);
    }, []);

    const handleDeleteConfirm = () => {
        if (deletingSensor) {
            deleteForm.delete(route('sensor-health.destroy', deletingSensor), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeletingSensor(null);
                },
                preserveScroll: true,
                preserveState: true
            });
        }
    };

    const getStatusBadge = useCallback((status) => {
        const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
        switch (status) {
            case 'online':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'offline':
                return `${baseClasses} bg-red-100 text-red-800`;
            case 'maintenance':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    }, []);

    const getBatteryIcon = useCallback((batteryLevel) => {
        if (batteryLevel >= 75) {
            return <span className="text-green-500">🔋</span>;
        } else if (batteryLevel >= 25) {
            return <span className="text-yellow-500">🔋</span>;
        } else {
            return <span className="text-red-500">🪫</span>;
        }
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Sensor Health & Management
                </h2>
            }
        >
            <Head title="Sensor Health" />

            <div className="py-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-0">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Sensors</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Online</p>
                                        <p className="text-2xl font-semibold text-green-600">{stats.online || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Offline</p>
                                        <p className="text-2xl font-semibold text-red-600">{stats.offline || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Maintenance</p>
                                        <p className="text-2xl font-semibold text-yellow-600">{stats.maintenance || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                                            <span className="text-white">🪫</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Low Battery</p>
                                        <p className="text-2xl font-semibold text-orange-600">{stats.low_battery || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search Input */}
                                <div>
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Sensors
                                    </label>
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="Search by name or location..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Status
                                    </label>
                                    <select
                                        id="status-filter"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="">All Statuses</option>
                                        {availableStatusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type Filter */}
                                <div>
                                    <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter by Type
                                    </label>
                                    <select
                                        id="type-filter"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="">All Types</option>
                                        {availableSensorTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Clear Filters and Add Button */}
                                <div className="flex items-end space-x-2">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium"
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Add Sensor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sensor Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sensors.data && sensors.data.map((sensor) => (
                                        <tr key={sensor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{sensor.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{sensor.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{sensor.type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={getStatusBadge(sensor.status)}>
                                                    {sensor.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getBatteryIcon(sensor.battery_level)}
                                                    <span className="ml-1 text-sm text-gray-500">{sensor.battery_level}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(sensor)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(sensor)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {(!sensors.data || sensors.data.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No sensors found. {searchTerm || statusFilter || typeFilter ? 'Try adjusting your search or filters.' : 'Add your first sensor to get started.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {sensors.data && sensors.data.length > 0 && (
                            <Pagination
                                links={sensors.links}
                                from={sensors.from}
                                to={sensors.to}
                                total={sensors.total}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Add Sensor Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    addForm.reset();
                }}
                title="Add New Sensor"
            >
                <form onSubmit={handleAddSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={addForm.data.name}
                            onChange={(e) => addForm.setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                        />
                        {addForm.errors.name && <p className="mt-1 text-sm text-red-600">{addForm.errors.name}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={addForm.data.location}
                            onChange={(e) => addForm.setData('location', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                        />
                        {addForm.errors.location && <p className="mt-1 text-sm text-red-600">{addForm.errors.location}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Sensor Type</label>
                        <select
                            id="type"
                            value={addForm.data.type}
                            onChange={(e) => addForm.setData('type', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            {availableSensorTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {addForm.errors.type && <p className="mt-1 text-sm text-red-600">{addForm.errors.type}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            id="status"
                            value={addForm.data.status}
                            onChange={(e) => addForm.setData('status', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            {availableStatusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        {addForm.errors.status && <p className="mt-1 text-sm text-red-600">{addForm.errors.status}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="battery_level" className="block text-sm font-medium text-gray-700">Battery Level (%)</label>
                        <input
                            type="number"
                            id="battery_level"
                            min="0"
                            max="100"
                            value={addForm.data.battery_level}
                            onChange={(e) => addForm.setData('battery_level', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {addForm.errors.battery_level && <p className="mt-1 text-sm text-red-600">{addForm.errors.battery_level}</p>}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddModal(false);
                                addForm.reset();
                            }}
                            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addForm.processing}
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {addForm.processing ? 'Saving...' : 'Save Sensor'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Sensor Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingSensor(null);
                    editForm.reset();
                }}
                title="Edit Sensor"
            >
                <form onSubmit={handleEditSubmit}>
                    <div className="mb-4">
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="edit-name"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                        />
                        {editForm.errors.name && <p className="mt-1 text-sm text-red-600">{editForm.errors.name}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            id="edit-location"
                            value={editForm.data.location}
                            onChange={(e) => editForm.setData('location', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                        />
                        {editForm.errors.location && <p className="mt-1 text-sm text-red-600">{editForm.errors.location}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700">Sensor Type</label>
                        <select
                            id="edit-type"
                            value={editForm.data.type}
                            onChange={(e) => editForm.setData('type', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            {availableSensorTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {editForm.errors.type && <p className="mt-1 text-sm text-red-600">{editForm.errors.type}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            id="edit-status"
                            value={editForm.data.status}
                            onChange={(e) => editForm.setData('status', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            {availableStatusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        {editForm.errors.status && <p className="mt-1 text-sm text-red-600">{editForm.errors.status}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-battery_level" className="block text-sm font-medium text-gray-700">Battery Level (%)</label>
                        <input
                            type="number"
                            id="edit-battery_level"
                            min="0"
                            max="100"
                            value={editForm.data.battery_level}
                            onChange={(e) => editForm.setData('battery_level', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {editForm.errors.battery_level && <p className="mt-1 text-sm text-red-600">{editForm.errors.battery_level}</p>}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingSensor(null);
                                editForm.reset();
                            }}
                            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {editForm.processing ? 'Updating...' : 'Update Sensor'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletingSensor(null);
                }}
                title="Confirm Deletion"
            >
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete the sensor <strong>"{deletingSensor?.name}"</strong>? 
                            This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={deleteForm.processing}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {deleteForm.processing ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                        onClick={() => {
                            setShowDeleteModal(false);
                            setDeletingSensor(null);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}