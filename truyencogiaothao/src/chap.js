function execute(url) {
    
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        doc.select("em").remove();
        doc.select("input").remove();
        let htm = doc.select(".text-left").html();
        htm = cleanHtml(htm);
        return Response.success(htm);
    }
    return null;
}
//clear rác
function cleanHtml(htm) {
    htm = htm.replace(/(<br>\s*){2,}/g, '<br>');
    htm = htm.replace(/<a[^>]*>([^<]+)<\/a>/g, '');
    htm = htm.replace(/&(nbsp|amp|quot|lt|gt);/g, "");
    htm = htm.replace(/<!--(<br \/>)?[^>]*-->/gm, '');
    htm = htm.replace(/\&nbsp;/g, "");
    return htm;
}