load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

var currentKeyIndex = 0;

function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": 1, "topP": 0.95, "topK": 40, "maxOutputTokens": 65536 },
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
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }
            if (result.promptFeedback && result.promptFeedback.blockReason) { 
                return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };
            }
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

function translateSingleChunkWithRetry(chunkText, prompt) {
    var lastError = null;
    var totalKeys = apiKeys.length;
    for (var i = 0; i < totalKeys; i++) {
        var apiKeyToUse = apiKeys[currentKeyIndex];
        console.log("Đang dịch chunk với Key Index " + currentKeyIndex);
        var result = callGeminiAPI(chunkText, prompt, apiKeyToUse);
        currentKeyIndex = (currentKeyIndex + 1) % totalKeys;
        if (result.status === "success" || result.status === "blocked") {
            return result;
        }
        lastError = result;
        console.log("Lỗi với key vừa dùng: " + result.message + ". Sẽ thử key tiếp theo cho chunk sau nếu có.");
    }
    console.log("Tất cả API keys đều không thành công cho chunk này.");
    return lastError;
}

function execute(text, from, to) {
    if (!text || text.trim() === '') { return Response.success("?"); }

    var lines = text.split('\n');
    var isContent = false;
    if (text.length >= 100) {
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length >= 50) {
                isContent = true;
                break;
            }
        }
    }

    // Luồng 1 & 2: Dùng Edge cho văn bản ngắn hoặc danh sách chương
    if (text.length < 100 || !isContent) {
        console.log("Sử dụng Edge Translate.");
        var edgeToLang = (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') ? 'vi' : to;
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0);
        
        // --- GIỮ LẠI KHỐI XỬ LÝ KẾT QUẢ GỐC ---
        if (rawTranslatedText !== null) {
            var resultLines = rawTranslatedText.split('\n');
            var finalOutput = "";
            for (var i = 0; i < resultLines.length; i++) {
                finalOutput += resultLines[i] + "\n";
            }
            return Response.success(finalOutput.trim());
        } else { 
            return Response.error("Lỗi Edge Translate."); 
        }
    }
    
    // Luồng 3: Dùng Gemini cho nội dung chương
    console.log("Văn bản là nội dung chương. Bắt đầu quy trình Gemini AI.");
    if (!apiKeys || apiKeys.length === 0) {
        return Response.error("Vui lòng cấu hình ít nhất 1 API key.");
    }
    
    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    var textChunks = [];
    var CHUNK_SIZE = 7000;
    var MIN_LAST_CHUNK_SIZE = 1000;
    var paragraphs = lines;
    var currentChunk = "";

    for (var i = 0; i < paragraphs.length; i++) {
        var paragraph = paragraphs[i];
        if (currentChunk.length === 0 && paragraph.length >= CHUNK_SIZE) {
            textChunks.push(paragraph);
            continue;
        }
        if (currentChunk.length + paragraph.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
            textChunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            if (currentChunk.length > 0) {
                currentChunk += "\n" + paragraph;
            } else {
                currentChunk = paragraph;
            }
        }
    }
    if (currentChunk.length > 0) {
        textChunks.push(currentChunk);
    }
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
            } catch (e) {
                return Response.error("LỖI: Không thể tải file phienam.js.");
            }
        }
        var chunkResult = translateSingleChunkWithRetry(chunkToSend, selectedPrompt);
        if (chunkResult.status === 'success' || chunkResult.status === 'blocked') {
            finalParts.push(chunkResult.data);
        } else {
            var errorString = "<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " (ĐÃ THỬ HẾT CÁC KEY) --->>>>>\n" + "Lý do: " + chunkResult.message + "\n" + "<<<<<--- KẾT THÚC LỖI --->>>>>";
            finalParts.push(errorString);
        }
    }
    
    var finalContent = finalParts.join('\n\n');

    // --- ÁP DỤNG KHỐI XỬ LÝ KẾT QUẢ NHẤT QUÁN CHO GEMINI ---
    var resultLines = finalContent.split('\n');
    var finalOutput = "";
    for (var i = 0; i < resultLines.length; i++) {
        finalOutput += resultLines[i] + "\n";
    }
    return Response.success(finalOutput.trim());
}