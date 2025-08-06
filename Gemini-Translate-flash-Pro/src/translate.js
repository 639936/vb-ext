load("language_list.js"); 
load("apikey.js");
load("prompt.js");

var currentKeyIndex = 0;

// Hàm gọi API Gemini chính, không thay đổi
function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": 0.85, "topP": 0.9, "maxOutputTokens": 65536 },
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

// Hàm dịch từng dòng
function translateInChunksByLine(text, prompt) {
    var lines = text.split('\n');
    var translatedLines = [];
    var errorOccurred = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.trim() === '') { translatedLines.push(''); continue; }
        var lineTranslated = false;
        for (var j = 0; j < apiKeys.length; j++) {
            var key = apiKeys[currentKeyIndex];
            var result = callGeminiAPI(line, prompt, key);
            if (result.status === "success") { translatedLines.push(result.data); lineTranslated = true; break; }
            if (result.status === "blocked") { translatedLines.push("..."); lineTranslated = true; break; }
            if (result.status === "key_error") { currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; } 
            else { translatedLines.push("[LỖI DỊCH DÒNG: " + result.message + "]"); lineTranslated = true; errorOccurred = true; break; }
        }
        if (!lineTranslated) { translatedLines.push("[LỖI: TẤT CẢ API KEY ĐỀU KHÔNG HOẠT ĐỘNG]"); errorOccurred = true; }
    }
    if (errorOccurred) { return { status: "partial_error", data: translatedLines.join('\n') }; }
    return { status: "success", data: translatedLines.join('\n') };
}

// Hàm dịch một chunk văn bản duy nhất
function translateSingleChunk(chunkText, prompt, isPinyinRoute) {
    for (var i = 0; i < apiKeys.length; i++) {
        var key = apiKeys[currentKeyIndex];
        var result = callGeminiAPI(chunkText, prompt, key);
        if (result.status === "success") { return result; }
        if (result.status === "blocked") {
            if (isPinyinRoute) {
                return result; // Lộ trình phiên âm nếu bị chặn -> báo lỗi, không thử lại
            } else {
                return translateInChunksByLine(chunkText, prompt); // Lộ trình thường -> thử lại từng dòng
            }
        }
        if (result.status === "key_error") {
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        } else {
            return result;
        }
    }
    return { status: "error", message: "Tất cả các API key đều không hoạt động." };
}

// Hàm thực thi chính
function execute(text, from, to) {
    if (!apiKeys || apiKeys.length === 0 || (apiKeys[0].indexOf("YOUR_GEMINI_API_KEY") !== -1)) {
        return Response.error("Vui lòng cấu hình API key trong file apikey.js.");
    }
    if (!text || text.trim() === '') { return Response.success("?"); }

    var selectedPrompt = prompts[to] || prompts["default"];
    var processedText;
    var isPinyinRoute = false;

    // --- BƯỚC 1: TIỀN XỬ LÝ (QUYẾT ĐỊNH PHIÊN ÂM) ---
    if (to === 'vi' || to === 'vi_sac') {
        isPinyinRoute = true;
        try {
            load("phienam.js");
            processedText = phienAmToHanViet(text);
        } catch (e) {
            return Response.error("LỖI: Không thể tải file phienam.js.");
        }
    } else {
        isPinyinRoute = false;
        processedText = text;
    }

    // --- BƯỚC 2: KIỂM TRA ĐỘ DÀI VÀ CHỌN LỘ TRÌNH ---
    var finalContent = "";

    if (processedText.length < 200) {
        // --- LỘ TRÌNH NHANH: CHO VĂN BẢN NGẮN ---
        console.log("Phát hiện văn bản ngắn (< 200 ký tự). Sử dụng prompt đơn giản.");
        var languageMap = { 'zh': 'Chinese', 'en': 'English', 'vi': 'Vietnamese', 'vi_vietlai': 'Vietnamese', 'vi_sac': 'Vietnamese' };
        var toLang = languageMap[to] || to;
        // Prompt này không yêu cầu AI phải "dịch từ" ngôn ngữ nào, vì đầu vào có thể là Hán Việt hoặc chữ Hán gốc
        var simplePrompt = "Translate the following text into " + toLang + " in an easy-to-understand and accurate manner. [FORMATTING CONSTRAINT]: You MUST return only the translated text. DO NOT include explanations, summaries, or markdown formatting (like ```).";

        // Dùng `translateSingleChunk` vẫn tốt hơn vì nó có thể xoay vòng key nếu cần
        var result = translateSingleChunk(processedText, simplePrompt, isPinyinRoute); 

        if (result.status === 'success' || result.status === 'partial_error') {
            finalContent = result.data;
        } else {
            finalContent = "LỖI DỊCH NHANH: " + result.message;
        }

    } else {
        // --- LỘ TRÌNH ĐẦY ĐỦ: CHO VĂN BẢN DÀI ---
        var textChunks = [];
        var CHUNK_SIZE = 5000;
        var MIN_LAST_CHUNK_SIZE = 1000;
        var INPUT_LENGTH_THRESHOLD = 10000;

        if (processedText.length > INPUT_LENGTH_THRESHOLD) {
            var tempChunks = [];
            for (var i = 0; i < processedText.length; i += CHUNK_SIZE) { tempChunks.push(processedText.substring(i, i + CHUNK_SIZE)); }
            if (tempChunks.length > 1 && tempChunks[tempChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
                var lastChunk = tempChunks.pop();
                var secondLastChunk = tempChunks.pop();
                tempChunks.push(secondLastChunk + lastChunk);
            }
            textChunks = tempChunks;
        } else {
            textChunks.push(processedText);
        }

        var finalParts = [];
        for (var k = 0; k < textChunks.length; k++) {
            var chunkResult = translateSingleChunk(textChunks[k], selectedPrompt, isPinyinRoute);
            if (chunkResult.status === 'success' || chunkResult.status === 'partial_error') {
                finalParts.push(chunkResult.data);
            } else {
                var errorString = "\n\n<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " --->>>>>\n" +
                                  "Lý do: " + chunkResult.message + "\n" +
                                  "<<<<<--- KẾT THÚC LỖI --->>>>>\n\n";
                finalParts.push(errorString);
            }
        }
        finalContent = finalParts.join('\n\n');
    }

    // --- BƯỚC 3: CHUẨN HÓA KẾT QUẢ ĐỂ HIỂN THỊ ---
    var lines = finalContent.split('\n');
    var finalOutput = "";
    for (var i = 0; i < lines.length; i++) {
        finalOutput += lines[i] + "\n";
    }

    return Response.success(finalOutput.trim());
}