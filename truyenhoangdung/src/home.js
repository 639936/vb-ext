load('config.js');

function execute() {
    return Response.success([
        {
            input: "/danh-muc/truyen-dich",
            title: "Truyện dịch",
            script: "gen.js"
        },
        {
            input: "/danh-muc/truyen-sang-tac",
            title: "Truyện sáng tác",
            script: "gen.js"
        },
        {
            input: "/danh-muc/bang-xep-hang",
            title: "Bảng Xếp Hạng",
            script: "gen.js"
        },
        {
            input: "/danh-muc/truyen-tra-phi",
            title: "Truyện trả phí",
            script: "gen.js"
        },
        {
            input: "/danh-muc/truyen-de-cu",
            title: "Truyện đề cử",
            script: "gen.js"
        },
        {
            input: "/danh-muc/truyen-da-hoan-thanh",
            title: "Truyện đã hoàn thành",
            script: "gen.js"
        },
        {
            input: "/danh-muc/truyen-convert",
            title: "Truyện convert",
            script: "gen.js"
        }
    ]);
}