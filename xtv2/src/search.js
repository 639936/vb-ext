load("config.js");
function execute(key, page) {
    if (!page) page = 1;
    page = parseInt(page, 10);
    let url = BASE_URL + "/tim-kiem/#gsc.tab=0&gsc.q=" + encodeURIComponent(key) + "&gsc.page=" + page;
    var data = [];
    var response = fetch(url);
    if (response.ok){
        let doc = response.html();
        doc.select(".gsc-webResult.gsc-result a.gs-title").forEach(e => {
            data.push({
                name: e.text(),
                link: e.attr("href"),
                host: BASE_URL
            });
        })
    }
    return Response.success(data);
}