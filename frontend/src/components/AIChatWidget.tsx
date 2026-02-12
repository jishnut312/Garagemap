'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIChatWidgetProps {
    showTrigger?: 'idle' | 'no-results' | 'always';
    idleTimeMs?: number;
}

export default function AIChatWidget({
    showTrigger = 'always',
    idleTimeMs = 8000
}: AIChatWidgetProps) {
    const djangoApiUrl =
        process.env.NEXT_PUBLIC_DJANGO_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:8000/api';

    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(showTrigger === 'always');
    const [isDismissed, setIsDismissed] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello. I'm here to help with your vehicle concerns. What issue are you experiencing?",
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Idle detection logic
    useEffect(() => {
        if (showTrigger === 'idle' && !isDismissed) {
            const resetTimer = () => {
                if (idleTimerRef.current) {
                    clearTimeout(idleTimerRef.current);
                }
                idleTimerRef.current = setTimeout(() => {
                    setIsVisible(true);
                }, idleTimeMs);
            };

            const events = ['mousemove', 'keydown', 'scroll', 'click'];
            events.forEach(event => {
                window.addEventListener(event, resetTimer);
            });

            resetTimer();

            return () => {
                events.forEach(event => {
                    window.removeEventListener(event, resetTimer);
                });
                if (idleTimerRef.current) {
                    clearTimeout(idleTimerRef.current);
                }
            };
        }
    }, [showTrigger, isDismissed, idleTimeMs]);

    // Show on no results
    useEffect(() => {
        if (showTrigger === 'no-results' && !isDismissed) {
            setIsVisible(true);
        }
    }, [showTrigger, isDismissed]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${djangoApiUrl}/chatbot/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message: inputMessage,
                    history: messages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                }),
            });

            const data = await response.json();

            if (data.success) {
                const aiMessage: Message = {
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "I apologize, but I'm unable to connect right now. Please try calling a mechanic directly or use our search feature.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        setIsVisible(false);
        setIsDismissed(true);
        sessionStorage.setItem('chatbot-dismissed', 'true');
    };

    // Check if dismissed in this session
    useEffect(() => {
        const dismissed = sessionStorage.getItem('chatbot-dismissed');
        if (dismissed === 'true') {
            setIsDismissed(true);
            setIsVisible(false);
        }
    }, []);

    if (!isVisible || isDismissed) return null;

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 group"
                    aria-label="Open Support Chat"
                    style={{ animation: 'fadeIn 0.3s ease-in' }}
                >
                    <Bot className="w-7 h-7" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50"
                    style={{ animation: 'fadeIn 0.2s ease-in' }}
                >
                    {/* Header */}
                    <div className="bg-slate-800 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Vehicle Support</h3>
                                <p className="text-xs text-slate-300 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Available
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="w-8 h-8 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                        ? 'bg-slate-700 text-white'
                                        : 'bg-orange-100 text-orange-600'
                                        }`}
                                >
                                    {msg.role === 'user' ? (
                                        <User className="w-4 h-4" />
                                    ) : (
                                        <Bot className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={`max-w-[75%] rounded-xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-slate-700 text-white'
                                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-xs mt-1 opacity-60">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Describe your vehicle issue..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-800"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                aria-label="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                            AI-powered assistance • Responses may vary
                        </p>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </>
    );
}
