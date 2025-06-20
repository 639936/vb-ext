load('config.js')
function execute(url, page) {
    if (!page) page = '1';
    let url1 = url + "?page=" + page
    console.log(url1)
    var response = fetch(url1);
    if (response.ok) {
        let doc = response.html()
        var el = doc.select(".box-content.space-y-2 article" );
        var newlist = [];

        var next = doc.select(".ant-pagination-item-active + li").last().text();
        console.log(next)
        for (var i = 0; i < el.size(); i++) {
            var e = el.get(i);
            let links = e.select("a").attr("href");
            newlist.push({
                name: e.select("h3").text(),
                link: links,
                description: e.select("h3 + div").first().text(),
                cover: fetch(links).html().select(".box-content img").first().attr("src"),
            });
        }
        return Response.success(newlist, next);
    }
    return null;
}