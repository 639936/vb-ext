// edgetranslate.js (Phiên bản Thư viện - Cung cấp hàm cho translate.js)
// File này không còn là một plugin độc lập.

/**
 * Dịch văn bản bằng Microsoft Edge Translate.
 * Khi thành công, trả về chuỗi kết quả. Khi thất bại, trả về null.
 * @returns {string|null}
 */
function edgeTranslateContent(text, from, to, retryCount) {
    if (retryCount > 2) return null;

    // Edge API sử dụng các mã ngôn ngữ hơi khác một chút, ví dụ 'zh-Hans'
    var edgeFrom = (from === 'zh') ? 'zh-Hans' : from;

    // Tách văn bản thành các dòng để tạo payload
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

    // Lấy token xác thực
    var authToken = getAuthorizationToken();
    if (!authToken) {
        console.log("Không lấy được token xác thực của Edge, thử lại...");
        // Nếu không lấy được token, xóa token cũ và thử lại
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
            // Trả về chuỗi văn bản thô
            return trans.trim();
        }
    }
    
    // Nếu có lỗi (ví dụ: token hết hạn), xóa token và thử lại
    console.log("Lỗi khi dịch bằng Edge (có thể do token hết hạn), đang thử lại...");
    localStorage.setItem("authorization", "");
    return edgeTranslateContent(text, from, to, retryCount + 1);
}

/**
 * Lấy token xác thực cho Microsoft Edge Translate.
 * @returns {string|null}
 */
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