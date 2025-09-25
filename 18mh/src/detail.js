load('config.js');

function execute(url) {
    // Đảm bảo URL luôn đúng domain
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);

    if (response.ok) {
        let doc = response.html();
        let name = doc.select('.items-center  h1').text();
        let author = doc.select('.ml-3 .text-primary').first().text().replace('作者：', '').trim();
        let originalCoverUrl = doc.select('div.flex-1 > div.flex.items-center img').attr('data-src');
        let genres = [];
        doc.select('.app-content .mb-2').first().select("a").forEach(e => {
            e.select("b").remove();
            genres.push({
                title: e.text(),
                input: BASE_URL + e.attr('href'),
                script: "gen.js"
            });        })
        // Tạo link ảnh mới, trỏ đến proxy Vercel của bạn
        let finalCoverUrl = `${VERCEL_PROXY_URL}/api/image?url=${encodeURIComponent(originalCoverUrl)}`;

        return Response.success({
            name: name,
            cover: finalCoverUrl,
            author: author,
            description: doc.select('meta[name="description"]').attr('content'),
            genres: genres,
            host: BASE_URL
        });
    }
    return null;
}