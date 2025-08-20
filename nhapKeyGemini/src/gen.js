function execute(url, page) {
    var data = [];
    var keyPrefix = "gemini_key_";
    data.push({
        name: "--- HƯỚNG DẪN ---",
        link: "guide/1" // Link giả để không bị lỗi khi click
    });
    data.push({
        name: "Thêm key: Dùng chức năng TÌM KIẾM, nhập API key rồi tìm.",
        link: "guide/2"
    });
    data.push({
        name: "Xóa key: Dùng TÌM KIẾM, nhập 'delkey [API key]'.",
        link: "guide/3"
    });
     data.push({
        name: "--- DANH SÁCH KEY ĐÃ LƯU ---",
        link: "guide/4"
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
                name: "(Chưa có key nào được lưu)",
                link: "info/no_keys"
            });
        } else {
            // Hiển thị mỗi key như một "quyển sách"
            existingKeys.forEach(function(key) {
                data.push({
                    name: key,
                    link: encodeURIComponent(key) 
                });
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