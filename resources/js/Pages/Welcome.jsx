import { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';

// Feature card component
function FeatureCard({ icon, title, description, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-blue-500/30 transition-colors"
        >
            <div className="absolute -top-3 -left-3 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-blue-500/30">
                {icon}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-100">{title}</h3>
            <p className="mt-2 text-gray-400">{description}</p>
        </motion.div>
    );
}

export default function Welcome({ auth, appName }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <Head title="Welcome" />
            
            {/* Animated Background */}
            <div className="fixed inset-0 bg-gray-900">
                <div className="absolute inset-0 overflow-hidden">
                    {/* Animated gradient circles */}
                    <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/30 rounded-full blur-3xl animate-drift-1"></div>
                    <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-3xl animate-drift-2"></div>
                    <div className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-blue-400/20 rounded-full blur-3xl animate-drift-3"></div>
                    
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]"></div>
                                            </div>
                                        </div>

            <div className="relative min-h-screen">
                {/* Navigation */}
                <div className="absolute top-0 right-0 p-6 text-right z-10">
                    <Link
                        href={auth?.user ? route('dashboard') : route('login')}
                        className="font-semibold text-gray-300 hover:text-gray-100 focus:outline focus:outline-2 focus:rounded-sm focus:outline-blue-500"
                    >
                        {auth?.user ? 'Dashboard' : 'Log in'}
                    </Link>
                                    </div>

                {/* Main content */}
                <div className="relative pt-32 sm:pt-24 flex flex-col items-center px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
                            {appName}
                            <span className="block text-2xl sm:text-3xl mt-4 text-blue-400 font-normal">
                                Predictive Safety for Modern Industry
                            </span>
                        </h1>
                        
                        <p className="max-w-2xl mx-auto text-xl text-gray-400">
                            Predicting Threats. Protecting Lives.
                        </p>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href={auth?.user ? route('dashboard') : route('login')}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="relative group px-8 py-3 bg-blue-600 text-white rounded-lg overflow-hidden transition-all duration-300 hover:bg-blue-700"
                        >
                            <motion.div
                                className="absolute inset-0 bg-blue-400/20"
                                animate={{
                                    scale: isHovered ? 1.5 : 1,
                                    opacity: isHovered ? 0 : 0.2,
                                }}
                                transition={{ duration: 0.5 }}
                            />
                            {auth?.user ? 'Go to Dashboard' : 'Login to Dashboard'}
                        </Link>
                        
                        <button className="px-8 py-3 bg-gray-800/50 text-gray-300 rounded-lg backdrop-blur-sm border border-gray-700 transition-all duration-300 hover:bg-gray-800 hover:border-gray-600">
                            Learn More
                        </button>
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto px-6"
                    >
                        <FeatureCard
                            icon={
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                            }
                            title="Predictive Analytics"
                            description="Advanced AI algorithms predict potential safety issues before they occur."
                            delay={1.0}
                        />
                        
                        <FeatureCard
                            icon={
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            }
                            title="Robotic Vision"
                            description="24/7 automated monitoring using state-of-the-art computer vision systems."
                            delay={1.2}
                        />
                        
                        <FeatureCard
                            icon={
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                            }
                            title="Centralized Control"
                            description="Unified dashboard for monitoring and managing all safety systems."
                            delay={1.4}
                        />
                    </motion.div>
                </div>
            </div>
        </>
    );
}
