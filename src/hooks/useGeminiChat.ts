import { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

const SYSTEM_PROMPT = `
Bạn là một trợ lý AI am hiểu về điện ảnh của website TMovie.
Nhiệm vụ của bạn là tư vấn phim cho người dùng dựa trên sở thích, tâm trạng hoặc yêu cầu cụ thể của họ.
Phong cách trả lời: Thân thiện, hài hước, ngắn gọn và "teen" một chút (dùng emoji).
Nếu người dùng hỏi về vấn đề không liên quan đến phim ảnh, hãy khéo léo từ chối và quay lại chủ đề phim.
Khi gợi ý phim, hãy cố gắng đưa ra Tên Phim (Năm sản xuất) và một lý do ngắn gọn tại sao nên xem.
`;

export const useGeminiChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'model',
            content: 'Chào bạn! Mình là AI tư vấn phim của TMovie đây. 🎬\nBạn đang muốn xem phim gì? Hay kể cho mình nghe tâm trạng của bạn đi! 😉',
            timestamp: Date.now(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState<string>(() => {
        return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    });

    const saveApiKey = (key: string) => {
        localStorage.setItem('gemini_api_key', key);
        setApiKey(key);
    };

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        if (!apiKey) {
            toast.error('Vui lòng nhập API Key để sử dụng tính năng này!');
            return;
        }

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Initialize GoogleGenAI with the new SDK
            const ai = new GoogleGenAI({ apiKey });

            // Construct history for the new SDK format if needed, 
            // but generateContent is stateless. For chat, we should append history to prompt 
            // or use a chat session if supported by the new SDK (it varies).
            // For simplicity and robustness with the new SDK, we'll append history to the prompt.

            let fullPrompt = SYSTEM_PROMPT + "\n\nLịch sử chat:\n";
            messages.forEach(msg => {
                fullPrompt += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
            });
            fullPrompt += `User: ${content}\nAI:`;

            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: fullPrompt,
            });

            const text = response.text;

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: text || "Xin lỗi, mình không trả lời được câu này.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiMsg]);

        } catch (error: any) {
            console.error('Gemini API Error:', error);

            let errorMessage = 'Có lỗi xảy ra khi gọi AI.';
            if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
                errorMessage = 'Hệ thống đang quá tải (Hết lượt miễn phí). Vui lòng chờ 1 phút rồi thử lại!';
            } else if (error.message?.includes('404')) {
                errorMessage = 'Model AI không khả dụng.';
            }

            toast.error(errorMessage);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'model',
                    content: 'Xin lỗi, mình đang bị "nghẽn mạng" do quá nhiều người dùng. 😵\nBạn chờ khoảng 1 phút rồi hỏi lại nhé!',
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, messages]);

    const clearChat = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'model',
                content: 'Chào bạn! Mình là AI tư vấn phim của TMovie đây. 🎬\nBạn đang muốn xem phim gì? Hay kể cho mình nghe tâm trạng của bạn đi! 😉',
                timestamp: Date.now(),
            },
        ]);
    };

    return {
        messages,
        isLoading,
        apiKey,
        saveApiKey,
        sendMessage,
        clearChat,
    };
};
