
function execute() {
    return Response.success([
        {
            title: "DANH SÁCH KEY & HƯỚNG DẪN",
            input: "list_keys", 
            script: "gen.js"
        }
    ]);
}