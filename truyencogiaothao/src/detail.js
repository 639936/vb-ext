load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html().select(".site-content");
        let genres = [];
        doc.select(".tags-content a").forEach(e => {
            genres.push({
                title: e.text(),
                input: e.attr('href'),
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
            author: doc.select(".author-content").text(),
            genres: genres,
            suggests: suggests,
        });
    }
    return null;
}