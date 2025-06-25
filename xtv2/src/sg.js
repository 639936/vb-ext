load("config.js");

function execute(url) {
    var response = fetch(url);
    if (response.ok) {
            let doc = response.html();
            return Response.success({
                name: doc.select("tbody tr").get(1).select("td").last().text(),
                author: doc.select("tbody tr").get(2).select("a").text(),
                description: doc.select("tbody tr").get(5).text(),
                detail: doc.select("tbody tr").get(6).text(),
                });
    }
    return null
}