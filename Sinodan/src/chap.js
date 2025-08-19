load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch( BASE_URL + url);
    if (response.ok) {
        let doc = response.html();
        doc.select("center").remove();
        let htm = doc.select("#nr1").html();
        return Response.success(htm);
    }
    return null;
}