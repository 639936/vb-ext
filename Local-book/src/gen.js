load('config.js');

function execute(url) {
    var response = fetch(BASE_URL + "/api/file/list?path=%2FvBook%2FBook&sort=modified&sort-reversed=false", {
        method: "GET"
    });

    if (response.ok) {
        let jsonList = response.json(); 
        var data = [];
        jsonList.forEach(item => {
            if (item.directory === true && item.name !== "..") {
                data.push({
                    name: item.name,
                    link: encodeURIComponent(item.name),
                });
            }
        });
        return Response.success(data);
    }
    return null
}