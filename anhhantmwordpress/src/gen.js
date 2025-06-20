load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(BASE_URL + url);
    if (response.ok) {
        let doc = response.html();
        doc.select(".entry-content .wp-block-image").get(0).remove();
        const data = [];

        doc.select(".entry-content .wp-block-image + p").forEach(e => {
            links = e.select("a").attr("href")
            load = fetch(links);
            let covers1 = load.html();
            covers = covers1.select("#main .entry-content img").attr("src")
          data.push({
            name: e.text(),
            link: links,
            cover: covers,
            host: BASE_URL
          })
        });
        return Response.success(data)
    }
    return null;
}