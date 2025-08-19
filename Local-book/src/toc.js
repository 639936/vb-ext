load('config.js');
function execute(url,name) {
    // --- Bắt đầu phần mã thêm vào ---
    let current_host = localStorage.getItem('vp_local_ip');
    if (!current_host) {
        current_host = BASE_URL; // Dùng địa chỉ mặc định nếu chưa có trong storage
    } else if (!current_host.startsWith('http')) {
        current_host = 'http://' + current_host; // Tự động thêm http:// nếu người dùng quên
    }
    // --- Kết thúc phần mã thêm vào ---
    var response = fetch(url, {
        method: "GET"
    });

    if (response.ok) {
        let jsonList = response.json(); 
        var data = [];
        jsonList.forEach(item => {
            if (item.directory === false && item.name !== "..") {
                data.push({
                    name: item.name.replace(/\.html/gi, ""),
                    url: current_host + "/vBook/Book/" + name + "/" + encodeURIComponent(item.name),
                });
            }
        });
        return Response.success(data);
    } else {
         return Response.success([{
             name: url,
             url: url
         }])
    }
}