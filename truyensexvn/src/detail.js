load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let genres = [];
        doc.select(".tdb-tags a").forEach(e => {
            genres.push({
                title: e.text(),
                input: e.attr('href').replace(BASE_URL, ""),
                script: "gen.js"
            });
        });
        var suggests = [{
            title: "Maybe you like",
            input: url,
            script: "sg.js"
        }];
        return Response.success({
            name: doc.select("h1").text(),
            author: doc.select(".tdb-author-name-wrap a").text(),
            genres: genres,
            suggests: suggests,
        });
    }
    return null;
}