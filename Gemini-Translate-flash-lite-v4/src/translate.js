load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

// Bỏ biến toàn cục currentKeyIndex. Logic sẽ được xử lý cục bộ.

/**
 * Hàm gọi API Gemini, chịu trách nhiệm gửi yêu cầu và xử lý phản hồi.
 * (Hàm này không thay đổi)
 */
function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) {
        return { status: "error", message: "API Key không hợp lệ." };
    }
    if (!text || text.trim() === '') {
        return { status: "success", data: "" };
    }

    var full_prompt = prompt + "\n\n---\n\n" + text;
    var model = "gemini-2.5-flash";
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 1.0, "topP": 0.95, "topK": 40, "maxOutputTokens": 65536
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    try {
        var response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        
        if (response.ok) {
            var result = JSON.parse(response.text());
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }
            if (result.promptFeedback?.blockReason) { 
                return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };
            }
            if (result.candidates && !result.candidates[0]?.content?.parts) {
                return { status: "blocked", message: "Bị chặn (không có nội dung trả về)." };
            }
            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + response.text() };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + " (API key hoặc tên model sai)." };
        }
    } catch (e) {
        return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() };
    }
}

/**
 * Dịch một chunk văn bản với cơ chế "Thử và Sai" (Try-Failover).
 * Luôn bắt đầu với key đầu tiên, chỉ chuyển sang key tiếp theo nếu key hiện tại lỗi.
 * @param {string} chunkText - Phần văn bản cần dịch.
 * @param {string} prompt - Prompt hướng dẫn.
 * @returns {object} - Kết quả từ callGeminiAPI.
 */
function translateSingleChunkWithRetry(chunkText, prompt) {
    var lastError = null;

    // Vòng lặp sẽ thử lần lượt từng key trong danh sách cho CHUNK HIỆN TẠI.
    for (var i = 0; i < apiKeys.length; i++) {
        var apiKeyToUse = apiKeys[i];
        console.log("Đang thử dịch chunk với Key Index " + i);

        var result = callGeminiAPI(chunkText, prompt, apiKeyToUse);

        // Nếu dịch thành công (hoặc bị chặn), trả về kết quả ngay lập tức.
        if (result.status === "success" || result.status === "blocked") {
            console.log("Thành công với Key Index " + i);
            return result; 
        }
        
        // Nếu lỗi, lưu lại lỗi và vòng lặp sẽ tự động thử key tiếp theo.
        lastError = result; 
        console.log("Lỗi với Key Index " + i + ": " + result.message + ". Đang thử key tiếp theo...");
    }

    // Nếu vòng lặp kết thúc mà không thành công, có nghĩa là tất cả các key đều đã lỗi.
    console.log("Tất cả API keys đều không thành công cho chunk này.");
    return lastError;
}

/**
 * HÀM CHÍNH: Được Vbook gọi đầu tiên để bắt đầu quá trình dịch.
 * (Hàm này không thay đổi logic, chỉ gọi hàm retry đã được cải tiến)
 */
function execute(text, from, to) {
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    // --- PHÂN LUỒNG THÔNG MINH ---
    var lines = text.split('\n');
    var isContent = false;
    if (text.length >= 100) {
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length >= 50) {
                isContent = true;
                break;
            }
        }
    }

    // LUỒNG 1: DÙNG EDGE TRANSLATE
    if (text.length < 100 || !isContent) {
        console.log("Phát hiện văn bản ngắn hoặc danh sách chương. Sử dụng Edge Translate.");
        var edgeToLang = (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') ? 'vi' : to;
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0);
        
        if (rawTranslatedText !== null) {
            return Response.success(rawTranslatedText);
        } else { 
            return Response.error("Lỗi Edge Translate. Vui lòng thử lại."); 
        }
    }
    
    // LUỒNG 2: DÙNG GEMINI AI
    console.log("Phát hiện nội dung chương. Bắt đầu quy trình Gemini AI.");
    if (!apiKeys || apiKeys.length === 0) {
        return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 API key trong file apikey.js.");
    }
    
    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    // Chia văn bản thành các phần nhỏ (chunks)
    var textChunks = [];
    const CHUNK_SIZE = 8000;
    const MIN_LAST_CHUNK_SIZE = 1000;
    var currentChunk = "";

    for (var i = 0; i < lines.length; i++) {
        var paragraph = lines[i];
        if (currentChunk.length === 0 && paragraph.length >= CHUNK_SIZE) {
            textChunks.push(paragraph);
            continue;
        }
        if (currentChunk.length + paragraph.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
            textChunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            currentChunk = currentChunk ? (currentChunk + "\n" + paragraph) : paragraph;
        }
    }
    if (currentChunk.length > 0) {
        textChunks.push(currentChunk);
    }
    if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
        var lastChunk = textChunks.pop();
        var secondLastChunk = textChunks.pop();
        textChunks.push(secondLastChunk + "\n" + lastChunk);
        console.log("Chunk cuối quá nhỏ, đã gộp vào chunk trước đó.");
    }
    
    console.log("Văn bản đã được chia thành " + textChunks.length + " phần.");

    // Dịch từng chunk và thu thập kết quả
    var finalParts = [];
    for (var k = 0; k < textChunks.length; k++) {
        console.log("Bắt đầu xử lý phần " + (k + 1) + "/" + textChunks.length + "...");
        var chunkToSend = textChunks[k];

        if (isPinyinRoute) {
            try {
                load("phienam.js");
                chunkToSend = phienAmToHanViet(chunkToSend);
            } catch (e) {
                return Response.error("LỖI: Không thể tải hoặc thực thi file phienam.js.");
            }
        }

        // Gọi hàm retry đã được cải tiến
        var chunkResult = translateSingleChunkWithRetry(chunkToSend, selectedPrompt);
        
        if (chunkResult.status === 'success' || (chunkResult.status === 'blocked' && chunkResult.data)) {
            finalParts.push(chunkResult.data);
        } else {
            var errorString = "<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " (ĐÃ THỬ HẾT CÁC KEY) --->>>>>\n" 
                            + "Lý do: " + chunkResult.message + "\n" 
                            + "<<<<<--- KẾT THÚC LỖI --->>>>>";
            finalParts.push(errorString);
        }
    }
    
    var finalContent = finalParts.join('\n\n');
    return Response.success(finalContent.trim());
}