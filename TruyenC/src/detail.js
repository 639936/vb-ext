load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        return Response.success({
            name: doc.select(".content h2").first().text(),
            cover: doc.select(".content img").first().attr("src"),
            author: doc.select(".content h3").text(),
            detail: doc.select(".d-block.d-sm-none").text(),
        });
    }
    return null;
}