load("config.js")
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let urltoc = url + "/ajax/chapters/";
    var response = fetch(urltoc, {
        method: "POST"
    });
    if (response.ok) {
        var data = [];
        let doc = response.html();
        let list = doc.select("ul li a");
        for (let i = list.size() - 1; i >= 0; i--) {
            var e = list.get(i);
            data.push({
                name: e.text(),
                url: e.attr("href"),
                host: BASE_URL
                });
        }
        return Response.success(data);
        }
    return null
}