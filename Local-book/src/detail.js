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
    url = url.replace("/vBook/Book/", "");
    url = url.replace("http://localhost", "");
    var response = fetch(current_host + "/vbook/Book/" + url);
    if (response.ok) {
        var doc = response.html();
        return Response.success({
                name: doc.select("#path").text().replace("/vBook/Book/", ""),
                });
    }
    else
    return Response.success({name: url})
}