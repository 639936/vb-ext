// Nạp danh sách API key và thư viện prompt
load("api_keys.js");
load("prompts.js");

/**
 * Hàm thực thi chính, được gọi bởi extension.
 */
function execute(text, from, to) {
    if (!text || text.trim() === '') {
        return Response.success("?");
    }
    return tryTranslateWithKeys(text, from, to, 0);
}

/**
 * Hàm đệ quy để thử tuần tự các API key, được viết bằng cú pháp ES5.
 */
function tryTranslateWithKeys(text, from, to, keyIndex) {
    if (keyIndex >= apiKeys.length) {
        return Response.error("Tất cả API Key đều đã hết hạn mức hoặc không hợp lệ.");
    }

    var apiKey = apiKeys[keyIndex];
    if (!apiKey || apiKey.startsWith("YOUR_")) {
        console.log("Bỏ qua API key không hợp lệ ở vị trí " + (keyIndex + 1));
        return tryTranslateWithKeys(text, from, to, keyIndex + 1);
    }
    
    var system_prompt = promptLibrary[to] || promptLibrary['default'];
    var STRUCTURE_RULE = "QUY TẮC CẤU TRÚC: Đảm bảo tuân thủ cấu trúc của văn bản gốc. chỉ trả về kết quả, không có markdown";

    if (to !== 'vi-analyzer') {
        system_prompt += "\n\n" + STRUCTURE_RULE;
    }

    var full_prompt = system_prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 0.3, "topK": 1, "topP": 1, "maxOutputTokens": 65536, "stopSequences": []
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    try {
        console.log("Đang thử API Key " + (keyIndex + 1) + " với chế độ dịch '" + to + "'...");
        var response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

        if (response.ok) {
            var result = JSON.parse(response.text());

            // =================================================================
            // === SỬA LỖI QUAN TRỌNG TẠI ĐÂY                                ===
            // =================================================================
            // Phải truy cập vào phần tử đầu tiên của mảng "candidates" là [0]
            if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0]) {
                var translatedText = result.candidates[0].content.parts[0].text;
                
                console.log("API Key " + (keyIndex + 1) + " thành công.");
                return Response.success(translatedText.trim());

            } else {
                // In ra lỗi thực tế từ API (nếu có) để dễ debug hơn
                var apiError = result.promptFeedback ? JSON.stringify(result.promptFeedback) : "Không có nội dung trả về.";
                console.log("API Key " + (keyIndex + 1) + " không trả về nội dung hợp lệ. Lý do: " + apiError + ". Thử key tiếp theo.");
                return tryTranslateWithKeys(text, from, to, keyIndex + 1);
            }
            // =================================================================
            // === KẾT THÚC PHẦN SỬA LỖI                                      ===
            // =================================================================

        } else {
            console.log("API Key " + (keyIndex + 1) + " thất bại (HTTP " + response.status + "). Thử key tiếp theo.");
            return tryTranslateWithKeys(text, from, to, keyIndex + 1);
        }
    } catch (e) {
        console.log("Ngoại lệ khi gọi API Key " + (keyIndex + 1) + ": " + e.toString() + ". Thử key tiếp theo.");
        return tryTranslateWithKeys(text, from, to, keyIndex + 1);
    }
}