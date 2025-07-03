load("config.js")
function execute() {
    let response = fetch(BASE_URL);
    if (response.ok) {
        let doc = response.html();
        doc.select("#menu .nav-item").last().remove();
        doc.select("#menu .nav-item").last().remove();
        var dulieu = doc.select("#menu .nav-item");
        var data = [];
        dulieu.forEach(e => {
            data.push({
                title: e.select("a").attr("title"),
                input: e.select("a").attr("href").replace(/.htm/, "").replace(/.html/, ""),
                script: "gen.js"
            });
        });
        return Response.success(data);
    }
}