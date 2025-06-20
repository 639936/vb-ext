load("config.js");
function execute(url) {
    if (url.includes('/tin-tuc/')) {
        let response = fetch(url)
        if (response.ok) {
            let doc = response.html();
            let list = [];
            list.push({
                        name: doc.select(".box-content h1").text(),
                        url: url,
                        host: BASE_URL
                    })
            return Response.success(list)
        }        
    } else {
        console.log(url + "/muc-luc")
        let response = fetch(url + "/muc-luc")
            if (response.ok) {
                let data = response.html().select("#chapter-list a");
                let list = [];
                data.forEach(e => {
                    list.push({
                        name: e.select("h3").text(),
                        url: e.attr("href"),
                        host: BASE_URL
                    })
                });
                return Response.success(list);
            }  
        }
    return null
}

