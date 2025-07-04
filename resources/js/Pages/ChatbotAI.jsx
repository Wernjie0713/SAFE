import { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';

// Configure axios defaults for CSRF protection and credentials
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const SUGGESTED_QUESTIONS = [
    "What's the air quality in Sector B?",
    "Are there any sensors offline right now?",
    "Show me recent critical alerts",
    "What's the temperature trend in the storage area?",
    "When was the last safety inspection?",
    "What's the robot's current location?",
];

export default function ChatbotAI({ auth }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m SAFE AI, your expert assistant for the factory monitoring system. How can I help you today?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [error, setError] = useState(null);
    const [systemSummary, setSystemSummary] = useState(null);
    const [summaryError, setSummaryError] = useState(null);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch system summary
    const fetchSystemSummary = async () => {
        console.log('Fetching system summary...');
        try {
            const response = await axios.get('/api/ai-assistant/summary');
            console.log('System summary response:', response.data);
            setSystemSummary(response.data);
            setSummaryError(null);
        } catch (err) {
            console.error('Failed to fetch system summary:', {
                error: err,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.response?.headers
            });
            setSummaryError('Failed to load system summary');
        }
    };

    // Fetch summary on component mount and every 30 seconds
    useEffect(() => {
        console.log('Setting up system summary polling');
        fetchSystemSummary();
        const interval = setInterval(fetchSystemSummary, 30000);
        return () => {
            console.log('Cleaning up system summary polling');
            clearInterval(interval);
        };
    }, []);

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        console.log('Messages updated, scrolling to bottom');
        scrollToBottom();
    }, [messages]);

    // Handle suggested question click
    const handleSuggestedQuestion = (question) => {
        console.log('Suggested question selected:', question);
        setInput(question);
        inputRef.current?.focus();
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        console.log('Submitting chat message:', {
            message: userMessage,
            conversationId: conversationId
        });

        setInput('');
        setError(null);

        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        // Show loading state
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '...', isLoading: true }]);

        try {
            console.log('Sending chat request to API...');
            const response = await axios.post('/api/ai-assistant/chat', {
                message: userMessage,
                conversation_id: conversationId,
            });

            console.log('Chat API response:', {
                data: response.data,
                status: response.status,
                headers: response.headers
            });

            // Remove loading message and add AI response
            setMessages(prev => prev.filter(msg => !msg.isLoading));
            setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
            
            // Store conversation ID if it's new
            if (!conversationId && response.data.conversation_id) {
                console.log('Setting new conversation ID:', response.data.conversation_id);
                setConversationId(response.data.conversation_id);
            }

        } catch (err) {
            console.error('Chat API request failed:', {
                error: err,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.response?.headers,
                message: userMessage,
                conversationId: conversationId
            });

            // Remove loading message and show error
            setMessages(prev => prev.filter(msg => !msg.isLoading));
            setError('Failed to get response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    // Handle enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">AI Assistant</h2>}
        >
            <Head title="AI Assistant" />

            <div className="py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-0">
                    <div className="flex gap-6">
                        {/* Main Chat Area */}
                        <div className="flex-1">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="flex flex-col h-[calc(100vh-200px)]">
                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {messages.map((message, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-lg p-4 ${
                                                        message.role === 'user'
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                    }`}
                                                >
                                                    {message.isLoading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                        </div>
                                                    ) : (
                                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="px-6 py-2 bg-red-50 border-t border-red-100">
                                            <p className="text-red-600 text-sm">{error}</p>
                                        </div>
                                    )}

                                    {/* Input Area */}
                                    <div className="border-t border-gray-200 p-4">
                                        <form onSubmit={handleSubmit} className="flex space-x-4">
                                            <div className="flex-1">
                                                <TextInput
                                                    ref={inputRef}
                                                    type="text"
                                                    value={input}
                                                    onChange={handleInputChange}
                                                    onKeyPress={handleKeyPress}
                                                    placeholder="Type your message here..."
                                                    className="w-full"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <PrimaryButton type="submit" disabled={isLoading || !input.trim()}>
                                                {isLoading ? 'Sending...' : 'Send'}
                                            </PrimaryButton>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-80 space-y-6">
                            {/* System Summary Panel */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900">System Summary</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {summaryError ? (
                                        <p className="text-red-600 text-sm">{summaryError}</p>
                                    ) : !systemSummary ? (
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        </div>
                                    ) : (
                                        <>
                                            {systemSummary.latest_alert && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium text-gray-700">Latest Alert</h4>
                                                    <div className={`text-sm p-2 rounded ${getSeverityColor(systemSummary.latest_alert.severity)}`}>
                                                        {systemSummary.latest_alert.type} - {systemSummary.latest_alert.location}
                                                        <div className="text-xs mt-1 text-gray-600">
                                                            {systemSummary.latest_alert.created_at}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700">Offline Sensors</h4>
                                                <p className="text-sm mt-1">
                                                    {systemSummary.offline_sensors_count} sensors currently offline
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700">Robot Status</h4>
                                                <p className="text-sm mt-1">{systemSummary.robot_status}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700">Last AI Recommendation</h4>
                                                <p className="text-sm mt-1">{systemSummary.last_recommendation}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Suggested Questions Panel */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900">Suggested Questions</h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2">
                                        {SUGGESTED_QUESTIONS.map((question, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestedQuestion(question)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 