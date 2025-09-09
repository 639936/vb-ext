load('config.js');
// https://www.uaa.com/member/collect?type=1&sort=0&page=1
// /member/collect?type=1&sort=0&
function execute(input, page) {
    if (!page) page = '1';
    let response = fetch(BASE_URL + input + "&page=" + page);
    console.log(BASE_URL + input + "&page=" + page)
    if (response.ok) {
        let doc= response.html();
        const data = [];
        console.log(doc)
        doc.select("#content_box .novel_li").forEach(e => {
            console.log(e)
            data.push({
                name: e.select(".cover_box a").attr("title"),
                link: e.select(".cover_box a").attr('href'),
                cover: e.select(".cover_box a img").attr('src'),
                description: e.select(".info_box a").first().text(),
                
                host: BASE_URL
            });
        });
        let next = doc.select(".pagination_box > .content_box > .arrow_box > a").last().attr("href").match(/page=(\d+)/)[1];
        if (next !== page) {
            next = (parseInt(page) + 1).toString();
            return Response.success(data, next);
        } else {
            return Response.success(data);
        }
    }
    return null;
}