function execute() {
    return Response.success([
        { title: "首页", input: "", script: "gen0.js" },
        { title: "全部小说", input: "/novel/all?page=", script: "gen.js" },
        { title: "热门小说", input: "/novel/common?type=hot&page=", script: "gen.js" },
        { title: "最新上架", input: "/novel/common?type=last_published&page=", script: "gen.js" },
        { title: "最新更新", input: "/novel/common?type=newest&page=", script: "gen.js" }
    ]);
}
