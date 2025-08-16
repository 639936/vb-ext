load("language_list.js");
/**
 * Hàm thực thi chính, được gọi bởi ứng dụng.
 * Sẽ phân loại văn bản đầu vào và chọn phương pháp dịch phù hợp.
 */
function execute(text, from, to, apiKey) {
    if (!text || text.trim() === '') {
        return Response.success("");
    }

    var lines = text.split('\n');
    var isChapterList = false;

    // --- BẮT ĐẦU LOGIC PHÁT HIỆN DANH SÁCH CHƯƠG ---
    if (text.length < 800) {
        isChapterList = true;
    } else {
        var shortLinesCount = 0;
        var totalLines = lines.length;
        if (totalLines > 0) {
            for (var i = 0; i < totalLines; i++) {
                if (lines[i].trim().length < 25) {
                    shortLinesCount++;
                }
            }
            if ((shortLinesCount / totalLines) > 0.8) {
                isChapterList = true;
            }
        }
    }
    // --- KẾT THÚC LOGIC PHÁT HIỆN DANH SÁCH CHƯƠNG ---

    // --- BẮT ĐẦU LOGIC XỬ LÝ VÀ DỊCH ---

    // TRƯỜNG HỢP 1: Văn bản được xác định là DANH SÁCH CHƯƠNG
    if (isChapterList) {
        console.log("Phát hiện danh sách chương. Dịch theo từng khối 500 dòng.");
        
        var CHUNK_SIZE_LINES = 500; // THAY ĐỔI: const -> var
        var translatedParts = [];
        var totalChunks = Math.ceil(lines.length / CHUNK_SIZE_LINES);

        for (var i = 0; i < lines.length; i += CHUNK_SIZE_LINES) {
            var currentChunkIndex = (i / CHUNK_SIZE_LINES + 1);
            console.log("Đang dịch phần " + currentChunkIndex + "/" + totalChunks + " (danh sách chương)...");
            var currentChunkLines = lines.slice(i, i + CHUNK_SIZE_LINES);
            var chunkText = currentChunkLines.join('\n');
            var translatedChunk = baiduTranslateContent(chunkText, from, to, 0);
            
            if (translatedChunk === null) {
                console.log("Lỗi khi dịch phần " + currentChunkIndex + " bằng Baidu.");
                return Response.error("Lỗi Baidu Translate. Vui lòng thử lại.");
            }
            translatedParts.push(translatedChunk);
        }
        
        var finalResult = translatedParts.join('\n');
        return Response.success(finalResult);
    }

    // TRƯỜNG HỢP 2: Văn bản DÀI (> 9000 ký tự) không phải danh sách chương
    var MAX_LENGTH = 9500;
    if (text.length > MAX_LENGTH) {
        console.log("Phát hiện văn bản dài. Chia nhỏ theo độ dài < " + MAX_LENGTH + " ký tự.");
        var textChunks = [];
        var currentChunk = "";

        // THAY ĐỔI: for...of -> for...i
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (currentChunk.length > 0 && currentChunk.length + line.length + 1 > MAX_LENGTH) {
                textChunks.push(currentChunk);
                currentChunk = line;
            } else {
                currentChunk = (currentChunk === "") ? line : (currentChunk + "\n" + line);
            }
        }
        if (currentChunk.length > 0) {
            textChunks.push(currentChunk);
        }

        var translatedParts = [];
        for (var i = 0; i < textChunks.length; i++) {
            console.log("Đang dịch phần " + (i + 1) + "/" + textChunks.length + " (văn bản dài)...");
            var translatedChunk = baiduTranslateContent(textChunks[i], from, to, 0);
            if (translatedChunk === null) {
                console.log("Lỗi khi dịch phần " + (i + 1) + " của văn bản dài.");
                return Response.error("Lỗi Baidu Translate. Vui lòng thử lại.");
            }
            translatedParts.push(translatedChunk);
        }
        return Response.success(translatedParts.join("\n"));
    }

    // TRƯỜNG HỢP 3: Văn bản THƯỜNG
    console.log("Dịch văn bản thường (độ dài " + text.length + ").");
    var result = baiduTranslateContent(text, from, to, 0);
    if (result === null) {
        return Response.error("Lỗi Baidu Translate. Vui lòng thử lại.");
    }
    return Response.success(result);
}

/**
 * Hàm dịch cốt lõi
 */
function baiduTranslateContent(text, from, to, retryCount) {
    if (retryCount > 5) return null;
    if (!from || from === "auto") {
        from = baiduDetectLanguage(text);
    } else {
        from = languageMap[from] || from;
    }
    to = languageMap[to] || to;

    var data = {
        query: text,
        from: from,
        to: to,
        reference: "",
        corpusIds: [],
        needPhonetic: true,
        domain: "common",
        milliTimestamp: Date.now()
    };

    var response = fetch("https://fanyi.baidu.com/ait/text/translate", {
        method: 'POST',
        headers: {
            'Referer': 'https://fanyi.baidu.com/',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        var resultText = response.text();
        if (!resultText || resultText.trim() === '') {
            return baiduTranslateContent(text, from, to, retryCount + 1);
        }

        var parts = resultText.split("\n");
        var trans = "";

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part.startsWith("data")) {
                try {
                    var obj = JSON.parse(part.substring(part.indexOf("{")));
                    var tranData = obj.data;
                    
                    if (tranData && tranData.event === "Translating" && tranData.list) {
                        var rData = tranData.list;
                        for (var j = 0; j < rData.length; j++) {
                            var item = rData[j];
                            if (item && item.dst) {
                                trans += item.dst + "\n";
                            }
                        }
                    }
                } catch (e) {
                    console.log("Lỗi parse JSON trong Baidu (dòng bị bỏ qua): " + e.toString());
                }
            }
        }
        
        if (trans.trim() !== "") {
            return trans.trim();
        }
    }
    return baiduTranslateContent(text, from, to, retryCount + 1);
}

/**
 * Hàm phát hiện ngôn ngữ
 */
function baiduDetectLanguage(text) {
    var sampleText = text.substring(0, Math.min(200, text.length));
    var response = fetch('https://fanyi.baidu.com/langdetect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "query": sampleText }),
    });

    if (response.ok) {
        try {
            var jsonResponse = JSON.parse(response.text());
            if (jsonResponse && jsonResponse.error === 0 && jsonResponse.lan) {
                return jsonResponse.lan;
            }
        } catch(e) { 
            console.log("Lỗi parse JSON trong baiduDetectLanguage: " + e.toString()); 
        }
    }
    return "auto";
}