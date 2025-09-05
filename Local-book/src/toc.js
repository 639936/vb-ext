load('config.js');

function execute(urlinput) {
    // 1. Tìm vị trí (index) của dấu '/' cuối cùng trong chuỗi
    const lastSlashIndex = urlinput.lastIndexOf('/');

    // 2. Tách chuỗi và xử lý logic bên trong khối if như yêu cầu
    if (lastSlashIndex !== -1) {
        // Phần 1: Lấy từ đầu chuỗi đến ngay trước dấu '/' cuối cùng (URL API)
        const part1 = urlinput.substring(0, lastSlashIndex);

        // Phần 2: Lấy từ sau dấu '/' cuối cùng cho đến hết chuỗi (Tên truyện)
        const part2 = urlinput.substring(lastSlashIndex + 1);

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
                        // Sử dụng biến HOST toàn cục và part2 để xây dựng lại URL chương
                        url: HOST + "/vBook/Book/" + part2 + "/" + encodeURIComponent(item.name),
                    });
                }
            });
            return Response.success(data);
        } else {
            // Trả về lỗi nếu không fetch được API
            return Response.error("Failed to fetch: " + part1);
        }
    } else {
        // Trả về lỗi nếu định dạng urlinput không đúng
        return Response.error("Invalid input URL format: " + urlinput);
    }
}