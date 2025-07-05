import SidebarNavLink from '@/Components/SidebarNavLink';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import Toast from '@/Components/Toast';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');
    const [toastKey, setToastKey] = useState(0);

    // Handle flash messages with key update
    useEffect(() => {
        const showToast = (message, type) => {
            setToastMessage(message);
            setToastType(type);
            setToastKey(prev => prev + 1);
        };

        if (flash?.success) {
            showToast(flash.success, 'success');
        } else if (flash?.error) {
            showToast(flash.error, 'error');
        } else if (flash?.warning) {
            showToast(flash.warning, 'warning');
        } else if (flash?.info) {
            showToast(flash.info, 'info');
        }
    }, [flash]);

    // Clear toast after display with useCallback
    const handleToastClose = useCallback(() => {
        setToastMessage(null);
    }, []);

    // Navigation items with icons
    const navigationItems = [
        {
            name: 'Dashboard',
            href: 'dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
            )
        },
        {
            name: 'Robot Camera View',
            href: 'robot.camera',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Sensor Health',
            href: 'sensor-health.index',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        // {
        //     name: 'Alert Details',
        //     href: '/alert-details',
        //     icon: (
        //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        //         </svg>
        //     ),
        //     current: route().current('alert-details')
        // },
        {
            name: 'Historical Reports',
            href: 'reports.history',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'AI Assistant',
            href: 'ai-assistant',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        // {
        //     name: 'Settings',
        //     href: '/settings',
        //     icon: (
        //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        //         </svg>
        //     ),
        //     current: route().current('settings')
        // }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Toast Notification with improved positioning */}
            {toastMessage && (
                <Toast 
                    key={toastKey}
                    message={toastMessage} 
                    type={toastType} 
                    onClose={handleToastClose}
                    duration={5000}
                />
            )}

            {/* Mobile sidebar overlay */}
            <div className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="fixed inset-0 z-40 flex">
                    <div className={`relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pt-5 pb-4 transition duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Mobile Sidebar Content */}
                        <div className="flex flex-shrink-0 items-center px-4">
                            <div className="flex items-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="ml-3 text-xl font-bold text-white">SAFE</span>
                            </div>
                        </div>
                        
                        <div className="mt-5 h-0 flex-1 overflow-y-auto">
                            <nav className="space-y-1 px-2">
                                {navigationItems.map((item) => (
                                    <SidebarNavLink
                                        key={item.name}
                                        href={item.href}
                                        icon={item.icon}
                                    >
                                        {item.name}
                                    </SidebarNavLink>
                                ))}
                            </nav>
                        </div>

                        {/* Mobile Logout */}
                        <div className="px-2 pb-4">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="group flex w-full items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-all duration-200"
                            >
                                <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                                </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
                    {/* Logo */}
                    <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gray-900">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                                    <img 
                                        src="/storage/logo.png" 
                                        alt="SAFE Logo" 
                                        className="h-8 w-8"
                                    />
                                </div>
                                <span className="ml-3 text-xl font-bold text-white">SAFE</span>
                            </Link>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-1 flex-col overflow-y-auto">
                        <nav className="flex-1 space-y-1 px-2 py-4">
                            {navigationItems.map((item) => (
                                <SidebarNavLink
                                    key={item.name}
                                    href={item.href}
                                    icon={item.icon}
                                >
                                    {item.name}
                                </SidebarNavLink>
                            ))}
                        </nav>

                        {/* Logout Button */}
                        <div className="px-2 pb-4">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="group flex w-full items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-all duration-200"
                            >
                                <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col lg:pl-64">
                {/* Top Bar */}
                <div className="flex h-16 flex-shrink-0 bg-gray-800 shadow-sm">
                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="border-r border-gray-700 px-4 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    {/* Top bar content */}
                    <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center">
                            {/* System Status */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="ml-2 text-sm font-medium text-gray-300">System Online</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* User menu */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-gray-300 transition duration-150 ease-in-out hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                            >
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                                                        <span className="text-sm font-medium text-white">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span>{user.name}</span>
                                                </div>

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page header */}
            {header && (
                    <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

                {/* Main content */}
                <main className="flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
