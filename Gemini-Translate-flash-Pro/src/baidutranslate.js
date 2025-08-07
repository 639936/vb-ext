var languageMap = {
    "auto": "auto",
    "zh": "zh",
    "en": "en",
    "vi": "vie"
};

function baiduTranslateContent(text, from, to, retryCount) {
    if (retryCount > 2) return null;

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
            console.log("Baidu trả về phản hồi trống, thử lại...");
            return baiduTranslateContent(text, from, to, retryCount + 1);
        }

        var parts = resultText.split("\n");
        var trans = "";

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part.startsWith("data")) {
                try {
                    var obj = JSON.parse(part.substring(part.indexOf("{")));
                    
                    if (obj && obj.data && obj.data.list) {
                        var rData = obj.data.list;
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
            return Response.success(trans.trim());
        }
    }

    return baiduTranslateContent(text, from, to, retryCount + 1);
}

function baiduDetectLanguage(text) {
    var sampleText = text.substring(0, Math.min(200, text.length));
    var response = fetch('https://fanyi.baidu.com/langdetect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: "query=" + encodeURIComponent(sampleText),
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