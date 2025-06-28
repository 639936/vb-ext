load('config.js');

function execute(url,page) {
    if(!page) page = '1';
    page = parseInt(page, 10);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".tab-content-wrap .row").forEach(e => {
                data.push({
                    name: e.select(".post-title a").first().text(),
                    link: e.select(".post-title a").first().attr("href"),
                    cover: e.select("img").attr("data-src"),
                    host: BASE_URL
                });
        });
        var itemnext = doc.select(".nav-previous a").attr("href");
        if (itemnext) {
            page = page + 1;
            return Response.success(data, page)
        }
        else return Response.success(data)
    }
    return null;
}