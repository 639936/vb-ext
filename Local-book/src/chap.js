load('config.js');
function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var content = doc.select(".contentbox").html();
        return Response.success(content);
    }
    return null;
}