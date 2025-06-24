load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select('.bai-viet-box > div.list2').forEach(e => {
            if (e.select("> em").isEmpty()) {

                if (e.select("strong > a").text()) {
            data.push({
                name: e.select("strong > a").text(),
                link: e.select("strong > a").attr("href"),
                cover: "https://i.imgur.com/5BdXa90.png",
                host: BASE_URL
            
            })
                }
            }
        });
        return Response.success(data);

    }
    return null;
}