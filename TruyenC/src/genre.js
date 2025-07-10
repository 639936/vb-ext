load('config.js');
function execute() {
    let response = fetch(BASE_URL);
    if (response.ok) {
        var doc = response.html();
        var genre = [];
        var danhmuc = doc.select(".list-group.list-custom-small.list-menu").first();
        danhmuc.select("a").forEach(e => {
            genre.push({
                title: e.text(),
                input: e.attr("href"),
                script: "gen.js"
            });
        });
        return Response.success(genre);
    }
    return null
}