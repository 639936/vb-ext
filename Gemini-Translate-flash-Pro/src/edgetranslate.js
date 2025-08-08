function edgeTranslateContent(text, from, to, retryCount) {
    if (retryCount > 2) return null;

    var edgeFrom = (from === 'zh') ? 'zh-Hans' : from;

    var lines = text.split("\n");
    var data = [];
    for (var i = 0; i < lines.length; i++) {
        data.push({ "Text": lines[i] });
    }
    
    var queries = {
        "from": edgeFrom,
        "to": to,
        "api-version": "3.0"
    };

    var authToken = getAuthorizationToken();
    if (!authToken) {
        console.log("Không lấy được token xác thực của Edge, thử lại...");
        localStorage.setItem("authorization", "");
        return edgeTranslateContent(text, from, to, retryCount + 1);
    }
    
    var response = fetch("https://api-edge.cognitive.microsofttranslator.com/translate", {
        method: "POST",
        queries: queries,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken,
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        var resultText = response.text();
        if (resultText && resultText.startsWith("[")) {
            var trans = "";
            var resultArr = JSON.parse(resultText);
            for (var j = 0; j < resultArr.length; j++) {
                var item = resultArr[j];
                if (item && item.translations && item.translations[0]) {
                    trans += item.translations[0].text + "\n";
                }
            }
            return trans.trim();
        }
    }
    
    console.log("Lỗi khi dịch bằng Edge (có thể do token hết hạn), đang thử lại...");
    localStorage.setItem("authorization", "");
    return edgeTranslateContent(text, from, to, retryCount + 1);
}

function getAuthorizationToken() {
    var authorization = localStorage.getItem("authorization");
    if (authorization) return authorization;

    var response = fetch("https://edge.microsoft.com/translate/auth", {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0"
        }
    });

    if (response.ok) {
        authorization = response.text();
        localStorage.setItem("authorization", authorization);
        return authorization;
    }
    return null;
}