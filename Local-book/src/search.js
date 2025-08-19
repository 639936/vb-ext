load('config.js');
function execute(key) {
    if (key) {
        // Lưu địa chỉ IP mới vào localStorage
        localStorage.setItem('vp_local_ip', key);

        // Trả về một kết quả duy nhất để thông báo thành công
        // Bạn có thể tùy chỉnh thông báo này
        var data = [{
            name: "Đã cập nhật IP thành công!",
            link: "http://localhost", // Link giả, không quan trọng
            description: "Địa chỉ mới là: " + key,
            host: "http://" + key
        }];
        return Response.success(data);
    }
    // Trả về mảng rỗng nếu không có key
    return Response.success([]);
}