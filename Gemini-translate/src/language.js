// google_language.js
load("google_language_list.js");

function execute() {
    // Trả về danh sách ngôn ngữ không bao gồm "Auto Detect" để người dùng chọn
    let displayLanguages = languages.filter(lang => lang.id !== 'auto');
    return Response.success(displayLanguages);
}