import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [focusedField, setFocusedField] = useState('');

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="SAFE - Safety Monitor Login" />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo and Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">SAFE</h1>
                    <p className="text-lg text-gray-300 font-medium">Safety Monitoring System</p>
                    <p className="text-sm text-gray-400 mt-1">Secure Access Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            {status && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                            <p className="text-sm font-medium text-green-300">{status}</p>
                </div>
            )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                                Email / Username
                            </label>
                            <div className="relative">
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                        focusedField === 'email' || data.email 
                                            ? 'border-blue-400 bg-white/10' 
                                            : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your email or username"
                        autoComplete="username"
                        isFocused={true}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField('')}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>
                            <InputError message={errors.email} className="mt-2 text-red-400" />
                </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-lg text-white placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                                        focusedField === 'password' || data.password 
                                            ? 'border-blue-400 bg-white/10' 
                                            : 'border-gray-600 hover:border-gray-500'
                                    }`}
                                    placeholder="Enter your password"
                        autoComplete="current-password"
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField('')}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            <InputError message={errors.password} className="mt-2 text-red-400" />
                </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {/* Primary Login Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Login
                                    </>
                                )}
                            </button>

                            {/* Admin Access Button */}
                            {/* <Link
                                href="#"
                                className="w-full flex justify-center items-center px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 font-medium rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Admin Access
                            </Link> */}
                </div>

                        {/* Forgot Password Link */}
                        {canResetPassword && (
                            <div className="text-center pt-4">
                        <Link
                            href={route('password.request')}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 focus:outline-none focus:underline"
                        >
                            Forgot your password?
                        </Link>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                        Secure industrial safety monitoring • Version 2.1
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        All access attempts are logged and monitored
                    </p>
                </div>
            </div>
        </div>
    );
}
