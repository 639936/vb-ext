
function execute(url) {
    // url nhận vào là link từ gen.js (chính là API key đã được encode)
    // Chúng ta chỉ cần trả về tên để Vbook hiển thị và tiếp tục luồng
    var keyName = decodeURIComponent(url);

    return Response.success({
        name: keyName,
    });
}