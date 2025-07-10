// Nạp danh sách API key và thư viện prompt
load("api_keys.js");
load("prompts.js");

/**
 * Hàm thực thi chính, được gọi bởi extension.
 */
function execute(text, from, to) {
    // Trả về "?" nếu không có văn bản, đúng như yêu cầu ban đầu.
    if (!text || text.trim() === '') {
        return Response.success("?");
    }
    
    // Bắt đầu quá trình dịch, thử từ API key đầu tiên (index 0).
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
    
    // 1. Lấy prompt cơ bản từ thư viện
    var system_prompt = promptLibrary[to] || promptLibrary['default'];

    // 2. Định nghĩa quy tắc cấu trúc
    var STRUCTURE_RULE = "chỉ trả về kết quả, không có markdown";

    // 3. Chỉ thêm quy tắc cấu trúc nếu chế độ KHÔNG PHẢI là 'vi-analyzer'
    if (to !== 'vi-analyzer') {
        system_prompt += "\n\n" + STRUCTURE_RULE;
    }

    // Tạo prompt cuối cùng bằng cách nối chuỗi (tương thích ES5)
    var full_prompt = system_prompt + "\n\n---\n\n" + text;
    
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 0.4, "topK": 1, "topP": 1, "maxOutputTokens": 65536, "stopSequences": []
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
            if (result.candidates && result.candidates.content && result.candidates.content.parts) {
                var translatedText = result.candidates.content.parts.text;
                
                // === XỬ LÝ ĐẦU RA GIỐNG HỆT FILE BAIDU MẪU ===
                // Chỉ cần trả về văn bản đã được trim().
                // Gemini sẽ trả về một chuỗi đã có sẵn các ký tự xuống dòng ('\n')
                // nhờ vào STRUCTURE_RULE mà chúng ta đã thêm vào prompt.
                console.log("API Key " + (keyIndex + 1) + " thành công.");
                return Response.success(translatedText.trim());

            } else {
                console.log("API Key " + (keyIndex + 1) + " không trả về nội dung hợp lệ. Thử key tiếp theo.");
                return tryTranslateWithKeys(text, from, to, keyIndex + 1);
            }
        } else {
            console.log("API Key " + (keyIndex + 1) + " thất bại (HTTP " + response.status + "). Thử key tiếp theo.");
            return tryTranslateWithKeys(text, from, to, keyIndex + 1);
        }
    } catch (e) {
        console.log("Ngoại lệ khi gọi API Key " + (keyIndex + 1) + ": " + e.toString() + ". Thử key tiếp theo.");
        return tryTranslateWithKeys(text, from, to, keyIndex + 1);
    }
}