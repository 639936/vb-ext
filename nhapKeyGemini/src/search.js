
function execute(key) {


    var data = [];
    var userInput = key.trim();
    // Key duy nhất để lưu trữ toàn bộ danh sách API keys
    var storageKey = "vbook_gemini_keys_list"; 

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
        // Luôn đọc danh sách key hiện có
        var keysString = localStorage.getItem(storageKey) || "";
        var keysArray = (keysString && keysString.trim() !== "") ? keysString.split('\n') : [];

        if (userInput.startsWith("delkey ")) {
            var keyToDelete = userInput.substring(7).trim();
            if (!keyToDelete) {
                // ... xử lý lỗi cú pháp
            } else {
                var initialLength = keysArray.length;
                // Lọc ra một mảng mới không chứa key cần xóa
                keysArray = keysArray.filter(function(k) { return k !== keyToDelete; });

                if (keysArray.length < initialLength) {
                    // Nối lại mảng và lưu lại
                    localStorage.setItem(storageKey, keysArray.join('\n'));
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
        } else { // Lệnh thêm key
            var keyToAdd = userInput;
            
            // Kiểm tra để không thêm key trùng lặp
            if (keysArray.indexOf(keyToAdd) === -1) {
                keysArray.push(keyToAdd);
                // Nối lại mảng và lưu lại
                localStorage.setItem(storageKey, keysArray.join('\n'));
                data.push({
                    name: "Đã lưu key thành công!",
                    link: "result/add_ok",
                    description: keyToAdd,
                    host: "https://vbook.app"
                });
            } else {
                data.push({
                    name: "Key này đã tồn tại!",
                    link: "result/add_exists",
                    description: keyToAdd,
                    host: "https://vbook.app"
                });
            }
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