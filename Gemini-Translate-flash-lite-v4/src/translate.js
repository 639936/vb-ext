load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

// Biến toàn cục để theo dõi index của API key đang được sử dụng
var currentKeyIndex = 0;

/**
 * Hàm gọi API Gemini, chịu trách nhiệm gửi yêu cầu và xử lý phản hồi.
 * @param {string} text - Nội dung cần dịch (đã qua tiền xử lý nếu cần).
 * @param {string} prompt - Prompt hướng dẫn cho AI.
 * @param {string} apiKey - API key để xác thực.
 * @returns {object} - Một đối tượng chứa trạng thái ('success', 'blocked', 'error') và dữ liệu/thông báo.
 */
function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) {
        return { status: "error", message: "API Key không hợp lệ." };
    }
    if (!text || text.trim() === '') {
        return { status: "success", data: "" };
    }

    var full_prompt = prompt + "\n\n---\n\n" + text;
    // Sử dụng model 1.5 Pro cho chất lượng tốt nhất.
    var model = "gemini-2.5-flash";
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 1.0,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 65536
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
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }
            if (result.promptFeedback?.blockReason) { 
                return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };
            }
            if (result.candidates && !result.candidates[0]?.content?.parts) {
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

/**
 * Dịch một chunk văn bản, tự động thử lại với các API key khác nếu có lỗi.
 * @param {string} chunkText - Phần văn bản cần dịch.
 * @param {string} prompt - Prompt hướng dẫn.
 * @returns {object} - Kết quả từ callGeminiAPI sau khi đã thử các key.
 */
function translateSingleChunkWithRetry(chunkText, prompt) {
    var lastError = null;
    var totalKeys = apiKeys.length;

    // Vòng lặp này sẽ thử tối đa 'totalKeys' lần, mỗi lần với một key khác nhau.
    for (var i = 0; i < totalKeys; i++) {
        var apiKeyToUse = apiKeys[currentKeyIndex];
        console.log("Đang dịch chunk với Key Index " + currentKeyIndex);

        var result = callGeminiAPI(chunkText, prompt, apiKeyToUse);

        // Chuyển sang key tiếp theo cho lần gọi kế tiếp (dù thành công hay thất bại)
        // để phân bổ đều các yêu cầu.
        currentKeyIndex = (currentKeyIndex + 1) % totalKeys;

        if (result.status === "success" || result.status === "blocked") {
            return result; // Trả về kết quả ngay khi thành công
        }
        
        lastError = result; // Lưu lại lỗi để trả về nếu tất cả các key đều thất bại
        console.log("Lỗi với key vừa dùng: " + result.message + ". Sẽ thử key tiếp theo cho chunk sau.");
    }

    console.log("Tất cả API keys đều không thành công cho chunk này.");
    return lastError;
}

/**
 * HÀM CHÍNH: Được Vbook gọi đầu tiên để bắt đầu quá trình dịch.
 * @param {string} text - Văn bản gốc từ Vbook.
 * @param {string} from - Ngôn ngữ nguồn (thường là 'zh').
 * @param {string} to - Ngôn ngữ đích được chọn.
 * @returns {Response} - Đối tượng Response chứa kết quả dịch hoặc thông báo lỗi.
 */
function execute(text, from, to) {
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    // --- PHÂN LUỒNG THÔNG MINH ---
    // Xác định xem văn bản có phải là nội dung chương hay chỉ là danh sách chương/văn bản ngắn.
    var lines = text.split('\n');
    var isContent = false;
    if (text.length >= 100) {
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length >= 50) { // Nếu có ít nhất 1 dòng dài, coi là nội dung chương
                isContent = true;
                break;
            }
        }
    }

    // LUỒNG 1: DÙNG EDGE TRANSLATE CHO VĂN BẢN NGẮN / DANH SÁCH CHƯƠNG
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
    
    // LUỒNG 2: DÙNG GEMINI AI CHO NỘI DUNG CHƯƠNG
    console.log("Phát hiện nội dung chương. Bắt đầu quy trình Gemini AI.");
    if (!apiKeys || apiKeys.length === 0) {
        return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 API key trong file apikey.js.");
    }
    
    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    // Chia văn bản thành các phần nhỏ (chunks) để xử lý
    var textChunks = [];
    const CHUNK_SIZE = 8000;
    const MIN_LAST_CHUNK_SIZE = 1000;
    var currentChunk = "";

    for (var i = 0; i < lines.length; i++) {
        var paragraph = lines[i];
        // Xử lý đoạn văn quá dài
        if (currentChunk.length === 0 && paragraph.length >= CHUNK_SIZE) {
            textChunks.push(paragraph);
            continue;
        }
        // Gộp các đoạn văn lại cho đến khi đạt CHUNK_SIZE
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
    // Gộp chunk cuối nếu nó quá nhỏ để tối ưu và giữ ngữ cảnh
    if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
        var lastChunk = textChunks.pop();
        var secondLastChunk = textChunks.pop();
        textChunks.push(secondLastChunk + "\n" + lastChunk);
        console.log("Chunk cuối quá nhỏ, đã gộp vào chunk trước đó.");
    }
    
    console.log("Văn bản đã được chia thành " + textChunks.length + " phần.");

    // Dịch từng chunk và thu thập kết quả
    var finalParts = [];
    for (var k = 0; k < textChunks.length; k++) {
        console.log("Bắt đầu xử lý phần " + (k + 1) + "/" + textChunks.length + "...");
        var chunkToSend = textChunks[k];

        // Tiền xử lý: Chuyển sang Hán Việt nếu cần
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
            // Chèn thông báo lỗi vào đúng vị trí của chunk bị lỗi
            var errorString = "<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " (ĐÃ THỬ HẾT CÁC KEY) --->>>>>\n" 
                            + "Lý do: " + chunkResult.message + "\n" 
                            + "<<<<<--- KẾT THÚC LỖI --->>>>>";
            finalParts.push(errorString);
        }
    }
    
    // Ghép các phần đã dịch lại và trả về kết quả cuối cùng
    var finalContent = finalParts.join('\n\n');
    return Response.success(finalContent.trim());
}