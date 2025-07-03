load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        var doc = response.html().select(".article__body");
        return Response.success(doc);
    }
    return null;
}