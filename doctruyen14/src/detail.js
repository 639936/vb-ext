load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html().select(".mo-ta-truyen div");
        doc.select("strong").remove();
        let genres = [];
        doc.get(3).select("a").forEach(e => {
            genres.push({
                title: e.text(),
                input: e.attr('href'),
                script: "gen.js"
            });
        });
        var suggests = [
                {
                    title: "Cùng tác giả",
                    input: doc.get(2).select("a").attr("href"),
                    script: "sg.js"
                }
            ];
        return Response.success({
            name: doc.get(1).text(),
            author: doc.get(2).text(),
            genres: genres,
            suggests: suggests,
            host: BASE_URL
        });
    }
    return null;
}