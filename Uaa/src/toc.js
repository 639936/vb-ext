load('config.js')

function execute(url) {
    let response = fetch(url);let data=[]
    if (response.ok) {

        let doc = response.html();
        //console.log(json)
        
        let chapters=doc.select(".catalog_box .catalog_ul li.menu")
        chapters.forEach(e => {
        let k = e.select("span").text();
        if (k!=="游客" && k!=="注册会员") {k=""} else {k=">"}
        //.replace(/游客/g, ">").replace(/注册会员/g, ">")
        data.push({
            name: e.select("a").text().replace(/new/g, "") + k,
            url: e.select("a").first().attr("href"),
            
        })
        
    })
        
        return Response.success(data);
       
    }
    return null;
}

