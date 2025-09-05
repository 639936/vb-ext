load('config.js');

function execute(url) {
    url = url.replace("/vBook/Book/", "");
    url = url.replace("http://localhost", "");
    var response = fetch(HOST + "/vBook/Book/" + url);
    if (response.ok) {
        var doc = response.html();
        return Response.success({
                name: doc.select("#path").text().replace("/vBook/Book/", ""),
        });
    }
    else {
        return Response.success({name: url});
    }
}