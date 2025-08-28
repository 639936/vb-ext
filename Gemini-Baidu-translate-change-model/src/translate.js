
load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("baidutranslate.js");

var modelsucess = "";
var models = [
    "gemini-2.5-pro",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
];
var cacheableModels = ["gemini-2.5-pro", "gemini-2.5-flash-preview-05-20"];

// --- CÁC HÀM TIỆN ÍCH (KHÔNG THAY ĐỔI) ---

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

function manageCacheAndSave(cacheKey, contentToSave) {
    const MAX_CACHE_SIZE = 50;
    const CACHE_MANIFEST_KEY = "vbook_cache_manifest";
    try {
        var manifest = [];
        var rawManifest = localStorage.getItem(CACHE_MANIFEST_KEY);
        if (rawManifest) {
            manifest = JSON.parse(rawManifest);
        }
        while (manifest.length >= MAX_CACHE_SIZE) {
            manifest.sort(function(a, b) { return a.ts - b.ts; });
            var oldestItem = manifest.shift();
            if (oldestItem) {
                localStorage.removeItem(oldestItem.key);
            }
        }
        manifest.push({ key: cacheKey, ts: Date.now() });
        localStorage.setItem(CACHE_MANIFEST_KEY, JSON.stringify(manifest));
        localStorage.setItem(cacheKey, contentToSave);
    } catch (e) {
        try {
            localStorage.setItem(cacheKey, contentToSave);
        } catch (e2) {}
    }
}

function callGeminiAPI(text, prompt, apiKey, model) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    modelsucess = model;
    var full_prompt = prompt + "\n\nDưới đây là văn bản cần xử lý\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "role": "user", "parts": [{ "text": full_prompt }] }],
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
        }
    } catch (e) { return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() }; }
}


// --- CÁC HÀM CẢI TIẾN VÀ TÁI CẤU TRÚC ---

function translateChunkWithApiRetry(chunkText, prompt, modelToUse, keysToTry) {
    var keyErrors = [];
    var failedKeys = [];
    for (var i = 0; i < keysToTry.length; i++) {
        var apiKeyToUse = keysToTry[i];
        var result = callGeminiAPI(chunkText, prompt, apiKeyToUse, modelToUse);
        if (result.status === "success") {
            if ((result.data.length / chunkText.length) < 0.8) {
                result.status = "short_result_error";
                result.message = "Kết quả trả về ngắn hơn 80% so với văn bản gốc.";
                keyErrors.push("  + Key " + (i + 1) + " (" + apiKeyToUse.substring(0, 5) + "...):\n    " + result.message.replace(/\n/g, '\n    '));
            } else {
                return result;
            }
        } else if (result.status === "key_error") {
            failedKeys.push(apiKeyToUse);
            keyErrors.push("  + Key " + (i + 1) + " (" + apiKeyToUse.substring(0, 5) + "...):\n    " + result.message.replace(/\n/g, '\n    '));
        } else {
            keyErrors.push("  + Key " + (i + 1) + " (" + apiKeyToUse.substring(0, 5) + "...):\n    " + result.message.replace(/\n/g, '\n    '));
            return { status: result.status, message: result.message, details: keyErrors, failedKeys: failedKeys };
        }
        if (i < keysToTry.length - 1) {
            try { sleep(100); } catch (e) {}
        }
    }
    return { status: 'all_keys_failed', message: 'Tất cả API keys đều thất bại.', details: keyErrors, failedKeys: failedKeys }; 
}

function handleBaiduTranslation(lines, to) {
    var baiduFromLang = "auto";
    var baiduToLang = (['vi', 'zh', 'en'].indexOf(to) > -1) ? to : 'vi';
    const BAIDU_CHUNK_SIZE = 500;
    var baiduTranslatedParts = [];
    for (var i = 0; i < lines.length; i += BAIDU_CHUNK_SIZE) {
        var currentChunkLines = lines.slice(i, i + BAIDU_CHUNK_SIZE);
        var chunkText = currentChunkLines.join('\n');
        var translatedChunk = baiduTranslateContent(chunkText, baiduFromLang, baiduToLang, 0); 
        if (translatedChunk === null) {
            return { success: false, content: "Lỗi Baidu Translate. Vui lòng thử lại." };
        }
        baiduTranslatedParts.push(translatedChunk);
    }
    return { success: true, content: baiduTranslatedParts.join('\n') };
}

