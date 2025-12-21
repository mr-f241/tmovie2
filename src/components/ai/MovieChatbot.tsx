import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Key, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export const MovieChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [tempKey, setTempKey] = useState('');

    const { messages, isLoading, apiKey, saveApiKey, sendMessage, clearChat } = useGeminiChat();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        const msg = inputValue;
        setInputValue('');
        await sendMessage(msg);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSaveKey = () => {
        if (tempKey.trim()) {
            saveApiKey(tempKey.trim());
            setShowKeyModal(false);
            setTempKey('');
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-8 w-8" />}
                </Button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col glass-card rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">AI Tư Vấn Phim</h3>
                                    <p className="text-xs text-white/60 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                                    onClick={clearChat}
                                    title="Xóa đoạn chat"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 hover:bg-white/10 ${!apiKey ? 'text-red-400 animate-pulse' : 'text-white/60 hover:text-white'}`}
                                            title="Cài đặt API Key"
                                        >
                                            <Key className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Cài đặt Gemini API Key</DialogTitle>
                                            <DialogDescription>
                                                Nhập API Key của Google Gemini để sử dụng tính năng này.
                                                <br />
                                                <a
                                                    href="https://aistudio.google.com/app/apikey"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    Lấy API Key miễn phí tại đây
                                                </a>
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex items-center space-x-2">
                                            <div className="grid flex-1 gap-2">
                                                <Input
                                                    id="link"
                                                    placeholder="Paste API Key vào đây..."
                                                    value={tempKey}
                                                    onChange={(e) => setTempKey(e.target.value)}
                                                    type="password"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button onClick={handleSaveKey}>Lưu Key</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-black/40">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                                    ? 'bg-primary text-white rounded-tr-none'
                                                    : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                                                }`}
                                        >
                                            {msg.content.split('\n').map((line, i) => (
                                                <p key={i} className="mb-1 last:mb-0">{line}</p>
                                            ))}
                                            <p className="text-[10px] opacity-50 mt-1 text-right">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 border border-white/5 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 bg-black/20 border-t border-white/10 backdrop-blur-md">
                            {!apiKey ? (
                                <Button
                                    onClick={() => setShowKeyModal(true)}
                                    className="w-full bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/50"
                                >
                                    <Key className="mr-2 h-4 w-4" />
                                    Nhập API Key để bắt đầu chat
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Hỏi gì đi (VD: Phim kinh dị hay nhất 2023)..."
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={handleSend}
                                        disabled={isLoading || !inputValue.trim()}
                                        size="icon"
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
