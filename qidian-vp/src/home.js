function execute() {
    return Response.success([
        { title: "Đề cử", input: "https://qidian-vp.com/xep-hang/de-cu", script: "gen.js" },
        { title: "Lượt đọc", input: "https://qidian-vp.com/xep-hang/luot-doc", script: "gen.js" },
        { title: "Truyện mới cập nhật", input: "https://qidian-vp.com/danh-sach/truyen-moi", script: "gen.js" },
        { title: "Truyện hoàn thành", input: "https://qidian-vp.com/danh-sach/truyen-hoan-thanh", script: "gen.js" },
        /*{ title: "Đọc gần đây", input: "https://qidian-vp.com/lich-su", script: "ls.js" },*/
        { title: "Tin tức truyện", input: "https://qidian-vp.com/tin-tuc", script: "new.js" },
        { title: "Truyện tạm ngưng", input: "https://qidian-vp.com/danh-sach/truyen-tam-ngung", script: "gen.js" },
    ]);
}
