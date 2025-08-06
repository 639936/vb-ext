load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var data = [];
        doc.select(".pagelistbox option").forEach(e => {
          data.push({
            link: e.attr("value"),
            host: BASE_URL
          })
        });
        return Response.success(data)
    }
    return null;
}