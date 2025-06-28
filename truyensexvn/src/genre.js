load("config.js");

function execute() {
    let response = fetch(BASE_URL)
    if (response.ok) {
        var data = [];
        var doc = response.html()
        doc.select("ul.sub-menu li a").forEach(e => {
            data.push({
                title: e.text(),
                input: e.attr("href").replace(BASE_URL, ""),
                script: "gen.js"
            })
        })
    }
    return Response.success(data)
}