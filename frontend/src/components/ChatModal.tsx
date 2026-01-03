'use client';

import { useState, useEffect, useRef } from 'react';
import {
    createChat,
    sendMessage,
    subscribeToMessages,
    type Message
} from '@/lib/firestore';
import { X, Send, User, Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    currentUserId: string;
    otherUserId: string; // The ID of the person we are chatting with
    otherUserName: string; // Name to display in header
    isMechanic: boolean; // Are we the mechanic?
    // Current user details for creating chat context if needed
    currentUserName: string;
    mechanicId?: string; // Mechanic Profile ID (needed for creating chat)
}

export default function ChatModal({
    isOpen,
    onClose,
    requestId,
    currentUserId,
    otherUserId,
    otherUserName,
    isMechanic,
    currentUserName,
    mechanicId
}: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatId, setChatId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        let unsubscribe: (() => void) | undefined;

        const initChat = async () => {
            setLoading(true);
            try {
                // Prepare IDs for chat creation
                // If I am mechanic: userId=otherUserId, mechanicId=mechanicId
                // If I am user: userId=currentUserId, mechanicId=mechanicId (must be passed)

                // Logic:
                const uId = isMechanic ? otherUserId : currentUserId;
                const mId = mechanicId || ''; // Should be passed if we are user, or if we are mechanic we know our profile id? 
                // Actually, for simplicity, let's assume the parent passes the correct IDs for createChat

                // We'll use the createChat helper which finds OR creates
                const id = await createChat(
                    requestId,
                    uId,
                    mId, // This might be tricky if we don't have it.
                    // Let's assume the parent provides valid IDs.
                    isMechanic ? otherUserName : currentUserName, // userName
                    isMechanic ? currentUserName : otherUserName  // mechanicName
                );

                setChatId(id);

                // Load from Local Storage first
                try {
                    const saved = localStorage.getItem(`chat_${id}`);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        // Reconstruct timestamps
                        const revivedMessages = parsed.map((m: any) => ({
                            ...m,
                            timestamp: m.timestamp && m.timestamp.seconds
                                ? new Timestamp(m.timestamp.seconds, m.timestamp.nanoseconds)
                                : m.timestamp ? new Timestamp(m.timestamp.seconds, m.timestamp.nanoseconds) : null
                        }));
                        setMessages(revivedMessages);
                        if (revivedMessages.length > 0) setLoading(false);
                    }
                } catch (e) {
                    console.error("Failed to load from localStorage", e);
                }

                unsubscribe = subscribeToMessages(id, (msgs) => {
                    setMessages(msgs);
                    // Save to Local Storage
                    try {
                        localStorage.setItem(`chat_${id}`, JSON.stringify(msgs));
                    } catch (e) {
                        console.error("Failed to save to localStorage", e);
                    }

                    setLoading(false);
                    scrollToBottom();
                });
            } catch (error) {
                console.error("Error initializing chat:", error);
                setLoading(false);
            }
        };

        if (isOpen && requestId) {
            initChat();
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [isOpen, requestId, currentUserId, otherUserId, mechanicId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !chatId) return;

        try {
            const text = newMessage;
            setNewMessage(''); // Optimistic clear
            await sendMessage(chatId, currentUserId, text, isMechanic);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md h-[600px] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm text-slate-600">
                            {otherUserName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{otherUserName}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Live Chat
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <p>No messages yet.</p>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === currentUserId;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${isMe
                                        ? 'bg-red-500 text-white rounded-br-none'
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                        }`}>
                                        <p>{msg.text}</p>
                                        <div className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-red-100' : 'text-slate-400'}`}>
                                            {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-900 placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="w-12 h-12 flex items-center justify-center bg-red-600 text-white rounded-xl hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-red-500/25"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
