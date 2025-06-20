function execute() {
    return Response.success([
        {title: "Truyện Mới Cập Nhật", input: "/", script: "up.js"},
        {title: "Truyện hot", input: "/", script: "up2.js"},
        {title: "TOP Truyện Đề Cử", input: "/danh-sach/truyen-hot/", script: "gen.js"},
        {title: "TOP Truyện Đề Cử", input: "/danh-sach/truyen-hot/", script: "gen.js"}
    ]);
}