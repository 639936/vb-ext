load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("baidutranslate.js");

var modelsucess = "";
var models = [
    "gemini-2.5-pro"
];
var cacheableModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-preview-05-20"];

function generateFingerprintCacheKey(lines) {
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
    return "vbook_fp_cache_" + keyParts;
}

function callGeminiAPI(text, prompt, apiKey, model) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    modelsucess = model;
    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": 1.0, "topP": 1.0, "topK": 40, "maxOutputTokens": 65536 },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };
    try {
        var response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        var responseText = response.text(); 

        if (response.ok) {
            var result = JSON.parse(responseText);
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0 && result.candidates[0].content.parts[0].text) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }
            if (result.promptFeedback && result.promptFeedback.blockReason) { return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason }; }
            if (result.candidates && result.candidates.length > 0 && (!result.candidates[0].content || !result.candidates[0].content.parts)) { return { status: "blocked", message: "Bị chặn (không có nội dung trả về)." }; }
            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + responseText };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + ". Phản hồi từ server:\n" + responseText };
            // --------------------------
        }
    } catch (e) { return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() }; }
}

function translateChunkWithApiRetry(chunkText, prompt, modelToUse, keysToTry) {
    var keyErrors = [];
    for (var i = 0; i < keysToTry.length; i++) {
        var apiKeyToUse = keysToTry[i];
        console.log("    -> Đang thử với API key: " + apiKeyToUse.substring(0, 4) + "..." + " cho model '" + modelToUse + "'...");
        
        var result = callGeminiAPI(chunkText, prompt, apiKeyToUse, modelToUse);
        
        if (result.status === "success") {
            if ((result.data.length / chunkText.length) < 0.8) {
                console.log("    -> KẾT QUẢ THÀNH CÔNG NHƯNG QUÁ NGẮN. Coi như lỗi...");
                result.status = "short_result_error";
                result.message = "Kết quả trả về ngắn hơn 80% so với văn bản gốc.";
            } else {
                return result; 
            }
        }
        
        keyErrors.push("  + Key " + (i + 1) + " (" + apiKeyToUse + "):\n    " + result.message.replace(/\n/g, '\n    '));
        // ----------------------------------------

        if (i < keysToTry.length - 1) {
            console.log("    -> Thất bại. Đợi một chút trước khi thử lại..."); 
            try {
                sleep(100); 
            } catch (e) {
                console.log("    -> Lỗi khi thực hiện delay: " + e.toString());
            }
        }
    }
    return { 
        status: 'all_keys_failed', 
        message: 'Tất cả API keys đều thất bại cho chunk này.',
        details: keyErrors 
    }; 
}