function handleGeminiTranslation(lines, from, to, rotatedApiKeys) {
    if (!rotatedApiKeys || rotatedApiKeys.length === 0) { return { success: false, content: "LỖI: Vui lòng cấu hình ít nhất 1 API key." }; }
    if (!models || models.length === 0) { return { success: false, content: "LỖI: Vui lòng cấu hình ít nhất 1 model." }; }
    
    var modelsToAttempt = [];
    var originalTo = to;
    if (from.startsWith("gen_")) {
        modelsToAttempt.push(from.substring(4));
    } else {
        if (from === 'en') { to = 'vi'; } 
        else if (from !== 'zh') { from = 'zh'; }
        modelsToAttempt = models;
    }

    var selectedPrompt = prompts[originalTo] || prompts["vi"];
    var isPinyinRoute = ['vi_tieuchuan', 'vi_sac', 'vi_NameEng', 'vi_layname'].indexOf(originalTo) > -1;
    var errorLog = {};
    var activeApiKeys = rotatedApiKeys.slice();

    for (var m = 0; m < modelsToAttempt.length; m++) {
        var modelToUse = modelsToAttempt[m];
        
        // [CẢI TIẾN] Khai báo CHUNK_SIZE rõ ràng, dễ tùy chỉnh
        var CHUNK_SIZE;
        var MIN_LAST_CHUNK_SIZE;

        if (modelToUse === "gemini-2.5-pro" || modelToUse === "gemini-2.5-flash-preview-05-20" || modelToUse === "gemini-2.5-flash") {
            CHUNK_SIZE = 2000;
            MIN_LAST_CHUNK_SIZE = 600;
        } else {
            // Giá trị mặc định cho các model khác (nếu có)
            CHUNK_SIZE = 4000;
            MIN_LAST_CHUNK_SIZE = 1000;
        }
        // Bạn có thể thêm các điều kiện khác ở đây, ví dụ:
        // else if (modelToUse === "some-future-model") {
        //     CHUNK_SIZE = 3000;
        //     MIN_LAST_CHUNK_SIZE = 800;
        // }

        var textChunks = [];
        var currentChunk = "";
        for (var i = 0; i < lines.length; i++) {
            var paragraph = lines[i];
            if ((currentChunk.length + paragraph.length + 1 > CHUNK_SIZE) && currentChunk.length > 0) {
                textChunks.push(currentChunk);
                currentChunk = paragraph;
            } else {
                currentChunk = currentChunk ? (currentChunk + "\n" + paragraph) : paragraph;
            }
        }
        if (currentChunk.length > 0) textChunks.push(currentChunk);
        if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
            var lastChunk = textChunks.pop();
            textChunks.push(textChunks.pop() + "\n" + lastChunk);
        }

        var finalParts = [];
        var currentModelFailed = false;
        for (var k = 0; k < textChunks.length; k++) {
            var chunkToSend = textChunks[k];
            if (isPinyinRoute) {
                try {
                    load("phienam.js");
                    chunkToSend = phienAmToHanViet(chunkToSend);
                } catch (e) { return { success: false, content: "LỖI: Không thể tải file phienam.js." }; }
            }
            if (activeApiKeys.length === 0) {
                currentModelFailed = true;
                errorLog[modelToUse] = ["Không còn API key hợp lệ để thử."];
                break;
            }
            var chunkResult = translateChunkWithApiRetry(chunkToSend, selectedPrompt, modelToUse, activeApiKeys);
            if (chunkResult.status === 'success') {
                finalParts.push(chunkResult.data);
            } else {
                errorLog[modelToUse] = chunkResult.details;
                currentModelFailed = true;
                if (chunkResult.failedKeys && chunkResult.failedKeys.length > 0) {
                    activeApiKeys = activeApiKeys.filter(function(key) { return chunkResult.failedKeys.indexOf(key) === -1; });
                }
                break; 
            }
        }

        if (!currentModelFailed) {
            var finalContent = modelsucess + " . " + finalParts.join('\n\n');
            return { success: true, content: finalContent, modelUsed: modelsucess };
        }
    } 

    var errorString = "<<<<<--- LỖI DỊCH (ĐÃ THỬ HẾT CÁC MODEL) --->>>>>\n";
    for (var modelName in errorLog) {
        errorString += "\n--- Chi tiết lỗi với Model: " + modelName + " ---\n";
        if (errorLog[modelName]) errorString += errorLog[modelName].join("\n");
        errorString += "\n";
    }
    errorString += "\n<<<<<--- KẾT THÚC BÁO CÁO LỖI --->>>>>";
    return { success: false, content: errorString };
}

