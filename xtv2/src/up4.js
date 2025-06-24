load('config.js');

function execute(url) {
    let urls = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(urls);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select('.bai-viet-box > div.list2').forEach(e => {
            if (e.select("> em").isEmpty()) {

                if (e.select("strong > a").text()) {
            data.push({
                name: e.select("strong > a").text(),
                link: e.select("strong > a").attr("href"),
            
            })
                }
            }
        });
        return Response.success(data);

    }
    return null;
}