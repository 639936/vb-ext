load('config.js');
function execute(urlinput) {
    // 1. Tìm vị trí (index) của dấu '/' cuối cùng trong chuỗi
    const lastSlashIndex = urlinput.lastIndexOf('/');

    // 2. Tách chuỗi
    if (lastSlashIndex !== -1) {
        // Phần 1: Lấy từ đầu chuỗi đến ngay trước dấu '/' cuối cùng
        const part1 = urlinput.substring(0, lastSlashIndex);

        // Phần 2: Lấy từ sau dấu '/' cuối cùng cho đến hết chuỗi
        const part2 = urlinput.substring(lastSlashIndex + 1);

        // In kết quả
        console.log("Phần 1:", part1); // Kết quả: http://abc.xyz/vBook/Book/tenchuong
        console.log("Phần 2:", part2); // Kết quả: stt
    }
    // --- Bắt đầu phần mã thêm vào ---
    let current_host = localStorage.getItem('vp_local_ip');
    if (!current_host) {
        current_host = BASE_URL; // Dùng địa chỉ mặc định nếu chưa có trong storage
    } else if (!current_host.startsWith('http')) {
        current_host = 'http://' + current_host; // Tự động thêm http:// nếu người dùng quên
    }
    // --- Kết thúc phần mã thêm vào ---
    var response = fetch(part1, {
        method: "GET"
    });

    if (response.ok) {
        let jsonList = response.json(); 
        var data = [];
        jsonList.forEach(item => {
            if (item.directory === false && item.name !== "..") {
                data.push({
                    name: item.name.replace(/\.html/gi, "").substring(0, 24),
                    url: current_host + "/vBook/Book/" + part2 + "/" + encodeURIComponent(item.name),
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