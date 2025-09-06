load("config.js");
function execute(url) {
    const regex = /truyen\/([^\/]+)\/\d+\/(\d+)\/?/;   
    let input = url.match(regex)
    var ext = (input[1] === "dich")? "720^-16777216^-1383213":"";
    urls=BASE_URL+"/index.php?ngmar=chapterlist&sajax=getchapterlist&h="+input[1]+"&bookid="+input[2]
    let response= fetch(urls,{
        method:"GET",
        headers:{
            "Referer": `${url}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0"
        }
    })
    if(response.ok){
        let books=response.json()
        let toc=books.data
        const regex1 = /1-\/-(\d+)-\/-([^\/]+)/;
        const chapters = [];
    // http://14.225.254.182/index.php?bookid=7525068004636232728&h=fanqie&c=7525451194425147929&ngmar=readc&sajax=readchapter&sty=1&exts=
        toc.split('-//-').forEach(e=>{
        chapters.push({
            url:"/index.php?bookid="+input[2]+"&h="+input[1]+"&c="+e.match(regex1)[1]+"&ngmar=readc&sajax=readchapter&sty=1&exts="+ext+"|"+url+e.match(regex1)[1]+"/",
            name:e.match(regex1)[2],
            host :BASE_URL
            })
        })
    return Response.success(chapters);
    }
    return Response.error
}