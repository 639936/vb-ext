load("config.js");

function execute(url) {
    var response = fetch(url);
    if (response.ok) {
            let doc = response.html();
            nd = doc.select(".ndtruyen > p").text();
            var genres = [];
            var tag = doc.select("tbody a");

            for (var i = 0; i < tag.size() - 1; i++) {
                var e = tag.get(i);
                genres.push({
                    title: e.text(),
                    input: e.attr("href").replace(BASE_URL,""),
                    script: "gen.js"
                    })
                }
            var suggests = [];
            doc.select(".bai-viet-box").get(3).select("a").forEach(el => { 
                suggests.push ({
                    title: el.text(),
                    input: el.attr("href"),
                    script: "up3.js"
                    });
                })
            return Response.success({
                name: doc.select("tbody tr").get(1).select("td").last().text(),
                author: doc.select("tbody tr").get(2).select("a").text(),
                description: doc.select("tbody tr").get(5).text(),
                detail: doc.select("tbody tr").get(6).text(),
                genres: genres,
                suggests: suggests,
                });
        }
    return null;
}
