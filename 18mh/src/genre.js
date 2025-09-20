load("config.js");

function execute() {
    let response1 = fetch(BASE_URL + "/novel/rank", header);
    if (response1.ok) {
        let doc1 = response1.html().select(".index-content");
        var data = [
            { title: "收藏榜", input: doc1.select(".dx-tab-content").get(1), script: "bxh.js" },
            { title: "周榜", input: doc1.select(".dx-tab-content").get(2), script: "bxh.js" },
            { title: "月榜", input: doc1.select(".dx-tab-content").get(3), script: "bxh.js" },
            { title: "年榜", input: doc1.select(".dx-tab-content").get(4), script: "bxh.js" },
        ];
        let response2 = fetch(BASE_URL + "/novel", header);
        if (response2.ok) {
            let doc2 = response2.html().select(".app-content > div li");
            doc2.forEach(e => {
                let link = e.select("a").attr("href");
                if (link === "/novel/rank" || link === "/novel/all") return;
                data.push(
                    { title: e.select("a").text(), input: link, script: "gen.js" }
                );
            })
        }
        return Response.success(data);
    }
    return null;
}