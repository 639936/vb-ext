load('config.js');

function execute(url,page) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (!page) page = '1';
    let response = fetch(url + "/page/" + page);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".page-item-detail.text").forEach(e => {
                data.push({
                    name: e.select(".item-summary a").text(),
                    link: e.select(".item-summary a").attr("href"),
                    cover: e.select("img").attr("src"),
                    host: BASE_URL
                });
        });
        var next = doc.select(".wp-pagenavi .current + a").text();
        if (next) return Response.success(data,next)
        else return Response.success(data)
    }
    return null
}