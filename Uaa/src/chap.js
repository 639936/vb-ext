function execute(url) {

    let body = {
        method: "POST",
        headers: {
            "User-Agent": UserAgent.android()
        }
    };

    let response = fetch(url, body);

    if (response.ok) {
        let doc = response.html();
        let content = "";
        console.log(doc);
        doc.select(".line").forEach(e => {
            content += e.text() + "<br>";
        });

        return Response.success(content);
    }
    return null;
}