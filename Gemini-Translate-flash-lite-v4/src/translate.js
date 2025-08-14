// translate.js (Phiên bản đã sửa đổi để gỡ lỗi)
load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

var currentKeyIndex = 0;

function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    // SỬA LỖI 2: Quay lại dùng model flash để có tốc độ tốt nhất
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": 1, "topP": 0.95, "topK": 40, "maxOutputTokens": 65536 },
        "safetySettings": [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ]
    };
    try {
        var response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (response.ok) {
            var result = JSON.parse(response.text());

            // SỬA LỖI 1: Thêm lớp kiểm tra an toàn cho 'parts'
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }

            // Nếu không có 'parts', rất có thể là đã bị chặn
            if (result.promptFeedback && result.promptFeedback.blockReason) { 
                return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };
            }
            // Trường hợp bị chặn nhưng không có promptFeedback (hiếm gặp)
            if (result.candidates && result.candidates.length > 0 && !result.candidates[0].content.parts) {
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

function translateSingleChunk(chunkText, prompt, isPinyinRoute) {
    var lastError = null;
    var maxRetries = 1;
    for (var attempt = 0; attempt <= maxRetries; attempt++) {
        var apiKeyToUse = apiKeys[currentKeyIndex];
        console.log("Đang thử dịch (lần " + (attempt + 1) + ") với Key Index " + currentKeyIndex);
        var result = callGeminiAPI(chunkText, prompt, apiKeyToUse);
        if (result.status === "success" || result.status === "blocked") {
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            return result;
        }
        lastError = result; 
        console.log("Lỗi với Key Index " + currentKeyIndex + ": " + result.message + ". Đang thử lại với key tiếp theo...");
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        if (attempt === maxRetries) { break; }
    }
    console.log("Thất bại sau " + (maxRetries + 1) + " lần thử.");
    return lastError; 
}

function execute(text, from, to) {
    if (!text || text.trim() === '') { return Response.success("?"); }

    // Xử lý với văn bản ngắn (Edge Translate)
    if (text.length < 100) {
        var edgeToLang = to;
        if (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') { edgeToLang = 'vi'; }
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0); 
        if (rawTranslatedText !== null) {
            var lines = rawTranslatedText.split('\n');
            var finalOutput = "";
            for (var i = 0; i < lines.length; i++) { finalOutput += lines[i] + "\n"; }
            
            // BẮT ĐẦU THAY ĐỔI 1
            // Nối thêm dữ liệu gốc vào cuối kết quả để gỡ lỗi
            var debugResult = finalOutput.trim() + "\n\n--- DEBUG: DỮ LIỆU GỐC NHẬN ĐƯỢC ---\n\n" + text;
            return Response.success(debugResult);
            // KẾT THÚC THAY ĐỔI 1

        } else { return Response.error("Lỗi Edge Translate."); }
    }
    
    // Xử lý với văn bản dài (Gemini AI)
    console.log("Văn bản dài. Sử dụng quy trình Gemini AI với cơ chế retry.");
    if (!apiKeys || apiKeys.length < 2) {
        return Response.error("Vui lòng cấu hình ít nhất 2 API key cho cơ chế retry.");
    }
    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    var textChunks = [];
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
        console.log("Bắt đầu dịch phần " + (k + 1) + "/" + textChunks.length + "...");
        var chunkToSend;
        if (isPinyinRoute) {
            try { load("phienam.js"); chunkToSend = phienAmToHanViet(textChunks[k]); } 
            catch (e) { return Response.error("LỖI: Không thể tải file phienam.js."); }
        } else {
            chunkToSend = textChunks[k];
        }
        var chunkResult = translateSingleChunk(chunkToSend, selectedPrompt, isPinyinRoute);
        if (chunkResult.status === 'success' || chunkResult.status === 'partial_error') {
            finalParts.push(chunkResult.data);
        } else {
            var errorString = "<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " (SAU KHI THỬ LẠI) --->>>>>" +
                              "Lý do: " + chunkResult.message + "" +
                              "<<<<<--- KẾT THÚC LỖI --->>>>>";
            finalParts.push(errorString);
        }
    }
    
    var finalContent = finalParts.join('\n');
    var lines = finalContent.split('\n');
    var finalOutput = "";
    for (var i = 0; i < lines.length; i++) {
        finalOutput += lines[i] + "\n";
    }

    // BẮT ĐẦU THAY ĐỔI 2
    // Nối thêm dữ liệu gốc vào cuối kết quả để gỡ lỗi
    var debugResult = finalOutput.trim() + "\n\n--- DEBUG: DỮ LIỆU GỐC NHẬN ĐƯỢC ---\n\n" + text;
    return Response.success(debugResult);
    // KẾT THÚC THAY ĐỔI 2
}