load("config.js");
function execute(url) {
    let urls = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(urls);
    if (response.ok) {
        let doc = response.html().select(".ndtruyen");
        doc.select("> p").first().remove();
        doc.select("> em").last().remove();
        var nd = doc.select(".list2");
        var data = [];
        for (var i = 0; i < nd.size(); i++){
            var el = nd.get(i);
            data.push({
                name: el.text(),
                link: el.select("a").attr("href"),
            })
        }
        return Response.success(data) 
    }
    return null
}