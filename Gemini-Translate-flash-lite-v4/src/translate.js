load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");
/*
var testText = `Dòng 1: 楚晚宁是真的狗。
Dòng 2: 他吸了一口，那浓精几乎是立刻就烫得他皱起了眉头。
Dòng 3: 这是第一段。

Dòng 4: 这是第二段，它比较短。
Dòng 5: 这是第二段的另一句话。

Dòng 6: 这是第三段。
Dòng 7: 这是第四段。
Dòng 8: 这是第五段。
Dòng 9: 这是第六段。
　　以及美丽娇俏的尤物堂姐
 　　这里是蘑菇蛋，很高兴恢复更新，谢谢大家。
 　　这篇给大家带来的是催眠之力系列，按照创作计划，催眠之力正传是以春节大章作为收尾，不过因为灵感因素，一直都未能创作完成，所以更新一篇外传，希望大家喜欢。
 　　“祝愿堂哥新年快乐，恭喜发财！”
 　　王光阳打开家门，看清来人面孔后抱拳恭喜，表现热情。
 　　“嗯，同喜同喜。”
`;
var testFrom = `zh`;
var testTo = `vi`;
*/
var currentKeyIndex = 0;

function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=" + apiKey;
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
    var maxRetries = 2;

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

        if (attempt === maxRetries) {
            break;
        }
    }
    
    console.log("Thất bại sau " + (maxRetries + 1) + " lần thử.");
    return lastError; 
}

function execute(text, from, to) {
    /*
    var text = testText;
    var from = testFrom;
    var to = testTo;
    */
    if (!text || text.trim() === '') { return Response.success("?"); }
    

    if (text.length < 200) {
        var edgeToLang = to;
        if (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') { edgeToLang = 'vi'; }
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0); 
        if (rawTranslatedText !== null) {
            var lines = rawTranslatedText.split('\n');
            var finalOutput = "";
            for (var i = 0; i < lines.length; i++) { finalOutput += lines[i] + "\n"; }
            return Response.success(finalOutput.trim());
        } else { return Response.error("Lỗi Edge Translate."); }
    }
    
    console.log("Văn bản dài. Sử dụng quy trình Gemini AI với cơ chế retry.");
    if (!apiKeys || apiKeys.length < 3) { // Cần ít nhất 3 key để cơ chế retry hoạt động tốt nhất
        return Response.error("Vui lòng cấu hình ít nhất 3 API key cho cơ chế retry.");
    }
    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    var textChunks = [];
    var CHUNK_SIZE = 4000;
    var MIN_LAST_CHUNK_SIZE = 600;
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
    return Response.success(finalOutput.trim());
}