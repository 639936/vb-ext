load('config.js')
function execute(url) {
    var chapters = [];
    let response = fetch(url);
    if (response.ok){
        let doc = fetch(url).html()
        let el = doc.select('#tab-chapters a, #tab-latest-chapters a')
        el.forEach(e => {
            chapters.push({
                name: e.select("span").text(),
                url: e.attr('href'),
            })
        });
        return Response.success(chapters);
    }
}