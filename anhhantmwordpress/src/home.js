function execute() {
    return Response.success([
        {title: "List", input: "/", script: "gen.js"},
    ]);
}