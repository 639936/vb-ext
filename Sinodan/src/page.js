load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var page = [];
        let check = doc.select(".pagelistbox option");
    if (check) page.push(url)
    else {
        doc.select(".pagelistbox option").forEach(e => {
          page.push(BASE_URL + e.attr("value"))
        });
        return Response.success(page)
    }
    }
    return null;
}