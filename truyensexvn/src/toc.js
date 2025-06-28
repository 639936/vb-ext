load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var data = [];

        data.push({
            name: "Phần 1",
            url: url,
            host: BASE_URL
        });
        doc.select(".page-nav a").last().remove();
        var elems = doc.select(".page-nav a");
        elems.forEach(function(e) {
            data.push({
                name: "Phần" + e.text(),
                url: e.attr("href"),
                host: BASE_URL
            });
        });

        return Response.success(data);
    }
    return null;
}