
function execute(key) {

    var data = []; // Mảng kết quả trả về
    var userInput = key.trim();
    var keyPrefix = "gemini_key_";

    if (!userInput) {
        data.push({
            name: "Lệnh không hợp lệ",
            link: "https://vbook.app",
            description: "Vui lòng nhập API key hoặc lệnh xóa vào ô tìm kiếm.",
            host: "https://vbook.app"
        });
        return Response.success(data);
    }

    try {
        if (userInput.startsWith("delkey ")) {
            var keyToDelete = userInput.substring(7).trim();
            if (!keyToDelete) {
                data.push({
                    name: "Cú pháp xóa không hợp lệ",
                    link: "https://vbook.app",
                    description: "Ví dụ đúng: delkey sk-Abc123XYZ",
                    host: "https://vbook.app"
                });
            } else {
                var storageKey = keyPrefix + keyToDelete;
                if (localStorage.getItem(storageKey) !== null) {
                    localStorage.removeItem(storageKey);
                    data.push({
                        name: "Đã xóa key thành công!",
                        link: "https://vbook.app",
                        description: keyToDelete,
                        host: "https://vbook.app"
                    });
                } else {
                    data.push({
                        name: "Không tìm thấy key để xóa",
                        link: "https://vbook.app",
                        description: keyToDelete,
                        host: "https://vbook.app"
                    });
                }
            }
        } else {
            // Lệnh thêm key
            var keyToAdd = userInput;
            var storageKey = keyPrefix + keyToAdd;
            localStorage.setItem(storageKey, keyToAdd);

            data.push({
                name: "Đã lưu key thành công!",
                link: "https://vbook.app",
                description: keyToAdd,
                host: "https://vbook.app"
            });
        }
    } catch (e) {
        data.push({
            name: "Lỗi thao tác với localStorage",
            link: "https://vbook.app",
            description: e.toString(),
            host: "https://vbook.app"
        });
    }

    // Chỉ trả về kết quả, không có trang tiếp theo
    return Response.success(data);
}