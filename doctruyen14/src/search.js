load('config.js');
function execute(key,page) {
    if(!page) page = '1';
    let response = fetch(BASE_URL + "/page/" + page + "/?s=" + encodeURIComponent(key) + "&submit=Tìm");
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select("#content .post").forEach(e => {
                data.push({
                    name: e.select("h2 a").text(),
                    link: e.select("h2 a").attr("href"),
                    description: e.select("div").first().text(),
                    host: BASE_URL
                });
        });
        var next = doc.select(".current + a").text();
        if (next) return Response.success(data, next)
        else return Response.success(data)
    }
    return null;
}