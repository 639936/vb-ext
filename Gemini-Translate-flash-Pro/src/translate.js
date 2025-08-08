load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

var currentKeyIndex = 0;

function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": 0.85, "topP": 0.95, "maxOutputTokens": 65536 },
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

    if (text.length < 200) {
        console.log("Phát hiện văn bản ngắn (< 200 ký tự). Sử dụng Edge Translate.");
        var edgeToLang = to;
        if (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') {
            edgeToLang = 'vi';
        }
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0); 
        if (rawTranslatedText !== null) {
            var lines = rawTranslatedText.split('\n');
            var finalOutput = "";
            for (var i = 0; i < lines.length; i++) {
                finalOutput += lines[i] + "\n";
            }
            return Response.success(finalOutput.trim());
        } else {
            return Response.error("Lỗi khi dịch bằng Edge Translate (sau nhiều lần thử lại).");
        }
    }
    
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
    var CHUNK_SIZE = 50000;
    var MIN_LAST_CHUNK_SIZE = 10000;
    
    if (processedText.length > CHUNK_SIZE) {
        console.log("Văn bản quá dài, bắt đầu chia nhỏ thông minh theo đoạn văn...");
        var paragraphs = processedText.split('\n');
        var currentChunk = "";

        for (var i = 0; i < paragraphs.length; i++) {
            var paragraph = paragraphs[i];
            if (paragraph.length > CHUNK_SIZE) {
                if (currentChunk.length > 0) {
                    textChunks.push(currentChunk);
                    currentChunk = "";
                }
                textChunks.push(paragraph); 
                continue;
            }
            if (currentChunk.length + paragraph.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
                textChunks.push(currentChunk);
                currentChunk = paragraph;
            } else {
                if (currentChunk.length > 0) { currentChunk += "\n" + paragraph; } 
                else { currentChunk = paragraph; }
            }
        }
        if (currentChunk.length > 0) {
            textChunks.push(currentChunk);
        }
        console.log("Đã chia văn bản thành " + textChunks.length + " phần.");

        // =======================================================================
        // --- LOGIC MỚI: GỘP PHẦN CUỐI NẾU QUÁ NHỎ ---
        // =======================================================================
        if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
            console.log("Phần cuối quá nhỏ (" + textChunks[textChunks.length - 1].length + " ký tự), đang gộp vào phần trước đó.");
            var lastChunk = textChunks.pop();
            var secondLastChunk = textChunks.pop();
            // Nối lại bằng một ký tự xuống dòng để duy trì cấu trúc đoạn
            textChunks.push(secondLastChunk + "\n" + lastChunk);
            console.log("Số phần sau khi gộp: " + textChunks.length);
        }
        // =======================================================================
        // --- KẾT THÚC LOGIC GỘP ---
        // =======================================================================

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
    
    var finalContent = finalParts.join('\n');
    var lines = finalContent.split('\n');
    var finalOutput = "";
    for (var i = 0; i < lines.length; i++) {
        finalOutput += lines[i] + "\n";
    }
    return Response.success(finalOutput.trim());
}