
function execute() {
    return Response.success([
        {
            title: "DANH SÁCH KEY & HƯỚNG DẪN", // Đặt tiêu đề rõ ràng hơn
            input: "", // Input có thể là bất cứ gì, hoặc để trống
            script: "gen.js"
        }
    ]);
}