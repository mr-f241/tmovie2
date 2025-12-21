import { GoogleGenAI } from "@google/genai";

// Key của bạn
const API_KEY = 'AIzaSyAgxU_LvEcH-0InOmUng491xhaKZYfrYdA';

// Khởi tạo client với key trực tiếp (hoặc qua env)
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function main() {
    console.log('🔄 Đang test model gemini-2.0-flash-exp (hoặc 1.5-flash)...');

    try {
        // Thử model 2.0 Flash Experimental (theo docs mới thường là bản này)
        // Hoặc thử 1.5 Flash nếu 2.0 chưa public rộng rãi qua SDK này
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: "Chào bạn, hãy giới thiệu ngắn gọn về bản thân.",
        });

        console.log('✅ KẾT QUẢ:', response.text);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);

        // Fallback thử 1.5 Flash
        console.log('\n🔄 Đang thử fallback sang gemini-1.5-flash...');
        try {
            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: "Chào bạn, hãy giới thiệu ngắn gọn về bản thân.",
            });
            console.log('✅ KẾT QUẢ (1.5 Flash):', response.text);
        } catch (err) {
            console.error('❌ Lỗi fallback:', err.message);
        }
    }
}

main();
