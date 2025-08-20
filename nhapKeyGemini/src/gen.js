
function execute(url, page) {
    var data = []; 
    // Key duy nhất để lưu trữ toàn bộ danh sách API keys
    var storageKey = "vbook_gemini_keys_list";

    // Hướng dẫn sử dụng không thay đổi
    data.push({ name: "--- HƯỚNG DẪN SỬ DỤNG ---", link: "guide/1" });
    data.push({ name: "Thêm key: Dùng chức năng TÌM KIẾM, nhập API key rồi tìm.", link: "guide/2" });
    data.push({ name: "Xóa key: Dùng TÌM KIẾM, nhập 'delkey [API key]'.", link: "guide/3" });
    data.push({ name: "--- DANH SÁCH KEY ĐÃ LƯU ---", link: "guide/4" });

    try {
        // Đọc chuỗi chứa tất cả các key
        var keysString = localStorage.getItem(storageKey);
        
        // Tách chuỗi thành mảng, nếu chuỗi rỗng hoặc không tồn tại thì mảng cũng rỗng
        var existingKeys = (keysString && keysString.trim() !== "") ? keysString.split('\n') : [];

        if (existingKeys.length === 0) {
            data.push({
                name: "(Chưa có key nào được lưu)",
                link: "info/no_keys"
            });
        } else {
            existingKeys.forEach(function(key) {
                if (key.trim() !== "") { // Đảm bảo không hiển thị các dòng trống
                    data.push({
                        name: key,
                        link: encodeURIComponent(key) 
                    });
                }
            });
        }
    } catch (e) {
        data.push({
            name: "Lỗi khi đọc localStorage",
            link: "error/" + encodeURIComponent(e.toString())
        });
    }

    return Response.success(data);
}