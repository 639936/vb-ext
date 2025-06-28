load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".block-content .item").forEach(e => {
                data.push({
                    name: e.select(".info a").text(),
                    link: e.select(".info a").attr("href"),
                    cover: BASE_URL + e.select("img").first().attr("src"),
                    host: BASE_URL
                });
        });
        return Response.success(data)
    }
    return null;
}