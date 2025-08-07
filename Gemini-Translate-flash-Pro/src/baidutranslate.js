// Baidutranslate.js (Phiên bản Thư viện - Đã sửa lỗi Parse JSON)
// File này không còn là một plugin độc lập.

// Bản đồ ngôn ngữ để chuyển đổi mã chuẩn sang mã mà Baidu API yêu cầu.
var languageMap = {
    "auto": "auto",
    "zh": "zh",
    "en": "en",
    "vi": "vie"
};

/**
 * Dịch văn bản bằng Baidu Translate.
 * @param {string} text - Văn bản cần dịch.
 * @param {string} from - Ngôn ngữ nguồn.
 * @param {string} to - Ngôn ngữ đích.
 * @param {number} retryCount - Số lần đã thử lại.
 * @returns {Response|null}
 */
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
        qcSettings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
        var parts = resultText.split("\n");
        var trans = "";

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part.startsWith("data")) {
                try {
                    var obj = JSON.parse(part.substring(part.indexOf("{")));
                    
                    // --- ĐÂY LÀ PHẦN SỬA LỖI QUAN TRỌNG ---
                    // Kiểm tra xem obj.data và các thuộc tính cần thiết có tồn tại không trước khi truy cập
                    if (obj && obj.data && obj.data.event === "Translating" && obj.data.list) {
                        var rData = obj.data.list;
                        for (var j = 0; j < rData.length; j++) {
                            var item = rData[j];
                            if (item && item.dst) { // Thêm một lớp kiểm tra nữa cho chắc
                                trans += item.dst + "\n";
                            }
                        }
                    }
                    // Nếu không phải event "Translating" hoặc cấu trúc khác, chúng ta sẽ bỏ qua nó một cách an toàn.
                    // --- KẾT THÚC PHẦN SỬA LỖI ---

                } catch (e) {
                    console.log("Lỗi parse JSON trong Baidu (dòng bị bỏ qua): " + e.toString());
                }
            }
        }
        return Response.success(trans.trim());
    }

    return baiduTranslateContent(text, from, to, retryCount + 1);
}

/**
 * Phát hiện ngôn ngữ của một đoạn văn bản ngắn.
 * @param {string} text - Văn bản cần kiểm tra.
 * @returns {string} - Mã ngôn ngữ được phát hiện.
 */
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
    return "auto"; // Trả về auto nếu không phát hiện được
}