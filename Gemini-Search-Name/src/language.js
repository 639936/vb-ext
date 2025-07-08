load("language_list.js");

function execute() {
    // Trả về một đối tượng chứa cả hai danh sách
    // Giả sử ứng dụng có thể xử lý việc này để điền vào hai menu khác nhau
    return Response.success({
        from: sourceLanguages,
        to: targetModes
    });
}