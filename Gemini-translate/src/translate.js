// translate.js
// Đã sửa đổi để sử dụng Google Gemini API và loại bỏ logic "auto"
load("language_list.js");

function execute(text, from, to, apiKey) {
    // Kiểm tra xem người dùng đã cung cấp API Key chưa.
    if (!apiKey) {
        return Response.error("Please provide Google AI API Key in settings.");
    }

    // Lấy tên ngôn ngữ đầy đủ để ra lệnh cho AI
    let fromLanguage = getLanguageName(from);
    let toLanguage = getLanguageName(to);

    // Xây dựng câu lệnh (prompt) cho AI, không còn trường hợp "auto"
    let prompt = `Translate the following text from ${fromLanguage} to ${toLanguage}. You are a professional translator of Chinese and English. Translate texts while ensuring the context, style, narrative perspective, and pronouns are preserved. Pay attention to the names of characters and the appropriateness of pronouns in the text. Provide ONLY the translated text, without any additional explanations or introductory phrases.\n\nText to translate:\n"""\n${text}\n"""`;

    // Địa chỉ API của Google Gemini
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;

    // Nội dung gửi đi cho API
    const requestBody = {
        "contents": [{"parts": [{"text": prompt}]}],
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    // Gửi yêu cầu tới Google API
    let response = fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
    });

    // Xử lý kết quả trả về
    if (response.ok) {
        let result = JSON.parse(response.text());
        try {
            let translatedText = result.candidates[0].content.parts[0].text;
            return Response.success(translatedText.trim());
        } catch (e) {
            let errorInfo = "AI did not return a valid translation.";
            if (result.candidates && result.candidates[0].finishReason) {
                errorInfo += " Reason: " + result.candidates[0].finishReason;
            }
            return Response.error(errorInfo);
        }
    } else {
        return Response.error("API Error: " + response.status + " " + response.text());
    }
}

// Hàm trợ giúp để chuyển mã ngôn ngữ ('vi') thành tên đầy đủ ('Vietnamese')
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