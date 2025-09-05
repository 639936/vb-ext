load('config.js');

function execute(url) {
    url = url.replace("/vBook/Book/", "");
    url = url.replace("http://localhost", "");
    var page = [];
    // URL đầu ra của page.js sẽ là đầu vào cho toc.js
    // Cấu trúc: [API_URL_để_lấy_danh_sách_chương]/[Tên_truyện_để_xây_dựng_lại_URL_chương]
    page.push(HOST + "/api/file/list?path=%2FvBook%2FBook%2F" + url + "%2F&sort=modified&sort-reversed=false" + "/" + url);
    return Response.success(page);
}