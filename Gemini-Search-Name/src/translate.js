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
    
    // Bắt đầu quá trình thử các API key
    return tryTranslateWithKeys(text, from, to, 0);
}

/**
 * Hàm đệ quy để thử tuần tự các API key.
 */
function tryTranslateWithKeys(text, from, to, keyIndex) {
    if (keyIndex >= apiKeys.length) {
        return Response.error("Tất cả API Key đều đã hết hạn mức hoặc không hợp lệ.");
    }

    const apiKey = apiKeys[keyIndex];
    if (!apiKey || apiKey.startsWith("YOUR_")) {
        console.log(`Bỏ qua API key không hợp lệ ở vị trí ${keyIndex + 1}.`);
        return tryTranslateWithKeys(text, from, to, keyIndex + 1);
    }
    
    // --- LOGIC CHỌN PROMPT ĐỘNG ---
    // Chọn prompt từ thư viện dựa vào giá trị của 'to'.
    // Nếu không tìm thấy 'to' trong thư viện, dùng prompt 'default'.
    const system_prompt = promptLibrary[to] || promptLibrary['default'];
    // --- KẾT THÚC LOGIC CHỌN PROMPT ---

    const full_prompt = `${system_prompt}\n\n---\n\n${text}`;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 0.3, "topK": 1, "topP": 1, "maxOutputTokens": 8192, "stopSequences": []
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    try {
        console.log(`Đang thử API Key ${keyIndex + 1} với chế độ dịch '${to}'...`);
        let response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

        if (response.ok) {
            let result = JSON.parse(response.text());
            if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                let translatedText = result.candidates[0].content.parts[0].text;
                console.log(`API Key ${keyIndex + 1} thành công.`);
                return Response.success(translatedText.trim());
            } else {
                console.log(`API Key ${keyIndex + 1} không trả về nội dung hợp lệ. Thử key tiếp theo.`);
                return tryTranslateWithKeys(text, from, to, keyIndex + 1);
            }
        } else {
            console.log(`API Key ${keyIndex + 1} thất bại (HTTP ${response.status}). Thử key tiếp theo.`);
            return tryTranslateWithKeys(text, from, to, keyIndex + 1);
        }
    } catch (e) {
        console.log(`Ngoại lệ khi gọi API Key ${keyIndex + 1}: ${e.toString()}. Thử key tiếp theo.`);
        return tryTranslateWithKeys(text, from, to, keyIndex + 1);
    }
}