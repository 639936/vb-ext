// google_translate.js
load("google_language_list.js");

// Hàm chính được gọi bởi ứng dụng
function execute(text, from, to, api_Key) {
    // 1. Kiểm tra xem người dùng đã cung cấp API Key chưa
    if (!api_Key) {
        return Response.error("Google AI API Key is missing. Please provide it in settings.");
    }

    // 2. Lấy tên đầy đủ của ngôn ngữ từ mã (ví dụ: 'vi' -> 'Vietnamese')
    let fromLanguage = getLanguageName(from);
    let toLanguage = getLanguageName(to);

    // 3. Xây dựng câu lệnh (prompt) cho AI
    // Nếu là 'auto', chúng ta yêu cầu AI tự phát hiện ngôn ngữ
    let prompt;
    if (from === 'auto' || fromLanguage === 'Auto Detect') {
        prompt = `Detect the language of the following text and then translate it to ${toLanguage}. Provide only the translated text, without any explanation or introductory phrases.\n\nText to translate:\n"""\n${text}\n"""`;
    } else {
        prompt = `Translate the following text from ${fromLanguage} to ${toLanguage}. You are a professional translator of Chinese and English. Translate texts while ensuring the context, style, narrative perspective, and pronouns are preserved. Pay attention to the names of characters and the appropriateness of pronouns in the text. Provide only the translated text, without any explanation or introductory phrases.\n\nText to translate:\n"""\n${text}\n"""`;
    }

    // 4. Chuẩn bị URL và nội dung request
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + api_Key;

    const requestBody = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        // Thêm cài đặt an toàn để tránh bị chặn vì nội dung nhạy cảm một cách không cần thiết
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    // 5. Gửi yêu cầu đến Gemini API
    let response = fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
    });

    // 6. Xử lý kết quả trả về
    if (response.ok) {
        let result = JSON.parse(response.text());
        
        // Kiểm tra xem AI có trả về nội dung không
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
            let translatedText = result.candidates[0].content.parts[0].text;
            return Response.success(translatedText.trim());
        } else {
            // Xử lý trường hợp AI từ chối trả lời (ví dụ: do bộ lọc an toàn)
            let blockReason = "Unknown reason";
            if (result.candidates && result.candidates[0].finishReason === "SAFETY") {
                blockReason = "Blocked due to safety settings.";
            }
            return Response.error("AI did not return a translation. " + blockReason);
        }
    } else {
        // Xử lý lỗi từ API (ví dụ: sai API key, lỗi server)
        let errorDetails = response.text();
        return Response.error("API call failed with status " + response.status + ". Details: " + errorDetails);
    }
}