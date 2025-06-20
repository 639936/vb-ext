load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL)
    var response = fetch(url);
    let genres = [];
    if (response.ok) {
        var doc = response.html();
        let tag = doc.select('tbody a');

    for (let i = 0; i < tag.size() - 1; i++) {
        var e = tag.get(i);
        genres.push({
            title: e.text(),
            input: e.attr("href").replace(BASE_URL,""),
            script: "gen.js"
        })
    }

        let suggests = [
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
