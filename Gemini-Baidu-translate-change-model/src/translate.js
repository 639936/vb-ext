load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("baidutranslate.js");
var modelsucess = "";
var models = [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
];

// --- THAY ĐỔI 1: ĐỊNH NGHĨA CÁC MODEL ĐƯỢC PHÉP LƯU VÀO CACHE ---
var cacheableModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
// --------------------------------------------------------------------

function callGeminiAPI(text, prompt, apiKey, model) {
    if (!apiKey) {
        return { status: "error", message: "API Key không hợp lệ." };
    }
    if (!text || text.trim() === '') {
        return { status: "success", data: "" };
    }
    modelsucess = model;

    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 1.0, "topP": 1.0, "topK": 40, "maxOutputTokens": 65536
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
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0 && result.candidates[0].content.parts[0].text) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }
            if (result.promptFeedback && result.promptFeedback.blockReason) { return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason }; }
            if (result.candidates && result.candidates.length > 0 && (!result.candidates[0].content || !result.candidates[0].content.parts)) { return { status: "blocked", message: "Bị chặn (không có nội dung trả về)." }; }
            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + response.text() };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + " (response not ok model '" + model + "' đã thử cuối cùng)." };
        }
    } catch (e) {
        return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() };
    }
}

function translateSingleChunkWithRetry(chunkText, prompt) {
    var lastError = null;

    for (var m = 0; m < models.length; m++) {
        var modelToUse = models[m];
        console.log("----- Bắt đầu thử với Model: " + modelToUse + " -----");

        for (var i = 0; i < apiKeys.length; i++) {
            var apiKeyToUse = apiKeys[i];
            console.log("Đang thử Model '" + modelToUse + "' với Key Index " + i);

            var result = callGeminiAPI(chunkText, prompt, apiKeyToUse, modelToUse);
            
            if (result.status === "success") {
                console.log("Thành công với Model '" + modelToUse + "', Key Index " + i);
                return result; 
            }
            
            lastError = result; 
            console.log("Lỗi với Model '" + modelToUse + "', Key Index " + i + ": " + result.message + ". Đang thử key tiếp theo...");
        }

        console.log("----- Tất cả các key đều thất bại cho Model: " + modelToUse + ". Chuyển sang model tiếp theo (nếu có). -----");
    }

    console.log("Tất cả API keys và Models đều không thành công cho chunk này.");
    return lastError;
}

