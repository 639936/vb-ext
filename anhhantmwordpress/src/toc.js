load('config.js')

function execute(url) {
    const chapters = [];
    let doc = fetch(url).html();
        let el = doc.select('.entry-content figure a')
        el.forEach(e => {
            chapters.push({
                name: e.text(),
                url: e.attr('href'),
                host: BASE_URL
            })
        });
        return Response.success(chapters)
    

}