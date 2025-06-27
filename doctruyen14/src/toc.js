load('config.js')
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var chapterList = [];

        var urlLast = doc.select(".entry-content a.last").attr("href");
        if (urlLast) {
            let tempUrl = urlLast;
            if (tempUrl.endsWith('/')) {
                tempUrl = tempUrl.slice(0, -1);
            }

            const lastSlashIndex = tempUrl.lastIndexOf('/');
            const urlgoc = tempUrl.substring(0, lastSlashIndex);
            const soChuong = parseInt(tempUrl.substring(lastSlashIndex + 1), 10);
            for (let i = 1; i <= soChuong; i++) {            
                chapterList.push({
                    name: "Chương " + i, 
                    url: urlgoc + '/' + i,
                    host: "https://doctruyen14.vip"
                });
            }
            return Response.success(chapterList);
        } else {
            chapterList.push({
                name: "Chương 1",
                url: url,
                host: "https://doctruyen14.vip"
            });
            return Response.success(chapterList);
        }
    }
    return null
}