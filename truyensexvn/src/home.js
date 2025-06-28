load('config.js');

function execute() {
    return Response.success([
        {
            input: "?s=+",
            title: "Mới cập nhật",
            script: "gen1.js"
        },
        {
            input: "/truyen-sex-dai-tap",
            title: "Truyện Sex dài tập",
            script: "gen.js"
        },
        {
            input: "/truyen-sex-ngan",
            title: "Truyện Sex ngắn",
            script: "gen.js"
        }
    ]);
}