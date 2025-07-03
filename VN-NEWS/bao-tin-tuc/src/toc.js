load('config.js');

function execute(url) {
    const data = [];
    let response = fetch(url);

    if (response.ok) {
        let doc = response.html().select(".detail-content");
        let title = doc.select("h1").first().text();

        data.push({
            name: title,
            url: url,
            host: BASE_URL
        });

        return Response.success(data);
    }

    return null;
}
