load("config.js")
function execute() {
    let response = fetch(BASE_URL);
    if (response.ok) {
        let doc = response.html().select("header");
        doc.select("ul li").first().remove();
        doc.select("ul li").last().remove();
        var dulieu = doc.select("ul li");
        var data = [{
            title: "Tin mới",
            input: BASE_URL,
            script: "gen.js"
        }];
        dulieu.forEach(e => {
            data.push({
                title: e.select("a").attr("title"),
                input: e.select("a").attr("href"),
                script: "gen.js"
            });
        });
        return Response.success(data);
    }
}