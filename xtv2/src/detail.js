load('config.js');

function execute(url) {
    var response = fetch(url);
    if (response.ok) {
            let doc = response.html();
            doc.select("em").remove();
            var next = doc.select('span.page-numbers.current + a').text();
                nd = doc.select(".ndtruyen > p").text();
            if (next || nd) {
                doc.select("em").remove();
                var genres = [];
                var tag = doc.select('tbody a');

                for (var i = 0; i < tag.size() - 1; i++) {
                    var e = tag.get(i);
                    genres.push({
                        title: e.text(),
                        input: e.attr("href").replace(BASE_URL,""),
                        script: "gen.js"
                    })
                }
                var suggests = [];
                doc.select('.bai-viet-box a').forEach(el => { 
                    suggests.push ({
                        title: "Truyện cùng tác giả:",
                        input: el.attr("href").replace(BASE_URL,"") ,
                        script: "gen.js"
                    });
                })
                    return Response.success({
                    name: doc.select("tbody tr").get(1).text(),
                    cover: null,
                    author: doc.select("tbody tr").get(2).text(),
                    description: doc.select("tbody tr").get(5).text(),
                    detail: doc.select("tbody tr").get(6).text(),
                    genres: genres,
                    suggests: suggests,
                    host: BASE_URL
                });
            } else {
                var listdata = []
                var elems = doc.select('.ndtruyen .list2 strong a');
                elems.forEach(el => {
                    listdata.push({
                        title: el.text(),
                        input: el.select('a').first().attr('href').replace(BASE_URL,""),
                        script: "gen.js"
                    })
                })
                return Response.success({
                    name: doc.select("h1").text(),
                    cover: null,
                    author: null,
                    description: null,
                    detail: null,
                    suggests: listdata,
                    host: BASE_URL
                });
            }
            
        }
    return null;
}
