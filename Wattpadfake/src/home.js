function execute() {
    return Response.success([
        {title: "Cập nhật", input: "/", script: "up.js"},
        {title: "HOT new", input: "/", script: "up2.js"},
        {title: "danh sách HOT", input: "/danh-sach/truyen-hot/", script: "gen.js"},
    ]);
}