// translate.js
// GIỮ NGUYÊN CẤU TRÚC GỐC, THAY THẾ LÕI API BẰNG GOOGLE GEMINI
load("language_list.js");
load("api.js");

// Hàm execute() được giữ nguyên để gọi hàm chính
function execute(text, from, to) {
    // Gọi hàm dịch thuật chính, bắt đầu với số lần thử là 0
    return translateContent(text, from, to, apiKey, 0);
}

// Hàm dịch thuật chính, giữ lại cấu trúc có retry (thử lại)
function translateContent(text, from, to, apiKey, retryCount) {
    // 1. Giữ nguyên cơ chế thử lại: Nếu thất bại quá 2 lần thì dừng
    if (retryCount > 2) {
        return Response.error("Failed to translate after 3 attempts.");
    }

    // 2. Kiểm tra API Key (logic mới)
    if (!apiKey) {
        return Response.error("Please provide Google AI API Key in settings.");
    }

    // 3. Lấy tên ngôn ngữ đầy đủ (logic mới)
    let fromLanguage = getLanguageName(from);
    let toLanguage = getLanguageName(to);

    // 4. Xây dựng prompt chi tiết theo yêu cầu của bạn (logic mới)
    let prompt = `Translate the following text from ${fromLanguage} to ${toLanguage}. You are a professional translator of Chinese and English. Translate texts while ensuring the context, style, narrative perspective, and pronouns are preserved. Pay attention to the names of characters and the appropriateness of pronouns in the text. Provide ONLY the translated text, without any additional explanations or introductory phrases.\n\nText to translate:\n"""\n${text}\n"""`;

    // 5. Chuẩn bị gọi API (logic mới)
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;
    const requestBody = {
        "contents": [{"parts": [{"text": prompt}]}],
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    // 6. Gửi yêu cầu fetch (giữ nguyên phương thức, thay đổi nội dung)
    let response = fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
    });

    // 7. Xử lý kết quả trả về
    if (response.ok) {
        // Nếu thành công, xử lý JSON của Gemini
        let result = JSON.parse(response.text());
        try {
            let translatedText = result.candidates[0].content.parts[0].text;
            // Trả về thành công, cấu trúc này ứng dụng sẽ hiểu
            return Response.success(translatedText.trim());
        } catch (e) {
            // Trường hợp Gemini trả về kết quả nhưng không có nội dung dịch (bị chặn,...)
            // Thử lại lần nữa
            return translateContent(text, from, to, apiKey, retryCount + 1);
        }
    }

    // Nếu response không ok (lỗi mạng, sai key...), tiến hành thử lại
    // Đây là logic cốt lõi của file gốc, ta giữ lại nó
    return translateContent(text, from, to, apiKey, retryCount + 1);
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