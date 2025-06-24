function execute() {
    return Response.success([
        {title: "Mới cập nhật", input: "/", script: "gen.js"},
        {title: "Truyện sex ngắn", input: "/truyen-sex-ngan", script: "gen.js"},
        {title: "Truyện sex dài tập", input: "/truyen-sex-dai-tap", script: "gen.js"},
        {title: "Top 300 truyện ngắn được đọc nhiều nhất", input: "/top-300-truyen-ngan-duoc-doc-nhieu-nhat", script: "gen.js"},
        {title: "Top 1000 truyện sex được đọc nhiều nhất", input: "/top-1000-truyen-sex-duoc-doc-nhieu-nhat", script: "gen.js"},
        {title: "Top tác giả tài năng", input: "https://truyensextv2.cc", script: "tg.js"},
    ]);
}