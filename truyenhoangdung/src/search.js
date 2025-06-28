load('config.js');
function execute(key,page) {
    if(!page) page = '0';
    let response = fetch(BASE_URL + "/home/search/" + page + "?search=" + encodeURIComponent(key));
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".list-group > li ").forEach(e => {
                data.push({
                    name: e.select(".title a").first().text(),
                    link: BASE_URL + e.select(".title a").first().attr("href"),
                    cover: BASE_URL + e.select("img").attr("src"),
                    host: BASE_URL
                });
        });
        var regex = doc.select(".phantrang .active + li").text();
        if (regex) {
            var next = parseInt(page, 10) + 50;
            return Response.success(data, next)
        }
        else return Response.success(data)
    }
    return null;
}