function execute(text, from, to) {
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    var apiKeyStorageKey = "vbook_last_api_key_index";
    var rotatedApiKeys = apiKeys; 
    try {
        if (apiKeys && apiKeys.length > 1) {
            var lastUsedIndex = parseInt(localStorage.getItem(apiKeyStorageKey) || "-1");
            var nextIndex = (lastUsedIndex + 1) % apiKeys.length;
            rotatedApiKeys = apiKeys.slice(nextIndex).concat(apiKeys.slice(0, nextIndex));
            localStorage.setItem(apiKeyStorageKey, nextIndex.toString());
            console.log("Xoay vòng API key. Bắt đầu từ key ở vị trí: " + nextIndex);
        }
    } catch (e) {
        console.log("Lỗi khi xoay vòng API key: " + e.toString());
        rotatedApiKeys = apiKeys;
    }

    if (from === 'vi') {
        models.reverse();
        console.log("Phát hiện from = 'vi'. Đảo ngược thứ tự ưu tiên model: " + JSON.stringify(models));
    }

    var lines = text.split('\n');

    if (to === 'vi_xoacache') {
        console.log("Chế độ xóa cache được kích hoạt.");
        var isChapterContentForDelete = text.length >= 800;
        if (isChapterContentForDelete) {
            var shortLinesCountForDelete = 0;
            if (lines.length > 0) {
                for (var i = 0; i < lines.length; i++) { if (lines[i].length < 25) { shortLinesCountForDelete++; } }
                if ((shortLinesCountForDelete / lines.length) > 0.8) { isChapterContentForDelete = false; }
            }
        }
        if (isChapterContentForDelete) {
            var cacheKeyToDelete = generateFingerprintCacheKey(lines);
            if (localStorage.getItem(cacheKeyToDelete) !== null) {
                localStorage.removeItem(cacheKeyToDelete);
                console.log("Đã xóa cache cho key: " + cacheKeyToDelete);
                return Response.success("Đã xóa cache thành công." + text);
            } else {
                console.log("Không tìm thấy cache để xóa cho key: " + cacheKeyToDelete);
                return Response.success(text); 
            }
        } else {
            console.log("Đây là danh sách chương, không thực hiện xóa cache.");
            return Response.success(text);
        }
    }
    
    var isUsingBaidu = false;
    var lengthThreshold = 1000;   
    var lineLengthThreshold = 25; 
    if (to === 'vi_vietlai') {
        console.log("Áp dụng quy tắc nhận diện danh sách chương đặc biệt cho vi_vietlai.");
        lengthThreshold = 1500;
        lineLengthThreshold = 50;
    }
    if (text.length < lengthThreshold) {
        isUsingBaidu = true;
    } else {
        var shortLinesCount = 0;
        var totalLines = lines.length;
        if (totalLines > 0) {
            for (var i = 0; i < totalLines; i++) {
                if (lines[i].length < lineLengthThreshold) { shortLinesCount++; }
            }
            if ((shortLinesCount / totalLines) > 0.8) {
                isUsingBaidu = true;
            }
        }
    }

    if (to === 'vi_vietlai' && isUsingBaidu) {
        console.log("Phát hiện 'vi_vietlai' cho văn bản ngắn/danh sách chương. Trả về văn bản gốc.");
        return Response.success(text);
    }

    var cacheKey = null;
    var finalContent = "";

    if (!isUsingBaidu) {
        try {
            cacheKey = generateFingerprintCacheKey(lines);
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
        console.log("Phát hiện văn bản ngắn hoặc danh sách chương. Sử dụng Baidu Translate.");
        var baiduFromLang = from;
        var vietnameseToLanguages = ['vi_tieuchuan', 'vi_sac', 'vi_vietlai', 'vi_NameEng'];
        if (from === 'vi' && vietnameseToLanguages.indexOf(to) > -1) {
            baiduFromLang = 'zh';
            console.log("Ghi đè ngôn ngữ nguồn cho Baidu thành 'zh'.");
        }
        const BAIDU_CHUNK_SIZE = 500;
        var baiduTranslatedParts = [];
        var baiduToLang = (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng' || to === 'vi_tieuchuan') ? 'vi' : to;
        var totalChunks = Math.ceil(lines.length / BAIDU_CHUNK_SIZE);
        for (var i = 0; i < lines.length; i += BAIDU_CHUNK_SIZE) {
            console.log("Đang dịch phần " + (i / BAIDU_CHUNK_SIZE + 1) + "/" + totalChunks + " bằng Baidu...");
            var currentChunkLines = lines.slice(i, i + BAIDU_CHUNK_SIZE);
            var chunkText = currentChunkLines.join('\n');
            var translatedChunk = baiduTranslateContent(chunkText, baiduFromLang, baiduToLang, 0); 
            if (translatedChunk === null) {
                console.log("Lỗi khi dịch phần " + (i / BAIDU_CHUNK_SIZE + 1) + " bằng Baidu.");
                return Response.error("Lỗi Baidu Translate. Vui lòng thử lại.");
            }
            baiduTranslatedParts.push(translatedChunk);
        }
        finalContent = baiduTranslatedParts.join('\n');
    } else {
        console.log("Phát hiện nội dung chương. Bắt đầu quy trình Gemini AI Fallback.");
        if (!rotatedApiKeys || rotatedApiKeys.length === 0) { return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 API key."); }
        if (!models || models.length === 0) { return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 model."); }
        
        var selectedPrompt = prompts[to] || prompts["vi"];
        var pinyinLanguages = ['vi_tieuchuan', 'vi_sac', 'vi_NameEng'];
        var isPinyinRoute = pinyinLanguages.indexOf(to) > -1;
        var translationSuccessful = false;
        var errorLog = {};

        for (var m = 0; m < models.length; m++) {
            var modelToUse = models[m];
            console.log("----- Bắt đầu thử dịch TOÀN BỘ VĂN BẢN với Model: " + modelToUse + " -----");

            var CHUNK_SIZE = 5000;
            var MIN_LAST_CHUNK_SIZE = 1000;
            if (modelToUse === "gemini-2.5-flash" || modelToUse === "gemini-2.5-flash-preview-05-20" || modelToUse === "gemini-2.5-pro") {
                CHUNK_SIZE = 4000;
                MIN_LAST_CHUNK_SIZE = 1000;
            }
            console.log("Sử dụng CHUNK_SIZE: " + CHUNK_SIZE);

            var textChunks = [];
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
            }
            console.log("Văn bản được chia thành " + textChunks.length + " phần cho model này.");

            var finalParts = [];
            var currentModelFailed = false;
            for (var k = 0; k < textChunks.length; k++) {
                console.log("  Dịch phần " + (k + 1) + "/" + textChunks.length + " với model '" + modelToUse + "'...");
                var chunkToSend = textChunks[k];
                if (isPinyinRoute) {
                    try {
                        load("phienam.js");
                        chunkToSend = phienAmToHanViet(chunkToSend);
                    } catch (e) { return Response.error("LỖI: Không thể tải file phienam.js."); }
                }
                
                var chunkResult = translateChunkWithApiRetry(chunkToSend, selectedPrompt, modelToUse, rotatedApiKeys);
                
                if (chunkResult.status === 'success') {
                    finalParts.push(chunkResult.data);
                } else {
                    console.log("Lỗi khi dịch phần " + (k + 1) + " với model '" + modelToUse + "'. Lý do: " + chunkResult.message);
                    errorLog[modelToUse] = chunkResult.details;
                    currentModelFailed = true;
                    break; 
                }
            }

            if (!currentModelFailed) {
                console.log("----- Dịch TOÀN BỘ VĂN BẢN thành công với Model: " + modelToUse + " -----");
                finalContent = modelsucess + " . " + finalParts.join('\n\n');
                translationSuccessful = true;
                break; 
            }
        } 

        if (!translationSuccessful) {
            var errorString = "<<<<<--- LỖI DỊCH (ĐÃ THỬ HẾT CÁC MODEL) --->>>>>\n";
            for (var modelName in errorLog) {
                errorString += "\n--- Chi tiết lỗi với Model: " + modelName + " ---\n";
                errorString += errorLog[modelName].join("\n");
                errorString += "\n";
            }
            errorString += "\n<<<<<--- KẾT THÚC BÁO CÁO LỖI --->>>>>";
            //finalContent = errorString;
            console.log(errorString);
            return Response.error
        }
    }

    if (cacheKey && finalContent && !finalContent.includes("LỖI DỊCH")) {
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
    
    return Response.success(finalContent.trim());
}