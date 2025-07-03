load('config.js');

function execute(url) {
    url = url.replace(BASE_URL + "/vBook/Book/", "")
    var response = fetch(BASE_URL + "/api/file/list?path=%2FvBook%2FBook%2F" + url + "%2F&sort=default&sort-reversed=false", {
        method: "GET"
    });

    if (response.ok) {
        let jsonList = response.json(); 
        var data = [];
        jsonList.forEach(item => {
            if (item.directory === false && item.name !== "..") {
                data.push({
                    name: item.name,
                    url: BASE_URL + "/vBook/Book/" + url + "/" + encodeURIComponent(item.name),
                });
            }
        });
        return Response.success(data);
    }
    return null
}