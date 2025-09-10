load('config.js');

function execute(input) {
    let response = fetch(BASE_URL + input);
    if (response.ok) {
        let doc= response.html();
        
        const sgb = [];
        
        doc.select(".main_box .recommend_box .recommend_item").forEach(e => {
            sgb.push({
                name: e.select(".title").text(),
                link: e.select("a").first().attr('href'),
                cover: e.select("img").attr('src'),
                description: e.select("p").text(),
                host: BASE_URL
            });
        });
        return Response.success(sgb);
    }
    return null;
}