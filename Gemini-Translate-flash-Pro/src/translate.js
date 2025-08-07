load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("baidutranslate.js");

var currentKeyIndex = 0;

function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": 0.75, "topP": 0.95, "maxOutputTokens": 65536 },
        "safetySettings": [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ]
    };
    try {
        var response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (response.ok) {
            var result = JSON.parse(response.text());
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) { return { status: "success", data: result.candidates[0].content.parts[0].text.trim() }; }
            if (result.promptFeedback && result.promptFeedback.blockReason) { return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };}
            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + response.text() };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + " (API key có thể sai hoặc hết hạn mức)." };
        }
    } catch (e) {
        return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() };
    }
}
function translateInChunksByLine(text, prompt) {
    var lines = text.split('\n'); var translatedLines = []; var errorOccurred = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i]; if (line.trim() === '') { translatedLines.push(''); continue; }
        var lineTranslated = false;
        for (var j = 0; j < apiKeys.length; j++) {
            var key = apiKeys[currentKeyIndex]; var result = callGeminiAPI(line, prompt, key);
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
function translateSingleChunk(chunkText, prompt, isPinyinRoute) {
    for (var i = 0; i < apiKeys.length; i++) {
        var key = apiKeys[currentKeyIndex]; var result = callGeminiAPI(chunkText, prompt, key);
        if (result.status === "success") { return result; }
        if (result.status === "blocked") {
            if (isPinyinRoute) { return result; } 
            else { return translateInChunksByLine(chunkText, prompt); }
        }
        if (result.status === "key_error") { currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; } 
        else { return result; }
    }
    return { status: "error", message: "Tất cả các API key đều không hoạt động." };
}

// --- HÀM THỰC THI CHÍNH (HYBRID) ---
function execute(text, from, to) {
    if (!text || text.trim() === '') { return Response.success("?"); }

    // --- CỔNG KIỂM SOÁT ĐẦU TIÊN: KIỂM TRA ĐỘ DÀI ---
    if (text.length < 500) {
        // --- LỘ TRÌNH 1 (NHANH & GỌN): DÙNG BAIDU TRANSLATE ---
        console.log("Phát hiện văn bản ngắn (< 500 ký tự). Sử dụng Baidu Translate.");
        var baiduToLang = to;
        if (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') {
            baiduToLang = 'vi';
        }
        
        // --- THAY ĐỔI CÁCH XỬ LÝ KẾT QUẢ TỪ BAIDU ---
        // 1. Nhận chuỗi văn bản thô hoặc null
        var rawTranslatedText = baiduTranslateContent(text, from, baiduToLang, 0); 

        // 2. Kiểm tra kết quả
        if (rawTranslatedText !== null) {
            // 3. Nếu thành công, áp dụng logic định dạng hiển thị TẠI ĐÂY
            var lines = rawTranslatedText.split('\n');
            var finalOutput = "";
            for (var i = 0; i < lines.length; i++) {
                finalOutput += lines[i] + "\n";
            }
            return Response.success(finalOutput.trim());
        } else {
            // 4. Nếu thất bại (null), trả về lỗi
            return Response.error("Lỗi khi dịch bằng Baidu Translate (sau nhiều lần thử lại).");
        }
    }
    
    // --- LỘ TRÌNH 2 (CHẤT LƯỢNG CAO): DÙNG GEMINI AI ---
    console.log("Văn bản dài. Sử dụng quy trình Gemini AI.");
    if (!apiKeys || apiKeys.length === 0 || (apiKeys[0].indexOf("YOUR_GEMINI_API_KEY") !== -1)) {
        return Response.error("Vui lòng cấu hình API key trong file apikey.js.");
    }
    var selectedPrompt = prompts[to] || prompts["vi"];
    var processedText;
    var isPinyinRoute = false;
    if (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng') {
        isPinyinRoute = true;
        try { load("phienam.js"); processedText = phienAmToHanViet(text); } 
        catch (e) { return Response.error("LỖI: Không thể tải file phienam.js."); }
    } else {
        isPinyinRoute = false;
        processedText = text;
    }
    var textChunks = [];
    var CHUNK_SIZE = 5000;
    var MIN_LAST_CHUNK_SIZE = 1000;
    if (processedText.length > CHUNK_SIZE) {
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
    var finalContent = finalParts.join('\n\n');
    var lines = finalContent.split('\n');
    var finalOutput = "";
    for (var i = 0; i < lines.length; i++) {
        finalOutput += lines[i] + "\n";
    }
    return Response.success(finalOutput.trim());
}