load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html().select(".contents");
        doc.select(".lazier").remove();
        doc.select("script").remove();
        doc.select("noscript").remove();
        doc.select("ins").remove();
        let htm = doc.html()

        return Response.success(htm);
    }
    return null;
}