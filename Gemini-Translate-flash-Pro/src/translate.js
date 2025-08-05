load("language_list.js"); 
load("apikey.js");
load("prompt.js");

var currentKeyIndex = 0;

// Hàm gọi API Gemini chính, trả về một đối tượng chứa kết quả hoặc trạng thái lỗi
function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) {
        return { status: "error", message: "API Key không hợp lệ." };
    }
     if (!text || text.trim() === '') {
        return { status: "success", data: "?" };
    }

    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=" + apiKey;

    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 1,
            "topP": 0.9,
            "maxOutputTokens": 64000
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    try {
        var response = fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            var result = JSON.parse(response.text());
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }

            if (result.promptFeedback && result.promptFeedback.blockReason) {
                return { status: "blocked", message: "Bị chặn: " + result.promptFeedback.blockReason };
            }
            
             return { status: "error", message: "API không trả về nội dung hợp lệ." };
        } else {
            return { status: "key_error", message: "Lỗi HTTP: " + response.status };
        }
    } catch (e) {
        return { status: "error", message: "Exception: " + e.toString() };
    }
}

// Hàm dịch từng đoạn, được gọi khi dịch toàn bộ thất bại
function translateInChunks(text, prompt) {
    console.log("Kích hoạt chế độ dịch từng đoạn do nội dung bị chặn...");
    var chunks = text.split('\n');
    var translatedChunks = [];

    for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        if (chunk.trim() === '') {
            translatedChunks.push('');
            continue;
        }

        var chunkTranslated = false;
        for (var j = 0; j < apiKeys.length; j++) {
            var key = apiKeys[currentKeyIndex];
            var result = callGeminiAPI(chunk, prompt, key);

            if (result.status === "success") {
                translatedChunks.push(result.data);
                chunkTranslated = true;
                break;
            } else if (result.status === "blocked") {
                translatedChunks.push("...");
                chunkTranslated = true;
                console.log("Một đoạn bị chặn, thay thế bằng '...'.");
                break; 
            } else if (result.status === "key_error") {
                console.log("Key " + currentKeyIndex + " lỗi, đang thử key tiếp theo...");
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            } else {
                 translatedChunks.push("...");
                 chunkTranslated = true;
                 console.log("Lỗi không xác định khi dịch đoạn: " + result.message);
                 break;
            }
        }
         if (!chunkTranslated) {
            translatedChunks.push("...");
        }
    }
    return Response.success(translatedChunks.join('\n'));
}

// Hàm thực thi chính
function execute(text, from, to) {
    // Thay thế .includes() bằng indexOf() !== -1 để tương thích
    if (!apiKeys || apiKeys.length === 0 || (apiKeys[0].indexOf("YOUR_GEMINI_API_KEY") !== -1)) {
        return Response.error("Vui lòng cấu hình API key trong file apikey.js.");
    }
    
    var selectedPrompt = prompts[to] || prompts["default"];

    for (var i = 0; i < apiKeys.length; i++) {
        var key = apiKeys[currentKeyIndex];
        var result = callGeminiAPI(text, selectedPrompt, key);

        if (result.status === "success") {
            return Response.success(result.data);
        }
        
        if (result.status === "blocked") {
            return translateInChunks(text, selectedPrompt);
        }

        if (result.status === "key_error") {
            console.log("Key " + currentKeyIndex + " có thể đã lỗi. Chuyển key.");
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        } else {
            return Response.error("Lỗi không xác định từ API: " + result.message);
        }
    }
    
    return Response.error("Tất cả các API key đều không hoạt động.");
}