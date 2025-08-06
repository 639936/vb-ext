load('config.js');

function execute(url, page) {
    // 1. KIỂM TRA ĐÂY CÓ PHẢI LÀ LẦN GỌI ĐẦU TIÊN KHÔNG?
    // Nếu 'page' không được cung cấp (null hoặc undefined), thì đây là lần đầu.
    if (!page) {
        // Lấy tài liệu từ URL gốc mà app cung cấp
        let response = fetch(url);
        if (response.ok) {
            let doc = response.html();
            // Lấy ra newUrl từ <select>
            let newUrl = doc.select("select option").first().attr("value");
            // Xử lý chuỗi để có được URL cơ sở cho việc lật trang
            // Gán lại giá trị cho biến 'url' để phần code bên dưới sử dụng
            url = newUrl.match(/(.*_)/)[0];
            // Đặt trang hiện tại là trang 1
            page = '1';
        } else {
            // Nếu không fetch được URL gốc, dừng lại
            return null;
        }
    }
    // 2. LOGIC CHUNG CHO VIỆC TẢI TRANG (DÙNG CHO CẢ LẦN ĐẦU VÀ LẬT TRANG)
    // Tại đây, 'url' luôn là url cơ sở (ví dụ: .../book/15261_)
    // và 'page' luôn có giá trị (ví dụ: '1', '2', '3'...)
    let fullUrl = BASE_URL + url + page + ".html"; // Không cần BASE_URL nếu 'url' đã là URL đầy đủ
    let response = fetch(fullUrl);

    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".mod.block.book-all-list ul li").forEach(e => {
            data.push({
                name: e.select("a.name").text(),
                link: e.select(".info a").attr("href"),
                description: e.select(".info").text(),
                host: BASE_URL
            });
        });

        // Tính toán trang tiếp theo để app có thể gọi lần nữa
        let nextPage = parseInt(page) + 1;

        // Trả về dữ liệu của trang hiện tại và số của trang tiếp theo
        return Response.success(data, nextPage.toString());
    }

    return null;
}