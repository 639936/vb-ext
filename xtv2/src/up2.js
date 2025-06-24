load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
     response = fetch(url);
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
                cover: "https://i.imgur.com/5BdXa90.png",
                host:  BASE_URL
            })
        }
        return Response.success(data) 
    }
    return null
}