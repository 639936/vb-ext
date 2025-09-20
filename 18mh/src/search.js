load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    let currentUrl = BASE_URL + "/novel/all?key_word=" + encodeURIComponent(key) + "&page=" + page;
    let response = fetch(currentUrl, header);

    if (response.ok) {
        let doc = response.html();
        var data = [];

        doc.select(".index-content li").forEach(e => {
            let a = e.select("a").first();
            let originalCoverUrl = a.select("img").attr("data-src");

            // Tạo link ảnh mới, trỏ đến proxy Vercel của bạn
            // encodeURIComponent là bắt buộc để xử lý các ký tự đặc biệt trong URL
            let finalCoverUrl = `${VERCEL_PROXY_URL}/api/image?url=${encodeURIComponent(originalCoverUrl)}`;

            data.push({
                name: e.select(".dx-title").text().replace(e.select(".dx-title span").text(), "").trim(),
                link: a.attr("href"),
                cover: finalCoverUrl, // <-- Truyền thẳng URL mới này cho Vbook
                host: BASE_URL
            });
        });

        let next = (parseInt(page) + 1).toString();
        return Response.success(data, next);
    }
    return null;
}