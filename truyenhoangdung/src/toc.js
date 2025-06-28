load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var data = [];
        var elems = doc.select(".list-chap .item a");
        for (let i = elems.size() - 1; i >= 0; i--) {
            var el = elems.get(i);
            data.push({
                name: el.text(),
                url: el.attr("href"),
                host: BASE_URL
            });
        }
        return Response.success(data);
    }
    return null;
}