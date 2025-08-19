load('config.js');
function execute(url) {
    var response = fetch(url, {
        method: "GET"
    });

    if (response.ok) {
        let jsonList = response.json(); 
        var data = [];
        jsonList.forEach(item => {
            if (item.directory === false && item.name !== "..") {
                data.push({
                    name: item.name.replace(/\.html/gi, ""),
                    url: current_host + "/vBook/Book/" + url + "/" + encodeURIComponent(item.name),
                });
            }
        });
        return Response.success(data);
    } else {
         return Response.success([{
             name: url,
             url: url
         }])
    }
}