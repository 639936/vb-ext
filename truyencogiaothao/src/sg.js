load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".related-reading-wrap").forEach(e => {
            data.push({
                    name: e.select("h5 a").first().text(),
                    link: e.select("h5 a").first().attr("href"),
                    cover: e.select("img").attr("src"),
                    host: BASE_URL
                })
        })
        return Response.success(data)
    }
    return null
}