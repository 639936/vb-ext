load('config.js');
function execute(databxh) {
        let docbxh = Html.parse(databxh);
        let contentbxh = [];
        docbxh.select("li").forEach(e => {
            let a = e.select("a").first();
            let originalCoverUrl = a.select("img").attr("data-src");

            // Tạo link ảnh mới, trỏ đến proxy Vercel của bạn
            // encodeURIComponent là bắt buộc để xử lý các ký tự đặc biệt trong URL
            let finalCoverUrl = `${VERCEL_PROXY_URL}/api/image?url=${encodeURIComponent(originalCoverUrl)}`;

            contentbxh.push({
                name: e.select(".dx-title").text().replace(e.select(".dx-title span").text(), "").trim(),
                link: a.attr("href"),
                cover: finalCoverUrl, // <-- Truyền thẳng URL mới này cho Vbook
                host: BASE_URL
            });
        });
        return Response.success(contentbxh)
}