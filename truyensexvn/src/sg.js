load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".td-module-meta-info").forEach(e => {
                data.push({
                    name: e.select("a").first().text(),
                    link: e.select("a").first().attr("href"),
                    host: BASE_URL
                });
        });
        return Response.success(data)
    }
    return null;
}