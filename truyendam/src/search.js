load("config.js");
function execute(key, page) { 
    // 1. Dọn dẹp URL, chỉ giữ lại tham số cần thiết
    let url = `https://www.google.com/search?q=${encodeURIComponent(key)}+site:truyensextv2.cc`;
    var response = fetch(url)
    let json = response.json();
    console.log(json)
    if (response) {
        let doc = response.html();
        let data = [];
        let elems = doc.select("a[href*='url?q=https:']")
        console.log(elems)
        if (!elems.length) return Response.error(key);

        elems.forEach(function(e) {
            var link = $.Q(e, 'a').attr('href').match(/https:\/\/truyensextv.com\/(.*?)\//g)+""
            data.push({
                name: $.Q(e, 'h3').text(),
                cover: randomCover(),
                link: link,
                description: null,
                host: BASE_URL
            })
        })

        return Response.success(data);
    }
    return null;
}