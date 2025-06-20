load('config.js');

function execute(url) {
    var response = fetch(url);
    var genres = [];
    if (response.ok) {
        let doc = response.html();
        doc.select("em").remove();
        var tag = doc.select('tbody a');

    for (var i = 0; i < tag.size() - 1; i++) {
        var e = tag.get(i);
        genres.push({
            title: e.text(),
            input: e.attr("href").replace(BASE_URL,""),
            script: "gen.js"
        })
    }

        var suggests = [
            {
                title: "Truyện cùng tác giả:",
                link: doc.select('.bai-viet-box a').attr("href") ,
                cover: null,
            }
        ];
        return Response.success({
            name: doc.select("tbody tr").get(1).text(),
            cover: null,
            author: doc.select("tbody tr").get(2).text(),
            description: doc.select("tbody tr").get(5).text(),
            detail: doc.select("tbody tr").get(6).text(),
            genres: genres,
            suggests: suggests,
            host: BASE_URL
        });
    }
    return null;
}
