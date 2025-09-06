load("config.js");
// http://14.225.254.182/index.php?bookid=25698&h=dich&c=1&ngmar=readc&sajax=readchapter&sty=1&exts=720^-16777216^-1383213|http://14.225.254.182/truyen/dich/1/25698/1
// http://14.225.254.182/index.php?bookid=58348&h=69shu&c=37705930&ngmar=readc&sajax=readchapter&sty=1&exts=|http://14.225.254.182/truyen/69shu/1/58348/37705930/
function execute(url) {
    var parts = url.split('|');
    var url1 = parts[0];
    var url2 = parts[1];

    let response= fetch(url1,{
            method:"POST",
            headers:{
                "Content-type": "application/x-www-form-urlencoded",
                "Host": "14.225.254.182",
                "Origin": "http://14.225.254.182",
                "Referer": `${url2}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0"
            }
        })
    if (response.ok) {
        var obj = response.json();
        var nd = obj.data.replace(/<i[^>]*t=['"]([^'"]+)['"][^>]*>.*?<\/i>/g, function(match, tValue) {return tValue}).replace(/\t/g, '');
        return Response.success(nd)
    }
    return null
}