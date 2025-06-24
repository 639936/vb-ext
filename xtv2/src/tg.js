load('config.js');

function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var data = [];
        doc.select('.bai-viet-box > div.list2').forEach(e => {
            if (e.select(" > em").isEmpty()) {

                if (e.select("strong > a").text()) {
            data.push({
                name: e.select("strong > a").text(),
                link: e.select("strong > a").attr("href"),
                description: null,
                host: BASE_URL
            
            })
                }
            }
        });
        return Response.success(data);

    }
    return null;
}