function determineTranslationStrategy(text, lines, from, to) {
    // [CẢI TIẾN] Khai báo các ngưỡng rõ ràng ở đầu hàm để dễ tùy chỉnh
    var lengthThreshold = 1000;
    var lineLengthThreshold = 25;
    var shortLineRatio = 0.8;

    // Tùy chỉnh ngưỡng cho 'vi_vietlai'
    if (to === 'vi_vietlai') {
        lengthThreshold = 1500;
        lineLengthThreshold = 50;
    }

    var isShortContent = text.length < lengthThreshold;
    var isChapterList = false;
    
    var totalLines = lines.length;
    if (totalLines > 0) {
        var shortLinesCount = 0;
        for (var i = 0; i < totalLines; i++) {
            if (lines[i].length < lineLengthThreshold) {
                shortLinesCount++;
            }
        }
        if ((shortLinesCount / totalLines) > shortLineRatio) {
            isChapterList = true;
        }
    }

    var useBaidu = isShortContent || isChapterList;

    // Logic đặc biệt cho vi_vietlai: không dịch text ngắn/danh sách chương
    if (to === 'vi_vietlai' && useBaidu) {
        return { strategy: 'return_original' };
    }

    // Logic đặc biệt: Ưu tiên Gemini cho text ngắn nếu là cặp ngôn ngữ phổ thông
    var isShortTextForcedGemini = (['zh', 'en', 'vi'].indexOf(from) > -1) && (['zh', 'en', 'vi'].indexOf(to) > -1);
    if (useBaidu && !isChapterList && isShortTextForcedGemini) {
        return { strategy: 'gemini' };
    }
    
    if (useBaidu) {
        return { strategy: 'baidu' };
    }

    return { strategy: 'gemini' };
}

function execute(text, from, to) {
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    var lines = text.split('\n');

    var validToList = [
        'vi_xoacache', 'vi', 'vi_tieuchuan', 'vi_sac', 
        'vi_NameEng', 'vi_vietlai', 'vi_layname', 'en', 'zh'
    ];
    if (validToList.indexOf(to) === -1) {
        to = 'vi';
    }

    if (to === 'vi_xoacache') {
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
                const CACHE_MANIFEST_KEY = "vbook_cache_manifest";
                try {
                    var rawManifest = localStorage.getItem(CACHE_MANIFEST_KEY);
                    if (rawManifest) {
                        var manifest = JSON.parse(rawManifest);
                        var updatedManifest = manifest.filter(function(item) { return item.key !== cacheKeyToDelete; });
                        localStorage.setItem(CACHE_MANIFEST_KEY, JSON.stringify(updatedManifest));
                    }
                } catch (e) {}
                return Response.success("Đã xóa cache thành công." + text);
            } else { return Response.success(text); }
        } else { return Response.success(text); }
    }

    var rotatedApiKeys = apiKeys; 
    try {
        if (apiKeys && apiKeys.length > 1) {
            var apiKeyStorageKey = "vbook_last_api_key_index";
            var lastUsedIndex = parseInt(localStorage.getItem(apiKeyStorageKey) || "-1");
            var nextIndex = (lastUsedIndex + 1) % apiKeys.length;
            rotatedApiKeys = apiKeys.slice(nextIndex).concat(apiKeys.slice(0, nextIndex));
            localStorage.setItem(apiKeyStorageKey, nextIndex.toString());
        }
    } catch (e) {}
    
    var strategyResult = determineTranslationStrategy(text, lines, from, to);
    var finalResult;

    if (strategyResult.strategy === 'return_original') {
        return Response.success(text);
    } 
    else if (strategyResult.strategy === 'baidu') {
        finalResult = handleBaiduTranslation(lines, to);
    } 
    else { // 'gemini'
        var cacheKey = null;
        try {
            cacheKey = generateFingerprintCacheKey(lines);
            var cachedTranslation = localStorage.getItem(cacheKey);
            if (cachedTranslation) {
                return Response.success(cachedTranslation);
            }
        } catch (e) {}

        finalResult = handleGeminiTranslation(lines, from, to, rotatedApiKeys);

        if (finalResult.success && cacheKey && !finalResult.content.includes("LỖI DỊCH") && to !== 'vi_layname') {
            if (finalResult.modelUsed && cacheableModels.indexOf(finalResult.modelUsed) > -1) {
                manageCacheAndSave(cacheKey, finalResult.content.trim());
            }
        }
    }

    if (finalResult.success) {
        return Response.success(finalResult.content.trim());
    } else {
        return Response.error(finalResult.content);
    }
}