// google_language_list.js
// Danh sách ngôn ngữ để hiển thị trong UI. Gemini hỗ trợ nhiều hơn thế.
// 'id' là mã ISO 639-1, 'name' là tên đầy đủ để ra lệnh cho AI.
let languages = [
    { "id": "auto", "name": "Auto Detect" }, // Tự động phát hiện
    { "id": "vi", "name": "Vietnamese" },
    { "id": "en", "name": "English" },
    { "id": "zh-Hans", "name": "Simplified Chinese" },
    { "id": "ja", "name": "Japanese" },
    { "id": "ko", "name": "Korean" },
    { "id": "fr", "name": "French" },
    { "id": "de", "name": "German" },
    { "id": "ru", "name": "Russian" },
    { "id": "es", "name": "Spanish" },
    { "id": "th", "name": "Thai" },
    { "id": "id", "name": "Indonesian" },
    { "id": "ms", "name": "Malay" },
    { "id": "lo", "name": "Lao" },
    { "id": "km", "name": "Khmer" },
    { "id": "my", "name": "Burmese" }
];

// Hàm trợ giúp để lấy tên ngôn ngữ từ mã id
function getLanguageName(id) {
    for (var i = 0; i < languages.length; i++) {
        if (languages[i].id === id) {
            return languages[i].name;
        }
    }
    return "English"; // Mặc định là tiếng Anh nếu không tìm thấy
}