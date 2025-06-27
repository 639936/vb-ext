load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select("#content .post").forEach(e => {
                data.push({
                    name: e.select("h2 a").text(),
                    link: e.select("h2 a").attr("href"),
                    description: e.select("div").first().text(),
                    host: BASE_URL
                });
        });
        return Response.success(data);
    }
    return null;
}