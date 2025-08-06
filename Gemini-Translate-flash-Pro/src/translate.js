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
        return { status: "success", data: "" }; // Trả về chuỗi rỗng thay vì ? để dễ ghép nối
    }

    var full_prompt = prompt + "\n\n---\n\n" + text;
    // Đã cập nhật để dùng model flash mới nhất, có thể thay đổi nếu cần
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

// Hàm dịch từng dòng, được gọi KHI một chunk bị chặn an toàn
function translateInChunksByLine(text, prompt) {
    console.log("Kích hoạt chế độ dịch từng dòng do nội dung bị chặn...");
    var lines = text.split('\n');
    var translatedLines = [];

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
                console.log("Một dòng bị chặn, thay thế bằng '...'.");
                break; 
            } else if (result.status === "key_error") {
                console.log("Key " + currentKeyIndex + " lỗi, đang thử key tiếp theo...");
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            } else {
                 translatedLines.push("...");
                 lineTranslated = true;
                 console.log("Lỗi không xác định khi dịch dòng: " + result.message);
                 break;
            }
        }
         if (!lineTranslated) {
            translatedLines.push("...");
        }
    }
    return { status: "success", data: translatedLines.join('\n') };
}

// Hàm dịch một chunk văn bản duy nhất (có xoay vòng key và xử lý lỗi)
function translateSingleChunk(chunkText, prompt) {
    for (var i = 0; i < apiKeys.length; i++) {
        var key = apiKeys[currentKeyIndex];
        var result = callGeminiAPI(chunkText, prompt, key);

        if (result.status === "success") {
            return result; // Trả về { status: 'success', data: '...' }
        }
        
        if (result.status === "blocked") {
            // Nếu cả chunk bị chặn, thử dịch chunk đó theo từng dòng
            return translateInChunksByLine(chunkText, prompt);
        }

        if (result.status === "key_error") {
            console.log("Key " + currentKeyIndex + " có thể đã lỗi. Chuyển key.");
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        } else {
            return { status: "error", message: "Lỗi không xác định từ API: " + result.message };
        }
    }
    // Trả về lỗi nếu tất cả các key đều không hoạt động cho chunk này
    return { status: "error", message: "Tất cả các API key đều không hoạt động cho chunk này." };
}

// Hàm thực thi chính (đóng vai trò quản lý)
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

        // Xử lý trường hợp chunk cuối quá nhỏ
        if (tempChunks.length > 1 && tempChunks[tempChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
            console.log("Chunk cuối quá nhỏ, gộp vào chunk trước đó.");
            var lastChunk = tempChunks.pop();
            var secondLastChunk = tempChunks.pop();
            tempChunks.push(secondLastChunk + lastChunk);
        }
        textChunks = tempChunks;
        console.log("Đã chia văn bản thành " + textChunks.length + " phần.");
    } else {
        // Nếu văn bản không quá dài, coi nó là một chunk duy nhất
        textChunks.push(text);
    }

    // --- DỊCH TỪNG CHUNK VÀ GHÉP KẾT QUẢ ---
    var finalTranslatedParts = [];
    for (var k = 0; k < textChunks.length; k++) {
        console.log("Đang dịch phần " + (k + 1) + "/" + textChunks.length + "...");
        var chunkResult = translateSingleChunk(textChunks[k], selectedPrompt);
        
        if (chunkResult.status === 'success') {
            finalTranslatedParts.push(chunkResult.data);
        } else {
            // Nếu một chunk bị lỗi không thể phục hồi, trả về lỗi ngay lập- tức
            return Response.error("Lỗi khi dịch phần " + (k + 1) + ": " + chunkResult.message);
        }
    }

    console.log("Đã dịch xong tất cả các phần. Đang ghép kết quả...");
    // Ghép các phần đã dịch, dùng hai lần xuống dòng để tạo khoảng cách rõ ràng giữa các chunk lớn
    return Response.success(finalTranslatedParts.join('\n\n'));
}