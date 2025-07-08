// Nạp danh sách API key và thư viện prompt
load("api_keys.js");
load("prompts.js");

/**
 * Hàm thực thi chính, được gọi bởi extension.
 */
function execute(text, from, to) {
    if (!text || text.trim() === '') {
        // Trả về dấu ? trong thẻ p để đảm bảo nhất quán
        return Response.success("<p>?</p>");
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
    
    const system_prompt = promptLibrary[to] || promptLibrary['default'];
    const full_prompt = `${system_prompt}\n\n---\n\n${text}`;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const body = {
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
        console.log(`Đang thử API Key ${keyIndex + 1} với chế độ dịch '${to}'...`);
        let response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

        if (response.ok) {
            let result = JSON.parse(response.text());
            if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                let translatedText = result.candidates[0].content.parts[0].text;
                
                // ==========================================================
                // === BẮT ĐẦU THAY ĐỔI: ĐỊNH DẠNG ĐẦU RA SANG HTML      ===
                // ==========================================================

                // 1. Thay thế tất cả các ký tự xuống dòng (\n) bằng thẻ <br>
                //    Sử dụng biểu thức chính quy /.../g để thay thế toàn bộ.
                const textWithBreaks = translatedText.replace(/\n/g, '<br>');
                
                // 2. Bọc toàn bộ kết quả trong cặp thẻ <p>...</p> để tạo thành một đoạn văn bản HTML.
                const htmlOutput = `<p>${textWithBreaks}</p>`;

                // ==========================================================
                // === KẾT THÚC THAY ĐỔI                                 ===
                // ==========================================================

                console.log(`API Key ${keyIndex + 1} thành công.`);

                // Trả về chuỗi đã được định dạng HTML
                return Response.success(htmlOutput.trim());

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