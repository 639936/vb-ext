load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

// === THAY ĐỔI 1: KHAI BÁO DANH SÁCH MODELS ===
// Khai báo danh sách các model, model đầu tiên sẽ được ưu tiên sử dụng.
// Nếu model đầu tiên thất bại với tất cả các key, hệ thống sẽ chuyển sang model tiếp theo.
var modelsucess = "";
var models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite" 
];
// === THAY ĐỔI 2: CẬP NHẬT HÀM callGeminiAPI ĐỂ NHẬN THAM SỐ MODEL ===
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

            if (result.candidates && result.candidates.length > 0 
                && result.candidates[0].content 
                && result.candidates[0].content.parts 
                && result.candidates[0].content.parts.length > 0 
                && result.candidates[0].content.parts[0].text) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }
            
            if (result.promptFeedback && result.promptFeedback.blockReason) { 
                return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };
            }
            
            if (result.candidates && result.candidates.length > 0 && (!result.candidates[0].content || !result.candidates[0].content.parts)) {
                return { status: "blocked", message: "Bị chặn (không có nội dung trả về)." };
            }

            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + response.text() };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + " (response not ok model '" + model + "' đã thử cuối cùng)." };
        }
    } catch (e) {
        return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() };
    }
}

// === THAY ĐỔI 3: CẬP NHẬT HÀM translateSingleChunkWithRetry VỚI LOGIC LỒNG NHAU ===
function translateSingleChunkWithRetry(chunkText, prompt) {
    var lastError = null;

    // Vòng lặp ngoài: Duyệt qua từng model trong danh sách `models`
    for (var m = 0; m < models.length; m++) {
        var modelToUse = models[m];
        console.log("----- Bắt đầu thử với Model: " + modelToUse + " -----");

        // Vòng lặp trong: Duyệt qua từng API key cho model hiện tại
        for (var i = 0; i < apiKeys.length; i++) {
            var apiKeyToUse = apiKeys[i];
            console.log("Đang thử Model '" + modelToUse + "' với Key Index " + i);

            // Gọi API với model và key cụ thể
            var result = callGeminiAPI(chunkText, prompt, apiKeyToUse, modelToUse);

            // Nếu thành công hoặc bị chặn có chủ đích, trả về kết quả ngay lập tức
            if (result.status === "success" || result.status === "blocked") {
                console.log("Thành công với Model '" + modelToUse + "', Key Index " + i);
                return result; 
            }
            
            // Nếu lỗi, lưu lại lỗi cuối cùng và thử key tiếp theo
            lastError = result; 
            console.log("Lỗi với Model '" + modelToUse + "', Key Index " + i + ": " + result.message + ". Đang thử key tiếp theo...");
        }

        console.log("----- Tất cả các key đều thất bại cho Model: " + modelToUse + ". Chuyển sang model tiếp theo (nếu có). -----");
    }

    // Nếu tất cả các model và key đều không thành công
    console.log("Tất cả API keys và Models đều không thành công cho chunk này.");
    return lastError; // Trả về lỗi cuối cùng gặp phải
}

function execute(text, from, to) {
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

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

    if (text.length < 100 || !isContent) {
        console.log("Phát hiện văn bản ngắn hoặc danh sách chương. Sử dụng Edge Translate.");
        var edgeToLang = (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') ? 'vi' : to;
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0);
        
        if (rawTranslatedText !== null) {
            return Response.success(rawTranslatedText);
        } else { 
            return Response.error("Lỗi Edge Translate. Vui lòng thử lại."); 
        }
    }
    
    console.log("Phát hiện nội dung chương. Bắt đầu quy trình Gemini AI.");
    if (!apiKeys || apiKeys.length === 0) {
        return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 API key trong file apikey.js.");
    }
    if (!models || models.length === 0) {
        return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 model trong file translate.js.");
    }
    
    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    var textChunks = [];
    const CHUNK_SIZE = 8000;
    const MIN_LAST_CHUNK_SIZE = 1000;
    var currentChunk = "";

    for (var i = 0; i < lines.length; i++) {
        var paragraph = lines[i];
        if (currentChunk.length === 0 && paragraph.length >= CHUNK_SIZE) {
            textChunks.push(paragraph);
            continue;
        }
        if (currentChunk.length + paragraph.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
            textChunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            currentChunk = currentChunk ? (currentChunk + "\n" + paragraph) : paragraph;
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
                return Response.error("LỖI: Không thể tải hoặc thực thi file phienam.js.");
            }
        }

        var chunkResult = translateSingleChunkWithRetry(chunkToSend, selectedPrompt);
        
        if (chunkResult.status === 'success' || (chunkResult.status === 'blocked' && chunkResult.data)) {
            finalParts.push(chunkResult.data);
        } else {
            var errorString = "<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " (ĐÃ THỬ HẾT CÁC KEY VÀ MODEL) --->>>>>\n" 
                            + "Lý do: " + chunkResult.message + "\n" 
                            + "<<<<<--- KẾT THÚC LỖI --->>>>>";
            finalParts.push(errorString);
        }
    }
    
    var finalContent = modelsucess + ". " + finalParts.join('\n\n');
    return Response.success(finalContent.trim());
}