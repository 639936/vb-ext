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
        "generationConfig": { "temperature": 0.7, "topP": 0.95, "maxOutputTokens": 65536 },
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

// Hàm dịch một chunk văn bản duy nhất (bao gồm cả fallback dịch từng dòng nếu cần)
function translateSingleChunk(chunkText, prompt) {
    for (var i = 0; i < apiKeys.length; i++) {
        var key = apiKeys[currentKeyIndex];
        var result = callGeminiAPI(chunkText, prompt, key);
        if (result.status === "success") { return result; }
        if (result.status === "blocked") {
            // Fallback sang dịch từng dòng chỉ áp dụng cho các prompt không dùng phiên âm
            var lines = chunkText.split('\n');
            var translatedLines = [];
            for (var k = 0; k < lines.length; k++) { translatedLines.push("..."); }
            return { status: "partial_error", data: translatedLines.join('\n') };
        }
        if (result.status === "key_error") {
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        } else {
            return result; // Trả về các lỗi khác (ví dụ: API không trả về nội dung)
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

    var selectedPrompt = prompts[to] || prompts["vi"];
    var processedText;

    // --- LOGIC MỚI: TIỀN XỬ LÝ DỰA TRÊN NGÔN NGỮ ĐÍCH ---
    // (Trong thiết lập hiện tại, 'default' là prompt Việt tổng hợp)
    if (to === 'vi' || to === 'vi_sac') {
        console.log("Phát hiện ngôn ngữ đích '" + to + "'. Bắt đầu quy trình phiên âm Hán Việt...");
        try {
            load("phienam.js");
            processedText = phienAmToHanViet(text);
        } catch (e) {
            return Response.error("LỖI: Không thể tải file phienam.js. Hãy đảm bảo file này tồn tại trong cùng thư mục.");
        }
    } else {
        // --- LỘ TRÌNH TIÊU CHUẨN (KHÔNG PHIÊN ÂM) ---
        console.log("Ngôn ngữ đích '" + to + "' không yêu cầu phiên âm. Giữ nguyên văn bản gốc.");
        processedText = text;
    }

    // --- GIAI ĐOẠN XỬ LÝ TEXT (CHUNK) ---
    // Toàn bộ logic bên dưới sẽ hoạt động trên 'processedText'
    var textChunks = [];
    var CHUNK_SIZE = 5000;
    var MIN_LAST_CHUNK_SIZE = 1000;
    var INPUT_LENGTH_THRESHOLD = 10000;

    if (processedText.length > INPUT_LENGTH_THRESHOLD) {
        var tempChunks = [];
        for (var i = 0; i < processedText.length; i += CHUNK_SIZE) {
            tempChunks.push(processedText.substring(i, i + CHUNK_SIZE));
        }
        if (tempChunks.length > 1 && tempChunks[tempChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
            var lastChunk = tempChunks.pop();
            var secondLastChunk = tempChunks.pop();
            tempChunks.push(secondLastChunk + lastChunk);
        }
        textChunks = tempChunks;
    } else {
        textChunks.push(processedText);
    }

    // --- GIAI ĐOẠN GỬI ĐẾN GEMINI VÀ GOM KẾT QUẢ ---
    var finalParts = [];
    for (var k = 0; k < textChunks.length; k++) {
        var chunkResult = translateSingleChunk(textChunks[k], selectedPrompt);
        
        if (chunkResult.status === 'success' || chunkResult.status === 'partial_error') {
            finalParts.push(chunkResult.data);
        } else {
            var errorString = "\n\n<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " --->>>>>\n" +
                              "Lý do: " + chunkResult.message + "\n" +
                              "<<<<<--- KẾT THÚC LỖI --->>>>>\n\n";
            finalParts.push(errorString);
        }
    }
    
    // --- GIAI ĐOẠN CUỐI: XỬ LÝ KẾT QUẢ ĐỂ HIỂN THỊ ---
    var intermediateContent = finalParts.join('\n\n');
    var lines = intermediateContent.split('\n');
    var finalOutput = "";
    for (var i = 0; i < lines.length; i++) {
        finalOutput += lines[i] + "\n";
    }

    return Response.success(finalOutput.trim());
}