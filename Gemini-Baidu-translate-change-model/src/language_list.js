let languages = [
    {"id": "gemini-2.0-flash-001", "name": "Model: 2.0 Flash gemini-2.0-flash-001"},
    {"id": "gemini-2.0-flash-lite-001", "name": "Model: 2.0 Flash-lite gemini-2.0-flash-lite-001"},
    {"id": "gemini-2.0-flash-exp", "name": "Model: 2.0 Flash Exp gemini-2.0-flash-exp"},
    {"id": "gemini-2.0-flash-thinking-exp-01-21", "name": "2.0 thinking gemini-2.0-flash-thinking-exp-01-21"},
    {"id": "gemini-2.5-pro", "name": "Model: 2.5 Pro gemini-2.5-pro"},
    {"id": "gemini-2.5-flash-preview-05-20", "name": "Model: 2.5 Flash Preview gemini-2.5-flash-preview-05-20"},
    {"id": "gemini-2.5-flash", "name": "Model: 2.5 Flash gemini-2.5-flash"},
    {"id": "gemini-2.5-flash-lite", "name": "Model: 2.5 Flash Lite gemini-2.5-flash-lite"},
    {"id": "zh", "name": "Trung"},
    {"id": "en", "name": "Anh"},
    {"id": "vi", "name": "Việt"},
    {"id": "vb_prompt_tieuchuan", "name": "Tiêu chuẩn"},
    {"id": "vb_prompt_NameEng", "name": "Name English"},
    {"id": "vb_prompt_sac", "name": "Truyện Sắc"},
    {"id": "vb_prompt_vietlai", "name": "Viết Lại Convert"},
    {"id": "vb_prompt_xoacache", "name": "Xóa Cache Chương Này"}
];
/**
 * Hàm chuẩn hóa văn bản để tạo ID.
 * Bỏ dấu tiếng Việt, thay thế khoảng trắng bằng dấu gạch dưới, và chuyển thành chữ thường.
 * @param {string} text - Văn bản đầu vào.
 * @returns {string} - Văn bản đã được chuẩn hóa.
 */
function normalizeTextForId(text) {
    if (!text) return "";
    // Dùng normalize để tách dấu và chữ, sau đó xóa các ký tự dấu
    let normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Xử lý riêng chữ 'đ'
    normalized = normalized.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    // Thay thế khoảng trắng bằng dấu gạch dưới và chuyển sang chữ thường
    return normalized.replace(/\s+/g, '_').toLowerCase();
}

// Logic để thêm các prompt tùy chỉnh từ config vào danh sách languages
try {
    // Kiểm tra xem biến listprompts có tồn tại và có giá trị không
    if (typeof listprompts !== 'undefined' && listprompts) {
        // Xóa dấu ngoặc kép bao quanh chuỗi, tương tự logic của modelsavecache
        var clean_listprompts = listprompts.replace(/^"([\s\S]*)"$/, "$1");

        // Tách chuỗi thành mảng các dòng, loại bỏ các dòng trống
        var promptNames = (clean_listprompts || "").split('\n')
            .map(function(item) { return item.trim(); }) // Xóa khoảng trắng thừa ở đầu và cuối mỗi dòng
            .filter(function(item) { return item !== ""; }); // Lọc bỏ các dòng rỗng

        // Lặp qua danh sách tên prompt và thêm vào mảng languages
        promptNames.forEach(function(name) {
            // Tạo ID bằng cách chuẩn hóa tên prompt
            var id = "vb_prompt_" + normalizeTextForId(name);
            
            // Thêm đối tượng mới vào mảng languages
            languages.push({
                "id": id,
                "name": name
            });
        });
    }
} catch (e) {
    // Bỏ qua lỗi nếu có sự cố xảy ra để không làm ảnh hưởng đến các ngôn ngữ mặc định.
    // Bạn có thể thêm log lỗi ở đây nếu engine hỗ trợ.
}