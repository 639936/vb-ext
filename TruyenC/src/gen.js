load('config.js');
function execute(url,page) {
    if(!page) page = '1';
    let response = fetch(url + "?page=" + page);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".page-content .d-flex").forEach(e => {
          data.push({
            name: e.select("a").first().attr("title"),
            link: e.select("a").first().attr("href"),
            cover: e.select("img").first().attr("src"),
            description: e.select("p").first().text(),
            host: BASE_URL
          })
        });
        let next = doc.select(".pagination li.active + li").text();
        if (next)
        return Response.success(data,next)
        else
        return Response.success(data)
    }
    return null;
}