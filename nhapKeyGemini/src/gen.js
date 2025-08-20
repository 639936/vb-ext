
function execute(url) {
    // input và page không được sử dụng nhưng cần có trong định nghĩa hàm
    
    var data = []; // Mảng kết quả trả về
    var keyPrefix = "gemini_key_";

    // Thêm các dòng hướng dẫn vào đầu
    data.push({
        name: "--- HƯỚNG DẪN SỬ DỤNG ---",
        link: "https://vbook.app", // Link giả để không bị lỗi
        description: "1. Thêm key: Vào ô tìm kiếm và nhập API key của bạn rồi bấm tìm kiếm.",
        host: "https://vbook.app"
    });
    data.push({
        name: "2. Xóa key: Nhập 'delkey [API key]' vào ô tìm kiếm.",
        link: "https://vbook.app",
        description: "Ví dụ: delkey sk-Abc123XYZ",
        host: "https://vbook.app"
    });
    data.push({
        name: "---------------------------------",
        link: "https://vbook.app",
        description: "DANH SÁCH KEY ĐÃ LƯU:",
        host: "https://vbook.app"
    });

    try {
        var existingKeys = [];
        for (var i = 0; i < localStorage.length; i++) {
            var keyName = localStorage.key(i);
            if (keyName && keyName.startsWith(keyPrefix)) {
                existingKeys.push(localStorage.getItem(keyName));
            }
        }

        if (existingKeys.length === 0) {
            data.push({
                name: "Hiện tại không có API key nào được lưu.",
                link: "https://vbook.app",
                description: "Vui lòng sử dụng chức năng tìm kiếm để thêm key.",
                host: "https://vbook.app"
            });
        } else {
            // Hiển thị mỗi key trên một dòng riêng biệt
            existingKeys.forEach(function(key) {
                data.push({
                    name: key, // Tên item là chính API key
                    link: "https://vbook.app",
                    description: "Đây là một key đang được lưu trữ.",
                    host: "https://vbook.app"
                });
            });
        }
    } catch (e) {
        data.push({
            name: "Lỗi khi đọc localStorage",
            link: "https://vbook.app",
            description: e.toString(),
            host: "https://vbook.app"
        });
    }

    // Luôn trả về một mảng các đối tượng hợp lệ
    return Response.success(data);
}