load('config.js');
function execute(url) {
    // --- Bắt đầu phần mã thêm vào ---
    let current_host = localStorage.getItem('vp_local_ip');
    if (!current_host) {
        current_host = BASE_URL; // Dùng địa chỉ mặc định nếu chưa có trong storage
    } else if (!current_host.startsWith('http')) {
        current_host = 'http://' + current_host; // Tự động thêm http:// nếu người dùng quên
    }
    // --- Kết thúc phần mã thêm vào ---

    url = url.replace(current_host, ""); // Xóa host cũ nếu có
    url = url.replace("/vBook/Book/", "");
    var page = [];
    page.push(current_host + "/api/file/list?path=%2FvBook%2FBook%2F" + url + "%2F&sort=modified&sort-reversed=false")
    return Response.success(page)
}