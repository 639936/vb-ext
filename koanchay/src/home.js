load("config.js");

function execute() {
    return Response.success([
        {title: "Chương mới", script: "gen.js", input: BASE_URL + "/chuong-moi"},
        {title: "BXH lượt xem tuần", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=1&tr=1&vo=1"},
        {title: "BXH lượt xem tháng", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=1&tr=2&vo=1"},
        {title: "BXH lượt xem ALL", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=1&tr=4&vo=1"},
        {title: "BXH Rating tuần", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=2&tr=1&vo=1"},
        {title: "BXH Rating tháng", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=2&tr=2&vo=1"},
        {title: "BXH Rating ALL", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=2&tr=4&vo=1"},
        {title: "BXH cmt tuần", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=3&tr=1&vo=1"},
        {title: "BXH cmt tháng", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=3&tr=2&vo=1"},
        {title: "BXH cmt ALL", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=3&tr=4&vo=1"},
        {title: "BXH NEW tuần", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=4&tr=1&vo=1"},
        {title: "BXH NEW tháng", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=4&tr=2&vo=1"},
        {title: "BXH NEW ALL", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=4&tr=4&vo=1"},
        {title: "BXH hoàn thành tuần", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=5&tr=1&vo=1"},
        {title: "BXH hoàn thành tháng", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=5&tr=2&vo=1"},
        {title: "BXH hoàn thành ALL", script: "gen.js", input: BASE_URL + "/bang-xep-hang?so=5&tr=4&vo=1"},
    ]);
}