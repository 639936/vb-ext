load("language_list.js"); 
load("apikey.js");
load("prompt.js");

var currentKeyIndex = 0;

// Hàm gọi API Gemini chính, không thay đổi
function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) {
        return { status: "error", message: "API Key không hợp lệ." };
    }
    if (!text || text.trim() === '') {
        return { status: "success", data: "" };
    }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": 65536
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
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }
            if (result.promptFeedback && result.promptFeedback.blockReason) {
                return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };
            }
            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + response.text() };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + " (API key có thể sai hoặc hết hạn mức)." };
        }
    } catch (e) {
        return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() };
    }
}

// Hàm dịch từng dòng, được gọi khi một chunk bị chặn an toàn
function translateInChunksByLine(text, prompt) {
    console.log("Kích hoạt chế độ dịch từng dòng do nội dung bị chặn...");
    var lines = text.split('\n');
    var translatedLines = [];
    var errorOccurred = false;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.trim() === '') {
            translatedLines.push('');
            continue;
        }
        var lineTranslated = false;
        for (var j = 0; j < apiKeys.length; j++) {
            var key = apiKeys[currentKeyIndex];
            var result = callGeminiAPI(line, prompt, key);
            if (result.status === "success") {
                translatedLines.push(result.data);
                lineTranslated = true;
                break;
            } else if (result.status === "blocked") {
                translatedLines.push("...");
                lineTranslated = true;
                break; 
            } else if (result.status === "key_error") {
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            } else {
                translatedLines.push("[LỖI DỊCH DÒNG: " + result.message + "]");
                lineTranslated = true;
                errorOccurred = true;
                break;
            }
        }
        if (!lineTranslated) {
            translatedLines.push("[LỖI: TẤT CẢ API KEY ĐỀU KHÔNG HOẠT ĐỘNG]");
            errorOccurred = true;
        }
    }
    
    // Trả về một đối tượng chứa kết quả, thay vì Response.success
    if (errorOccurred) {
        return { status: "partial_error", data: translatedLines.join('\n') };
    }
    return { status: "success", data: translatedLines.join('\n') };
}

// Hàm dịch một chunk văn bản duy nhất (có xoay vòng key và xử lý lỗi)
function translateSingleChunk(chunkText, prompt) {
    for (var i = 0; i < apiKeys.length; i++) {
        var key = apiKeys[currentKeyIndex];
        var result = callGeminiAPI(chunkText, prompt, key);
        if (result.status === "success") {
            return result;
        }
        if (result.status === "blocked") {
            return translateInChunksByLine(chunkText, prompt);
        }
        if (result.status === "key_error") {
            console.log("Key " + currentKeyIndex + " có thể đã lỗi. Chuyển key.");
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        } else {
            return result; // Trả về lỗi không xác định để hiển thị
        }
    }
    return { status: "error", message: "Tất cả các API key đều không hoạt động." };
}

// Hàm thực thi chính (đóng vai trò quản lý và gỡ lỗi)
function execute(text, from, to) {
    if (!apiKeys || apiKeys.length === 0 || (apiKeys[0].indexOf("YOUR_GEMINI_API_KEY") !== -1)) {
        return Response.error("Vui lòng cấu hình API key trong file apikey.js.");
    }
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    var selectedPrompt = prompts[to] || prompts["default"];
    
    // --- LOGIC CHIA VĂN BẢN ĐẦU VÀO ---
    var textChunks = [];
    var CHUNK_SIZE = 5000;
    var MIN_LAST_CHUNK_SIZE = 1000;
    var INPUT_LENGTH_THRESHOLD = 10000;

    if (text.length > INPUT_LENGTH_THRESHOLD) {
        console.log("Phát hiện văn bản dài > " + INPUT_LENGTH_THRESHOLD + " ký tự. Bắt đầu chia nhỏ...");
        var tempChunks = [];
        for (var i = 0; i < text.length; i += CHUNK_SIZE) {
            tempChunks.push(text.substring(i, i + CHUNK_SIZE));
        }
        if (tempChunks.length > 1 && tempChunks[tempChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
            var lastChunk = tempChunks.pop();
            var secondLastChunk = tempChunks.pop();
            tempChunks.push(secondLastChunk + lastChunk);
        }
        textChunks = tempChunks;
        console.log("Đã chia văn bản thành " + textChunks.length + " phần.");
    } else {
        textChunks.push(text);
    }

    // --- DỊCH TỪNG CHUNK, GOM KẾT QUẢ VÀ LỖI ---
    var finalParts = [];
    for (var k = 0; k < textChunks.length; k++) {
        console.log("Đang dịch phần " + (k + 1) + "/" + textChunks.length + "...");
        var chunkResult = translateSingleChunk(textChunks[k], selectedPrompt);
        
        // DÙ THÀNH CÔNG HAY LỖI, ĐỀU THÊM KẾT QUẢ VÀO MẢNG
        if (chunkResult.status === 'success' || chunkResult.status === 'partial_error') {
            finalParts.push(chunkResult.data);
        } else {
            // Đây là nơi chèn thông báo lỗi vào nội dung hiển thị
            var errorString = "\n\n<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " --->>>>>\n" +
                              "Lý do: " + chunkResult.message + "\n" +
                              "<<<<<--- KẾT THÚC LỖI --->>>>>\n\n";
            finalParts.push(errorString);
        }
    }

    console.log("Đã dịch xong tất cả các phần. Đang ghép kết quả...");
    
    // Ghép tất cả các phần (bao gồm cả phần thành công và phần báo lỗi) thành một chuỗi duy nhất
    // Sử dụng \n\n để đảm bảo có khoảng cách giữa các chunk lớn, giúp dễ đọc hơn
    var finalContent = finalParts.join('\n\n');
    
    return Response.success(finalContent);
}