function execute(url) {

    let response = fetch(url, header);
    if (response.ok) {
        let doc = response.html();
        let htm = doc.select('main.app-content .article').html();
        return Response.success(htm);
    }
    return null;
}
