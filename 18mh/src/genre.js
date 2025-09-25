load("config.js");

function execute() {
        let data = [
            { title: "收藏榜", input: "0", script: "bxh.js" },
            { title: "周榜", input: "1", script: "bxh.js" },
            { title: "月榜", input: "2", script: "bxh.js" },
            { title: "年榜", input: "3", script: "bxh.js" },
        ];
        let resGenre = fetch(BASE_URL + "/novel");
        if (resGenre.ok) {
            let doc2 = resGenre.html().select(".app-content > div > ul > li");
            doc2.forEach(e => {
                let link = e.select("a").attr("href");
                if (link === "/novel/rank" || link === "/novel/all") return;
                data.push(
                    { title: e.select("a").text(), input: link + "&", script: "gen.js" }
                );
            })
            return Response.success(data);
        }
        return null;;
}