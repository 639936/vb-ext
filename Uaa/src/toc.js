load('config.js')

function execute(url) {
    let response = fetch(url);let data=[]
    if (response.ok) {

        let doc = response.html();
        //console.log(json)
        
        let chapters=doc.select(".catalog_box .catalog_ul li.menu")
        chapters.forEach(e => {
        console.log(e)
        data.push({
            name: e.text().replace(/游客/g, ">").replace(/注册会员/g, ">"),
            url: e.select("a").first().attr("href"),
            
        })
        
    })
        
        return Response.success(data);
       
    }
    return null;
}

