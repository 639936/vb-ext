load('config.js');

function execute() {
    return Response.success([
        {title: "Mới cập nhật", input: BASE_URL, script: "up1.js"},
        {title: "Truyện sex ngắn", input: BASE_URL + "/truyen-sex-ngan", script: "up3.js"},
        {title: "Truyện sex dài tập", input: BASE_URL + "/truyen-sex-dai-tap", script: "up3.js"},
        {title: "Top 300 truyện ngắn được đọc nhiều nhất", input: BASE_URL + "/top-300-truyen-ngan-duoc-doc-nhieu-nhat", script: "up2.js"},
        {title: "Top 1000 truyện sex được đọc nhiều nhất", input: BASE_URL + "/top-1000-truyen-sex-duoc-doc-nhieu-nhat", script: "up2.js"},
        {title: "Top tác giả tài năng", input: BASE_URL, script: "up4.js"}
    ])
}