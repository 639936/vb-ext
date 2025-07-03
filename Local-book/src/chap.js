load('config.js');
function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        let doc = response.html().select(".contentbox");
        return Response.success(doc);
    }
    return null;
}