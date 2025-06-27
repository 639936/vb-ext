load('config.js');
function execute(key,page) {
    if(!page) page = '1';
    page = parseInt(page, 10);
    let response = fetch(BASE_URL + "/page/" + page + "/?s=" + encodeURIComponent(key) + "&post_type=wp-manga");
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".tab-content-wrap .row").forEach(e => {
                data.push({
                    name: e.select("a").first().text(),
                    link: e.select("a").first().attr("href"),
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