function execute(text, from, to) { 
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    var lines = text.split('\n');
    var isUsingBaidu = false;

    if (text.length < 800) {
        isUsingBaidu = true;
    } else {
        var shortLinesCount = 0;
        var totalLines = lines.length;
        if (totalLines > 0) {
            for (var i = 0; i < totalLines; i++) {
                if (lines[i].length < 25) {
                    shortLinesCount++;
                }
            }
            if ((shortLinesCount / totalLines) > 0.8) {
                isUsingBaidu = true;
            }
        }
    }

    var cacheKey = null;
    var finalContent = "";

    if (!isUsingBaidu) {
        try {
            var keyParts = "";
            var linesForId = lines.slice(0, 5);
            for (var i = 0; i < linesForId.length; i++) {
                var line = linesForId[i].trim();
                if (line.length >= 6) {
                    keyParts += line.substring(0, 3) + line.slice(-3);
                } else {
                    keyParts += line;
                }
            }
            cacheKey = "vbook_fp_cache_" + keyParts;
            var cachedTranslation = localStorage.getItem(cacheKey);
            if (cachedTranslation) {
                console.log("Tìm thấy cache theo dấu vân tay. Key: " + cacheKey);
                return Response.success(cachedTranslation);
            }
            console.log("Không có cache cho dấu vân tay này. Bắt đầu dịch mới. Key: " + cacheKey);
        } catch (e) {
            console.log("Lỗi khi tạo/đọc cache key: " + e.toString());
            cacheKey = null;
        }
    }

    if (isUsingBaidu) {
        console.log("Phát hiện văn bản ngắn hoặc danh sách chương. Sử dụng Baidu Translate theo từng phần.");
        const BAIDU_CHUNK_SIZE = 500;
        var baiduTranslatedParts = [];
        var baiduToLang = (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') ? 'vi' : to;
        var totalChunks = Math.ceil(lines.length / BAIDU_CHUNK_SIZE);
        for (var i = 0; i < lines.length; i += BAIDU_CHUNK_SIZE) {
            console.log("Đang dịch phần " + (i / BAIDU_CHUNK_SIZE + 1) + "/" + totalChunks + " bằng Baidu...");
            var currentChunkLines = lines.slice(i, i + BAIDU_CHUNK_SIZE);
            var chunkText = currentChunkLines.join('\n');
            var translatedChunk = baiduTranslateContent(chunkText, from, baiduToLang, 0);
            if (translatedChunk === null) {
                console.log("Lỗi khi dịch phần " + (i / BAIDU_CHUNK_SIZE + 1) + " bằng Baidu.");
                return Response.error("Lỗi Baidu Translate. Vui lòng thử lại.");
            }
            baiduTranslatedParts.push(translatedChunk);
        }
        finalContent = baiduTranslatedParts.join('\n');
    } else {
        console.log("Phát hiện nội dung chương. Bắt đầu quy trình Gemini AI.");
        if (!apiKeys || apiKeys.length === 0) { return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 API key trong file apikey.js."); }
        if (!models || models.length === 0) { return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 model trong file translate.js."); }
        
        var selectedPrompt = prompts[to] || prompts["vi"];
        var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');
        var textChunks = [];
        const CHUNK_SIZE = 2500;
        const MIN_LAST_CHUNK_SIZE = 1000;
        var currentChunk = "";
        for (var i = 0; i < lines.length; i++) {
            var paragraph = lines[i];
            if (currentChunk.length === 0 && paragraph.length >= CHUNK_SIZE) { textChunks.push(paragraph); continue; }
            if (currentChunk.length + paragraph.length + 1 > CHUNK_SIZE && currentChunk.length > 0) { textChunks.push(currentChunk); currentChunk = paragraph; } 
            else { currentChunk = currentChunk ? (currentChunk + "\n" + paragraph) : paragraph; }
        }
        if (currentChunk.length > 0) { textChunks.push(currentChunk); }
        if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
            var lastChunk = textChunks.pop();
            var secondLastChunk = textChunks.pop();
            textChunks.push(secondLastChunk + "\n" + lastChunk);
            console.log("Chunk cuối quá nhỏ, đã gộp vào chunk trước đó.");
        }
        
        console.log("Văn bản đã được chia thành " + textChunks.length + " phần.");
        var finalParts = [];
        for (var k = 0; k < textChunks.length; k++) {
            console.log("Bắt đầu xử lý phần " + (k + 1) + "/" + textChunks.length + "...");
            var chunkToSend = textChunks[k];
            if (isPinyinRoute) {
                try {
                    load("phienam.js");
                    chunkToSend = phienAmToHanViet(chunkToSend);
                } catch (e) { return Response.error("LỖI: Không thể tải hoặc thực thi file phienam.js."); }
            }
            var chunkResult = translateSingleChunkWithRetry(chunkToSend, selectedPrompt);
            if (chunkResult.status === 'success' || (chunkResult.status === 'blocked' && chunkResult.data)) {
                finalParts.push(chunkResult.data);
            } else {
                var errorString = "<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " (ĐÃ THỬ HẾT CÁC KEY VÀ MODEL) --->>>>>\n" + "Lý do: " + chunkResult.message + "\n" + "<<<<<--- KẾT THÚC LỖI --->>>>>";
                finalParts.push(errorString);
            }
        }
        finalContent = modelsucess + ". " + finalParts.join('\n\n');
    }

    // --- THAY ĐỔI 2: THÊM ĐIỀU KIỆN KIỂM TRA MODEL TRƯỚC KHI LƯU ---
    if (cacheKey && finalContent && !finalContent.includes("LỖI DỊCH PHẦN")) {
        // Kiểm tra xem model thành công có nằm trong danh sách cacheableModels không
        // Môi trường Rhino cũ có thể không có .includes(), dùng .indexOf() sẽ an toàn hơn
        if (cacheableModels.indexOf(modelsucess) > -1) {
            try {
                localStorage.setItem(cacheKey, finalContent.trim());
                console.log("Đã lưu kết quả dịch từ model '" + modelsucess + "' vào cache.");
            } catch (e) {
                console.log("Lỗi khi lưu vào cache: " + e.toString());
            }
        } else {
            console.log("Bỏ qua lưu cache. Model '" + modelsucess + "' không nằm trong danh sách được phép cache.");
        }
    }
    // --------------------------------------------------------------------
    
    return Response.success(finalContent.trim());
}