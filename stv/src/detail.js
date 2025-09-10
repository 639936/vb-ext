load("config.js");
function execute(url) {
const regex = /var\s+bookinfo\s*=\s*(\{[\s\S]*?\});/;
    let response = fetch(url + '/');
    if (response.ok) {
        let text=response.text()
        let json=JSON.parse(text.match(regex)[1])
        let doc = Html.parse(text) 
         let des = doc.select(".blk:has(.fa-water) .blk-body").html();
         let _detail = ""
         doc.select(".blk-body.ib-100").forEach(e=>{
_detail+="<br>"+e.text()
         })
    let statusTag = doc.select('meta[property="og:novel:status"]').first();
    let ongoing = statusTag ? statusTag.attr('content') === "Còn tiếp" : false;
        return Response.success({
            name: json.name,
            cover: json.thumb,
            author: json.author || 'Unknow',
            description: des,
            detail: statusTag.attr('content') + _detail,
            ongoing: ongoing,
            host: BASE_URL
        });
    }
    return null;
}