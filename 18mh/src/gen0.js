load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let currentUrl = BASE_URL + url;
    let response = fetch(currentUrl);

    if (response.ok) {
        let doc = response.html();
        var data = [];
        let content = doc.select(".index-content section").first();
        content.select("li").forEach(e => {
            let a = e.select("a").first();
            let originalCoverUrl = a.select("img").attr("data-src");

            // Tạo link ảnh mới, trỏ đến proxy Vercel của bạn
            // encodeURIComponent là bắt buộc để xử lý các ký tự đặc biệt trong URL
            let finalCoverUrl = `${VERCEL_PROXY_URL}/api/image?url=${encodeURIComponent(originalCoverUrl)}`;

            data.push({
                name: e.select(".text-default").text().trim(),
                link: a.attr("href"),
                cover: finalCoverUrl, // <-- Truyền thẳng URL mới này cho Vbook
                host: BASE_URL
            });
        });
        return Response.success(data);
    }
    return null;
}