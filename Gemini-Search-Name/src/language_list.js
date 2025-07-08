// Danh sách ngôn ngữ nguồn (hiển thị trong menu "From")
const sourceLanguages = [
    {"id": "zh", "name": "Tiếng Trung"},
    {"id": "en", "name": "Tiếng Anh"},
    {"id": "vi", "name": "Tiếng Việt"}
];

// Danh sách các "Chế độ dịch" (hiển thị trong menu "To")
// 'id' là giá trị sẽ được truyền vào biến 'to' trong script
// 'name' là tên bạn sẽ nhìn thấy trên giao diện
const targetModes = [
    {"id": "vi-general", "name": "Tiếng Việt (Phổ thông)"},
    {"id": "vi-tienhiep", "name": "Tiếng Việt (Tiên Hiệp)"},
    {"id": "vi-huyenhuyen", "name": "Tiếng Việt (Huyền Huyễn)"},
    {"id": "vi-dothi", "name": "Tiếng Việt (Đô Thị Hiện Đại)"},
    {"id": "vi-sac", "name": "Tiếng Việt (Sắc Hiệp)"},
    {"id": "vi-trinhtham", "name": "Tiếng Việt (Trinh Thám)"},
    {"id": "vi-analyzer", "name": "Chế độ (Phân tích Tên/VP/Luật)"} // Chế độ bạn yêu cầu ở câu hỏi trước
];