load("config.js");

function execute(url) {
    const mapping_dict = {};
    mapping_dict[String.fromCharCode(0xE05F)] = '3';
    mapping_dict[String.fromCharCode(0xE063)] = 'z';
    mapping_dict[String.fromCharCode(0xE06B)] = 'K';
    mapping_dict[String.fromCharCode(0xE089)] = 'l';
    mapping_dict[String.fromCharCode(0xE0D5)] = 'S';
    mapping_dict[String.fromCharCode(0xE0D6)] = 'T';
    mapping_dict[String.fromCharCode(0xE101)] = 'P';
    mapping_dict[String.fromCharCode(0xE184)] = 'O';
    mapping_dict[String.fromCharCode(0xE1AD)] = 'e';
    mapping_dict[String.fromCharCode(0xE1B4)] = 'k';
    mapping_dict[String.fromCharCode(0xE1B8)] = 'f';
    mapping_dict[String.fromCharCode(0xE1BF)] = 'n';
    mapping_dict[String.fromCharCode(0xE1C0)] = 'Y';
    mapping_dict[String.fromCharCode(0xE1C1)] = '1';
    mapping_dict[String.fromCharCode(0xE1E4)] = 'M';
    mapping_dict[String.fromCharCode(0xE215)] = 'C';
    mapping_dict[String.fromCharCode(0xE218)] = 'A';
    mapping_dict[String.fromCharCode(0xE248)] = 'v';
    mapping_dict[String.fromCharCode(0xE257)] = 'G';
    mapping_dict[String.fromCharCode(0xE2C5)] = 's';
    mapping_dict[String.fromCharCode(0xE2C7)] = 't';
    mapping_dict[String.fromCharCode(0xE30F)] = 'V';
    mapping_dict[String.fromCharCode(0xE311)] = 'u';
    mapping_dict[String.fromCharCode(0xE37C)] = 'R';
    mapping_dict[String.fromCharCode(0xE39B)] = 'X';
    mapping_dict[String.fromCharCode(0xE3B0)] = 'l';
    mapping_dict[String.fromCharCode(0xE3B7)] = 'B';
    mapping_dict[String.fromCharCode(0xE41B)] = 'o';
    mapping_dict[String.fromCharCode(0xE41C)] = 'H';
    mapping_dict[String.fromCharCode(0xE427)] = 'J';
    mapping_dict[String.fromCharCode(0xE46A)] = 'b';
    mapping_dict[String.fromCharCode(0xE477)] = 'y';
    mapping_dict[String.fromCharCode(0xE4AE)] = '2';
    mapping_dict[String.fromCharCode(0xE4D3)] = '5';
    mapping_dict[String.fromCharCode(0xE4DB)] = 'L';
    mapping_dict[String.fromCharCode(0xE4DF)] = 'N';
    mapping_dict[String.fromCharCode(0xE550)] = 'E';
    mapping_dict[String.fromCharCode(0xE557)] = 'h';
    mapping_dict[String.fromCharCode(0xE571)] = 'F';
    mapping_dict[String.fromCharCode(0xE5C9)] = '8';
    mapping_dict[String.fromCharCode(0xE5D1)] = 'x';
    mapping_dict[String.fromCharCode(0xE5DC)] = 'm';
    mapping_dict[String.fromCharCode(0xE5E1)] = '9';
    mapping_dict[String.fromCharCode(0xE5FF)] = 'a';
    mapping_dict[String.fromCharCode(0xE603)] = 'U';
    mapping_dict[String.fromCharCode(0xE62A)] = 'w';
    mapping_dict[String.fromCharCode(0xE63E)] = 'D';
    mapping_dict[String.fromCharCode(0xE648)] = '6';
    mapping_dict[String.fromCharCode(0xE6A4)] = 'q';
    mapping_dict[String.fromCharCode(0xE6A5)] = 'c';
    mapping_dict[String.fromCharCode(0xE6D7)] = 'W';
    mapping_dict[String.fromCharCode(0xE6F5)] = 'g';
    mapping_dict[String.fromCharCode(0xE735)] = 'Z';
    mapping_dict[String.fromCharCode(0xE762)] = 'r';
    mapping_dict[String.fromCharCode(0xE77A)] = 'd';
    mapping_dict[String.fromCharCode(0xE77E)] = '4';
    mapping_dict[String.fromCharCode(0xE7C7)] = 'Q';
    mapping_dict[String.fromCharCode(0xE7E5)] = '0';
    mapping_dict[String.fromCharCode(0xE7F6)] = '7';
    mapping_dict[String.fromCharCode(0xE95D)] = '9';
    mapping_dict[String.fromCharCode(0xE9A8)] = 'y';
    mapping_dict[String.fromCharCode(0xE9CC)] = 'P';
    mapping_dict[String.fromCharCode(0xE9D5)] = 'o';
    mapping_dict[String.fromCharCode(0xE9F8)] = 'O';
    mapping_dict[String.fromCharCode(0xEA15)] = 'e';
    mapping_dict[String.fromCharCode(0xEA24)] = 'N';
    mapping_dict[String.fromCharCode(0xEA2E)] = 'R';
    mapping_dict[String.fromCharCode(0xEA2F)] = 'C';
    mapping_dict[String.fromCharCode(0xEA43)] = '4';
    mapping_dict[String.fromCharCode(0xEA47)] = 'l';
    mapping_dict[String.fromCharCode(0xEA75)] = 'M';
    mapping_dict[String.fromCharCode(0xEA76)] = 'H';
    mapping_dict[String.fromCharCode(0xEA77)] = 'u';
    mapping_dict[String.fromCharCode(0xEAA1)] = 'k';
    mapping_dict[String.fromCharCode(0xEAA4)] = 'a';
    mapping_dict[String.fromCharCode(0xEAA5)] = 'x';
    mapping_dict[String.fromCharCode(0xEAA6)] = 'z';
    mapping_dict[String.fromCharCode(0xEAB4)] = 't';
    mapping_dict[String.fromCharCode(0xEAC5)] = 'w';
    mapping_dict[String.fromCharCode(0xEAE3)] = 'A';
    mapping_dict[String.fromCharCode(0xEB06)] = 's';
    mapping_dict[String.fromCharCode(0xEB0E)] = 'f';
    mapping_dict[String.fromCharCode(0xEB75)] = 'h';
    mapping_dict[String.fromCharCode(0xEB85)] = 'X';
    mapping_dict[String.fromCharCode(0xEC6D)] = 'g';
    mapping_dict[String.fromCharCode(0xEC75)] = 'd';
    mapping_dict[String.fromCharCode(0xEC85)] = 'n';
    mapping_dict[String.fromCharCode(0xECB4)] = 'S';
    mapping_dict[String.fromCharCode(0xECD4)] = 'L';
    mapping_dict[String.fromCharCode(0xECE6)] = 'E';
    mapping_dict[String.fromCharCode(0xED07)] = 'V';
    mapping_dict[String.fromCharCode(0xED35)] = 'l';
    mapping_dict[String.fromCharCode(0xED37)] = 'J';
    mapping_dict[String.fromCharCode(0xED48)] = 'W';
    mapping_dict[String.fromCharCode(0xED64)] = '5';
    mapping_dict[String.fromCharCode(0xED71)] = '2';
    mapping_dict[String.fromCharCode(0xED72)] = 'v';
    mapping_dict[String.fromCharCode(0xEDEB)] = 'Y';
    mapping_dict[String.fromCharCode(0xEDED)] = 'm';
    mapping_dict[String.fromCharCode(0xEE09)] = 'Q';
    mapping_dict[String.fromCharCode(0xEE69)] = 'b';
    mapping_dict[String.fromCharCode(0xEE8D)] = '0';
    mapping_dict[String.fromCharCode(0xEEBB)] = 'F';
    mapping_dict[String.fromCharCode(0xEECC)] = 'B';
    mapping_dict[String.fromCharCode(0xEECF)] = 'c';
    mapping_dict[String.fromCharCode(0xEEDA)] = '1';
    mapping_dict[String.fromCharCode(0xEEDB)] = 'D';
    mapping_dict[String.fromCharCode(0xEF26)] = 'K';
    mapping_dict[String.fromCharCode(0xEF37)] = '6';
    mapping_dict[String.fromCharCode(0xEF5A)] = 'U';
    mapping_dict[String.fromCharCode(0xEF61)] = 'G';
    mapping_dict[String.fromCharCode(0xEF91)] = '8';
    mapping_dict[String.fromCharCode(0xEF94)] = 'T';
    mapping_dict[String.fromCharCode(0xEFD7)] = 'Z';
    mapping_dict[String.fromCharCode(0xEFEE)] = '3';
    mapping_dict[String.fromCharCode(0xF00A)] = 'q';
    mapping_dict[String.fromCharCode(0xF073)] = '7';
    mapping_dict[String.fromCharCode(0xF0BA)] = 'r';
    mapping_dict[String.fromCharCode(0xF8FF)] = '';

// http://14.225.254.182/index.php?bookid=1599&h=sangtac&c=1&ngmar=readc&sajax=readchapter&sty=1&exts=|http://14.225.254.182/truyen/sangtac/1/1599/1/
// "/index.php?bookid="+input[2]+"&h="+input[1]+"&c="+e.match(regex1)[1]+"&ngmar=readc&sajax=readchapter&sty=1&exts="+ext+"|"+url+e.match(regex1)[1]+"/"

    const regexchap = /truyen\/([^\/]+)\/\d+\/(\d+)\/(\d+)\/?/;   
    let input = url.match(regexchap)
    let extchap = (input[1] === "dich" || input[1] === "sangtac")? "720^-16777216^-1383213":"";
    let urls=BASE_URL+"/index.php?bookid="+input[2]+"&h="+input[1]+"&c="+input[3]+"&ngmar=readc&sajax=readchapter&sty=1&exts="+extchap;
    urls = urls.endsWith('/') ? urls : urls + '/';

    let response = fetch(urls, {
        method: "POST",
        headers: {
            "x-stv-transport": "web",
            "Content-type": "application/x-www-form-urlencoded",
            "Host": "14.225.254.182",
            "Origin": "http://14.225.254.182",
            "Referer": `${url}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0"
        }
    });

    if (response.ok) {
        var obj = response.json();
        let content = obj.data;

        const regex = new RegExp(Object.keys(mapping_dict).join('|'), 'g');
        let decodedContent = content.replace(regex, function(match) {
            return mapping_dict[match];
        });

        var finalContent = decodedContent.replace(/<span[^>]*>|<\/span>/g, "")
            .replace(/<i[^>]*t=['"]([^'"]+)['"][^>]*>.*?<\/i>/g, function(match, tValue) { return tValue; })
            .replace(/\t/g, '');

        return Response.success(finalContent);
    }

    return null;
}