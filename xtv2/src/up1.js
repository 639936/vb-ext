load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        let doc = response.html().select("body")
        doc.select(".noibat").last().remove()
        doc.select(".noibat ").last().remove();
        let nd = doc.select(".noibat > a, .noibat + .bai-viet-box > a")
        

        console.log(nd)      
    }
}