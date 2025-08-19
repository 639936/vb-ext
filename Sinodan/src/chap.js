load('config.js');
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let response = fetch( BASE_URL + url);
    if (response.ok) {
        let doc = response.html();
        doc.select("center").remove();
        let htm = doc.select("#nr1").html();
        htm = cleanHtml(htm);
        return Response.success(htm);
    }
    return null;
}
function cleanHtml(htm) {
    htm = htm.replace(/(<br>\s*){2,}/g, '<br>');
    htm = htm.replace(/<br>/g, '\n');
    htm = htm.replace(/\n\n\n/g, '\n\n');
    htm = htm.replace(/<a[^>]*>([^<]+)<\/a>/g, '');
    htm = htm.replace(/&(nbsp|amp|quot|lt|gt);/g, "");
    htm = htm.replace(/<!--(<br \/>)?[^>]*-->/gm, '');
    htm = htm.replace(/\&nbsp;/g, "");
    return htm;
}