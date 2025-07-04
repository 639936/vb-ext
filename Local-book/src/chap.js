load('config.js');
function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var content = doc.select(".content").html();
        return Response.success(content);
    }
    return null;
}