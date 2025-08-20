function execute(key, page) {
    if (page && page !== '1') {
        return Response.success([]);
    }

    var data = [];
    var userInput = key.trim();
    var keyPrefix = "gemini_key_";

    if (!userInput) {
        data.push({
            name: "Lệnh không hợp lệ",
            link: "info/invalid",
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
                    link: "info/syntax_error",
                    description: "Ví dụ đúng: delkey sk-Abc123XYZ",
                    host: "https://vbook.app"
                });
            } else {
                var storageKey = keyPrefix + keyToDelete;
                if (localStorage.getItem(storageKey) !== null) {
                    localStorage.removeItem(storageKey);
                    data.push({
                        name: "Đã xóa key thành công!",
                        link: "result/delete_ok",
                        description: keyToDelete,
                        host: "https://vbook.app"
                    });
                } else {
                    data.push({
                        name: "Không tìm thấy key để xóa",
                        link: "result/delete_not_found",
                        description: keyToDelete,
                        host: "https://vbook.app"
                    });
                }
            }
        } else {
            var keyToAdd = userInput;
            var storageKey = keyPrefix + keyToAdd;
            localStorage.setItem(storageKey, keyToAdd);
            data.push({
                name: "Đã lưu key thành công!",
                link: "result/add_ok",
                description: keyToAdd,
                host: "https://vbook.app"
            });
        }
    } catch (e) {
        data.push({
            name: "Lỗi thao tác với localStorage",
            link: "error/storage",
            description: e.toString(),
            host: "https://vbook.app"
        });
    }

    return Response.success(data);
}