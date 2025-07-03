load('config.js');
function execute(url) {
    url = url.replace(BASE_URL, "");
    url = url.replace("/vBook/Book/", "");
    var response = fetch(BASE_URL + "/api/file/list?path=%2FvBook%2FBook%2F" + url + "%2F&sort=default&sort-reversed=false", {
        method: "GET"
    });

    if (response.ok) {
        let jsonList = response.json(); 
        var data = [];
        jsonList.forEach(item => {
            if (item.directory === false && item.name !== "..") {
                data.push({
                    name: item.name.replace(/\.html/gi, ""),
                    url: BASE_URL + "/vBook/Book/" + url + "/" + encodeURIComponent(item.name),
                });
            }
        });
        return Response.success(data);
    } else {
         return Response.success([{
             name: url
         }])
    }
    return null
}