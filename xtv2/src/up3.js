load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html().select("body")
        doc.select(".noibat").last().remove()
        doc.select(".noibat ").last().remove();
        var nd1 = doc.select(".noibat")
        var nd2 = doc.select(".noibat + .bai-viet-box")
        var data = []
        for (var i = 2; i < nd2.size(); i++ ){
            var e1 = nd1.get(i).select("a").first()
            var e2 = nd2.get(i).select("a").first()
            data.push({
                name: e1.text(),
                link: e1.attr("href"),
                cover: null,
                description: e2.text(),
                host:  BASE_URL
            })
        }
        return Response.success(data) 
    }
}