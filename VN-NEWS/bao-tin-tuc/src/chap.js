load('config.js');

function execute(url) {
    let response = fetch(BASE_URL + url);
    if (response.ok) {
        let doc = response.html().select(".contents");
        doc.select(".lazier").remove();
        doc.select("script").remove();
        doc.select("noscript").remove();
        doc.select("ins").remove();

        return Response.success(doc);
    }
    return null;
}