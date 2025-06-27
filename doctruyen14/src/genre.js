load('config.js');

function execute() {
    const url = BASE_URL + "/truyen-sex-nguoi-lon/";
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var data = [];
        doc.select(".tagcloud a").forEach(el => {
            data.push({
                title: el.text(),
                input: el.attr("href"),
                script: "sg.js"
            })
        })
        return Response.success(data)
    }
}