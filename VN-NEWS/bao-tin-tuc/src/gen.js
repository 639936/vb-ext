load('config.js');

function execute(url, page) {
    if (!page) page = '1';
    let response = fetch(BASE_URL + url + "/trang-" + page + ".htm");
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".list-content .list-newsest .item").forEach(e => {
            data.push({
                name: e.select("a").first().attr("title"),
                cover: e.select("img").first().attr("src"),
                link: e.select("a").first().attr("href"),
                description: e.select("p").first().text(),
                host: BASE_URL
            });
        });
        var next = (parseInt(page) + 1).toString();
        return Response.success(data, next);
    }
    return null;
}
