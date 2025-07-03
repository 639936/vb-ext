load('config.js');
function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let coverImg = doc.select("img").first().attr("data-src") || doc.select("img").first().attr("src") || doc.select("img").first().attr("data-srcset");
        let title = doc.select("h1").first().text();
        let updateTime = doc.select("time").first().text();

        return Response.success({
            name: title,
            cover: coverImg,
            detail: "Thời gian cập nhật: " + updateTime,
            host: BASE_URL
        });
    }
    return null
}