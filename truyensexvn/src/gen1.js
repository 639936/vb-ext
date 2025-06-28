load('config.js');

function execute(url,page) {
    if(!page) page = '1';
    let response = fetch(BASE_URL + "/page/" + page + url);
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
        var next = doc.select(".page-nav .current + a").text();
        if (next) {
            return Response.success(data, next)
        }
        else return Response.success(data)
    }
    return null;
}