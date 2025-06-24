load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html().select(".ndtruyen")
        doc.select("> p").first().remove()
        doc.select("> em ").last().remove();
        var nd = doc.select(".list2")
        var data = []
        for (var i = 0; i < nd.size(); i++ ){
            var el = nd.get(i)
            data.push({
                name: el.text(),
                link: el.select("a").attr("href"),
                cover: null,
                description: null,
                host:  BASE_URL
            })
        }
        return Response.success(data) 
    }
}