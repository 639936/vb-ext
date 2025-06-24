load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (!page) page = '0';
    let response = fetch(url + "/page/" + page);
    if (response.ok) {
        let doc = response.html().select("body")
        doc.select(".noibat").last().remove()
        doc.select(".noibat ").last().remove();
        let nd1 = doc.select(".noibat")
        let nd2 = doc.select(".noibat + .bai-viet-box")
        let data = []
        for (let i = 2; i < nd2.size(); i++ ){
            let e1 = nd1.get(i).select("a").first()
            let e2 = nd2.get(i).select("a").first()
            data.push({
                name: e1.text(),
                link: e1.attr("href"),
                cover: null,
                description: e2.text(),
                host:  BASE_URL
            })
        }
        let next = doc.select('span.page-numbers.current + a').text();
        if (next) return Response.success(data, next);
    }
    return null
}