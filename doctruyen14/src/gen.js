load('config.js');

function execute(url,page) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (!page) page = '1';
    let response = fetch(url + "/page/" + page);
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
        var next = doc.select("#content .current + a").text();
        if (next) return Response.success(data,next)
        else return Response.success(data)
    }
    return null
}