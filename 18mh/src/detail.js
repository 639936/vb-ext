load('config.js');

function execute(url) {
    // Đảm bảo URL luôn đúng domain
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);

    if (response.ok) {
        let doc = response.html();
        let name = doc.select('.items-center  h1').text();
        let author = doc.select('.ml-3 .text-primary').first().text();
        let originalCoverUrl = doc.select('div.flex-1 > div.flex.items-center img').attr('data-src');

        // Tạo link ảnh mới, trỏ đến proxy Vercel của bạn
        let finalCoverUrl = `${VERCEL_PROXY_URL}/api/image?url=${encodeURIComponent(originalCoverUrl)}`;

        return Response.success({
            name: name,
            cover: finalCoverUrl,
            author: author,
            description: doc.select('meta[name="description"]').attr('content'),
            host: BASE_URL
        });
    }
    return null;
}