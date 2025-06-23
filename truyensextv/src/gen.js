load('config.js');

function execute(url, page) {
    if (!page) page = '0';
    var newUrl = BASE_URL + url + "/page/" + page;
    var response = fetch(newUrl);
    if (response.ok) {
        let doc = response.html();
        doc.select("em").remove();
        var data = [];
        var next = doc.select('span.page-numbers.current + a').text();
        var nd = doc.select("logo2 > p").text()
        if (next || nd) {
            var elems = doc.select('.noibat, .noibat + .bai-viet-box');
            for (var i = 0; i < elems.size() - 1; i+= 2) {
                var el = elems.get(i)
                data.push({
                    name: el.text(),
                    link: el.select('a').first().attr('href'),
                    cover:  null,
                    description: elems.get(i + 1).select('a').first().text(),
                    host: BASE_URL
                })
            }
            var next = doc.select('span.page-numbers.current + a').text();
            if (next) return Response.success(data, next);
        } else {
            data.push({
                    name: doc.select("tbody tr").get(1).text(),
                    link: newUrl,
                    cover:  null,
                    description: doc.select("tbody tr").get(5).text(),
                    host: BASE_URL
            });
            return Response.success(data);
        }
    }
    return null;
}