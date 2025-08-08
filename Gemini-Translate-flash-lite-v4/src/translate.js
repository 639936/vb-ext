load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

var currentKeyIndex = 0;

function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    // SỬA LỖI 1: Sửa 'lastest' thành 'latest'
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": { 
            "temperature": 0.85, 
            "topP": 0.95,
            "maxOutputTokens": 65536
        },
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
            return { status: "key_error", message: "Lỗi HTTP " + response.status + " (API key hoặc tên model sai)." };
        }
    } catch (e) {
        return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() };
    }
}

// Hàm này được giữ nguyên logic ban đầu, chỉ truyền apiKey vào
function translateInChunksByLine(text, prompt, apiKey) {
    var lines = text.split('\n'); var translatedLines = []; var errorOccurred = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i]; if (line.trim() === '') { translatedLines.push(''); continue; }
        var result = callGeminiAPI(line, prompt, apiKey);
        if (result.status === "success") { translatedLines.push(result.data); }
        else if (result.status === "blocked") { translatedLines.push("..."); }
        else { translatedLines.push("[LỖI DỊCH DÒNG: " + result.message + "]"); errorOccurred = true; }
    }
    if (errorOccurred) { return { status: "partial_error", data: translatedLines.join('\n') }; }
    return { status: "success", data: translatedLines.join('\n') };
}

// Hàm này chỉ gọi callGeminiAPI và xử lý fallback
function translateSingleChunk(chunkText, prompt, isPinyinRoute, apiKey) {
    var result = callGeminiAPI(chunkText, prompt, apiKey);
    if (result.status === "success") { return result; }
    if (result.status === "blocked") {
        if (isPinyinRoute) { return result; } 
        else { return translateInChunksByLine(chunkText, prompt, apiKey); }
    }
    return result; 
}

function execute(text, from, to) {
    if (!text || text.trim() === '') { return Response.success("?"); }
    if (text.length < 200) {
        // ... (Logic Edge Translate giữ nguyên, không đổi) ...
        var edgeToLang = to;
        if (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') { edgeToLang = 'vi'; }
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0); 
        if (rawTranslatedText !== null) {
            var lines = rawTranslatedText.split('\n');
            var finalOutput = "";
            for (var i = 0; i < lines.length; i++) { finalOutput += lines[i] + "\n"; }
            return Response.success(finalOutput.trim());
        } else {
            return Response.error("Lỗi Edge Translate.");
        }
    }
    
    console.log("Văn bản dài. Sử dụng quy trình Gemini AI tuần tự xoay vòng.");
    if (!apiKeys || apiKeys.length === 0 || (apiKeys[0].indexOf("YOUR_GEMINI_API_KEY") !== -1)) {
        return Response.error("Vui lòng cấu hình API key trong file apikey.js.");
    }
    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    var textChunks = [];
    // SỬA LỖI 2: Giảm kích thước chunk để tránh timeout
    var CHUNK_SIZE = 8000;
    var MIN_LAST_CHUNK_SIZE = 1000;
    if (text.length > CHUNK_SIZE) {
        var paragraphs = text.split('\n'); var currentChunk = "";
        for (var i = 0; i < paragraphs.length; i++) {
            var paragraph = paragraphs[i];
            if (paragraph.length > CHUNK_SIZE) { if (currentChunk.length > 0) { textChunks.push(currentChunk); currentChunk = ""; } textChunks.push(paragraph); continue; }
            if (currentChunk.length + paragraph.length + 1 > CHUNK_SIZE && currentChunk.length > 0) { textChunks.push(currentChunk); currentChunk = paragraph; } 
            else { if (currentChunk.length > 0) { currentChunk += "\n" + paragraph; } else { currentChunk = paragraph; } }
        }
        if (currentChunk.length > 0) { textChunks.push(currentChunk); }
        if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
            var lastChunk = textChunks.pop(); var secondLastChunk = textChunks.pop();
            textChunks.push(secondLastChunk + "\n" + lastChunk);
        }
    } else {
        textChunks.push(text);
    }
    
    var finalParts = [];
    for (var k = 0; k < textChunks.length; k++) {
        var apiKeyToUse = apiKeys[currentKeyIndex];
        console.log("Đang dịch phần " + (k + 1) + "/" + textChunks.length + " với Key Index " + currentKeyIndex);

        var chunkToSend;
        if (isPinyinRoute) {
            try { load("phienam.js"); chunkToSend = phienAmToHanViet(textChunks[k]); } 
            catch (e) { return Response.error("LỖI: Không thể tải file phienam.js."); }
        } else {
            chunkToSend = textChunks[k];
        }

        var chunkResult = translateSingleChunk(chunkToSend, selectedPrompt, isPinyinRoute, apiKeyToUse);

        if (chunkResult.status === 'success' || chunkResult.status === 'partial_error') {
            finalParts.push(chunkResult.data);
        } else {
            var errorString = "\n\n<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " VỚI KEY " + currentKeyIndex + " --->>>>>\n" +
                              "Lý do: " + chunkResult.message + "\n" +
                              "<<<<<--- KẾT THÚC LỖI --->>>>>\n\n";
            finalParts.push(errorString);
        }
        
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }
    
    var finalContent = finalParts.join('\n');
    var lines = finalContent.split('\n');
    var finalOutput = "";
    for (var i = 0; i < lines.length; i++) {
        finalOutput += lines[i] + "\n";
    }
    return Response.success(finalOutput.trim());
}