load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url + "/");
    if (response.ok) {
        let doc = response.html();
        console.log(doc);
        let chapters = [];
        let el = doc.select(".menu-list ul")
        el.select("li a").forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr("href"),
                host: BASE_URL
            })
        });
        return Response.success(chapters);
    }
    return null;
}
