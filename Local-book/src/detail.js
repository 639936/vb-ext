load('config.js');
function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        return Response.success({
                name: doc.select("#path").text(),
                });
    }
    return null
}