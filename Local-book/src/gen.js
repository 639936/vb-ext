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

    var response = fetch(current_host + "/api/file/list?path=%2FvBook%2FBook&sort=modified&sort-reversed=false", {
        method: "GET"
    });

    if (response.ok) {
        let jsonList = response.json(); 
        var data = [];
        jsonList.forEach(item => {
            if (item.directory === true && item.name !== "..") {
                data.push({
                    name: item.name,
                    link: encodeURIComponent(item.name)
                });
            }
        });
        return Response.success(data);
    }
    return null
}