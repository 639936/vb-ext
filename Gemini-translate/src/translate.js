// translate.js
// PHIÊN BẢN MÔ PHỎNG CẤU TRÚC GỐC VỚI KEY GẮN CỨNG
load("language_list.js");

// ##################################################################
// ## BƯỚC 1: DÁN API KEY CỦA BẠN VÀO ĐÂY ##
// ##################################################################
// Lấy key từ: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = "DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY";
// ##################################################################


// Hàm execute được gọi bởi ứng dụng.
// Tham số apiKey không còn nữa vì chúng ta đã khai báo ở trên.
function execute(text, from, to) {
    // Gọi hàm dịch thuật chính, giữ nguyên cấu trúc này
    return translateContent(text, from, to, 0);
}

// Hàm dịch thuật chính, giữ lại cấu trúc có retry (thử lại)
function translateContent(text, from, to, retryCount) {
    if (retryCount > 2) {
        return Response.error("Failed to translate after 3 attempts.");
    }

    // LƯU Ý: logic tách dòng của file gốc được giữ lại.
    // Tuy nhiên, Gemini API dịch tốt nhất cả một khối văn bản lớn.
    // Việc dịch từng dòng riêng lẻ có thể làm mất ngữ cảnh và chậm hơn.
    // Nhưng chúng ta giữ lại logic này để đảm bảo tương thích tối đa.
    let lines = text.split('\n');

    let translatedLines = [];
    for (var i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.trim() === "") {
            translatedLines.push(""); // Giữ lại các dòng trống
            continue;
        }

        // Dịch từng dòng
        let translatedLine = translateSingleLine(line, from, to);
        
        if (translatedLine.startsWith("Error:")) {
            // Nếu một dòng bị lỗi, thử lại toàn bộ tác vụ
            return translateContent(text, from, to, retryCount + 1);
        }
        translatedLines.push(translatedLine);
    }
    
    // Ghép các dòng đã dịch lại với nhau
    return Response.success(translatedLines.join('\n'));
}

// Hàm mới để dịch một dòng duy nhất (giúp code gọn gàng hơn)
function translateSingleLine(line, from, to) {
    let fromLanguage = getLanguageName(from);
    let toLanguage = getLanguageName(to);

    // Prompt chi tiết của bạn, áp dụng cho từng dòng
    let prompt = `Translate the following text from ${fromLanguage} to ${toLanguage}. You are a professional translator of Chinese and English. Translate texts while ensuring the context, style, narrative perspective, and pronouns are preserved. Pay attention to the names of characters and the appropriateness of pronouns in the text. Provide ONLY the translated text, without any additional explanations or introductory phrases.\n\nText to translate:\n"""\n${line}\n"""`;

    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + getApiKey();
    
    const requestBody = {
        "contents": [{"parts": [{"text": prompt}]}],
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };
    
    try {
        let response = fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            let result = JSON.parse(response.text());
            return result.candidates[0].content.parts[0].text.trim();
        } else {
            return "Error: API call failed.";
        }
    } catch (e) {
        return "Error: Exception during fetch.";
    }
}

// Hàm này mô phỏng hàm getAuthorizationToken() của file gốc.
// Thay vì lấy token tạm thời, nó chỉ đơn giản là trả về API key đã được khai báo.
// Việc giữ lại cấu trúc này có thể quan trọng đối với ứng dụng.
function getApiKey() {
    // Thay vì dùng localStorage, ta trả về key đã khai báo cứng.
    // Đây là "bộ lưu trữ cục bộ" mà bạn yêu cầu, theo một cách đơn giản nhất.
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY") {
        return GEMINI_API_KEY;
    }
    // Nếu key chưa được dán vào, trả về null để gây lỗi, báo cho người dùng biết.
    return null; 
}


// Hàm trợ giúp để chuyển mã ngôn ngữ, giữ nguyên
function getLanguageName(id) {
    const languageMap = {
        'af': 'Afrikaans', 'sq': 'Albanian', 'ar': 'Arabic', 'hy': 'Armenian',
        'az': 'Azerbaijani', 'eu': 'Basque', 'be': 'Belarusian', 'bn': 'Bengali', 'bs': 'Bosnian',
        'bg': 'Bulgarian', 'ca': 'Catalan', 'zh-Hans': 'Simplified Chinese', 'zh-Hant': 'Traditional Chinese',
        'hr': 'Croatian', 'cs': 'Czech', 'da': 'Danish', 'nl': 'Dutch', 'en': 'English', 'et': 'Estonian',
        'fj': 'Fijian', 'fil': 'Filipino', 'fi': 'Finnish', 'fr': 'French', 'ka': 'Georgian', 'de': 'German',
        'el': 'Greek', 'gu': 'Gujarati', 'ht': 'Haitian Creole', 'he': 'Hebrew', 'hi': 'Hindi', 'hu': 'Hungarian',
        'is': 'Icelandic', 'id': 'Indonesian', 'ga': 'Irish', 'it': 'Italian', 'ja': 'Japanese', 'kn': 'Kannada',
        'kk': 'Kazakh', 'ko': 'Korean', 'lv': 'Latvian', 'lt': 'Lithuanian', 'mk': 'Macedonian', 'ms': 'Malay',
        'ml': 'Malayalam', 'mt': 'Maltese', 'mi': 'Maori', 'mr': 'Marathi', 'mn': 'Mongolian', 'ne': 'Nepali',
        'nb': 'Norwegian', 'fa': 'Persian', 'pl': 'Polish', 'pt': 'Portuguese', 'pa': 'Punjabi', 'ro': 'Romanian',
        'ru': 'Russian', 'sm': 'Samoan', 'sr-Cyrl': 'Serbian (Cyrillic)', 'sr-Latn': 'Serbian (Latin)',
        'sk': 'Slovak', 'sl': 'Slovenian', 'es': 'Spanish', 'sw': 'Swahili', 'sv': 'Swedish', 'ta': 'Tamil',
        'te': 'Telugu', 'th': 'Thai', 'tr': 'Turkish', 'uk': 'Ukrainian', 'ur': 'Urdu', 'uz': 'Uzbek',
        'vi': 'Vietnamese', 'cy': 'Welsh', 'yua': 'Yucatec Maya', 'zu': 'Zulu'
    };
    return languageMap[id] || 'English';
}