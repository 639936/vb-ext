load('config.js');

function execute() {
    return Response.success([
        {
            input: BASE_URL,
            title: "Mới cập nhật",
            script: "gen.js"
        }
    ]);
}