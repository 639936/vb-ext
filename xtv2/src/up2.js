load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html().select(".ndtruyen")
        doc.select("> p").first().remove()
        doc.select("> em ").last().remove();
        let nd = doc.select(".list2")
        let data = []
        for (let i = 0; i < nd.size(); i++ ){
            let el = nd.get(i)
            data.push({
                name: el.text(),
                link: el.select("a").attr("href"),
                cover: null,
                description: null,
                host:  BASE_URL
            })
        }
        return Response.success(data) 
    }
    return null
}