load('config.js');
function execute(url) {
    let response = fetch(BASE_URL + url);
    if (response.ok) {
        let doc = response.html().select(".detail-content");
        let coverImg = doc.select("img").first().attr("src");
        let descriptionMeta = doc.select("h2").first().text();
        let title = doc.select("h1").first().text();
        let updateTime = doc.select(".date").first().text();

        return Response.success({
            name: title,
            cover: coverImg,
            description: descriptionMeta,
            detail: "Thời gian cập nhật: " + updateTime,
            host: BASE_URL
        });
    }
    return null
}