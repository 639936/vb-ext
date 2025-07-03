load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select("article.story").forEach(e => {
            var img = e.select("img").first().attr("data-src");
            if (!img) img = e.select("img").first().attr("src");
            data.push({
                name: e.select("a").first().attr("title"),
                cover: e.select("img").first().attr("data-src") || e.select("img").first().attr("src") || e.select("img").first().attr("data-srcset"),
                link: e.select("a").first().attr("href"),
                description: e.select("p").first().text(),
                host: BASE_URL
            });
        });
        return Response.success(data);
    }
    return null;
}
