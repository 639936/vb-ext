load("config.js");
function execute(key, page) { 
    var key = encodeURIComponent(key)
    var url = "https://www.google.com/search?q="+key+"+site%3Ahttps%3A%2F%2Ftruyensextv2.cc%2F&sxsrf=ALiCzsa2EDImprPyZ6dPndb3j9RX5ndQ2A%3A1667800234553&ei=qpxoY_aqIbueseMPgf-48A8&ved=0ahUKEwj2p6WEsJv7AhU7T2wGHYE_Dv4Q4dUDCA8&uact=5&oq="+key+"+site%3Ahttps%3A%2F%2Ftruyensextv2.cc%2F&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQA0oECEEYAUoECEYYAFDeBVjeBWDvCGgBcAB4AIABlgGIAZYBkgEDMC4xmAEAoAEBwAEB&sclient=gws-wiz-serp"
    var response = fetch(url)
    if (response) {
        let doc = response.html();
        doc.select("em").remove();
        var data = [];
        var elems = doc.select("a[href*="url?q=https:"]")
        console.log(elems)
        if (!elems.length) return Response.error(key);

        elems.forEach(function(e) {
            var link = e.select("a").attr("href").match(/https:\/\/truyensextv2.cc\/(.*?)\//g)+""
            if (e.select("h3").text()) {
            data.push({
                name: e.select("h3").text(),
                cover: null,
                link: link,
                description: null,
                host: BASE_URL
            })
            }
        })

        return Response.success(data);
    }
    return null;
}