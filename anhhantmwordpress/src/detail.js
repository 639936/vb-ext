load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let detail = "";

        return Response.success({
            name: doc.select("#main header h1").first().text(),
            cover: doc.select("#main .entry-content img").attr("src"),
            author: doc.select("#main .entry-content p").get(2).text(),
            detail: doc.select("#main .entry-content p").html(),
            host: BASE_URL
        });
    }
    return null;
}