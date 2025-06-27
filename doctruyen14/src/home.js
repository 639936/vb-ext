load('config.js');

function execute() {
    return Response.success([
        {title: "Sex người lớn", input: BASE_URL + "/truyen-sex-nguoi-lon/", script: "gen.js"},
        {title: "Ma", input: BASE_URL + "/truyen-ma/", script: "gen.js"},
        {title: "Teen", input: BASE_URL + "/truyen-teen/", script: "gen.js"},
        {title: "Tình cảm", input: BASE_URL + "/truyen-tinh-cam/", script: "gen.js"},
        {title: "Cười", input: BASE_URL + "/truyen-cuoi/", script: "gen.js"},
        {title: "Les", input: BASE_URL + "/truyen-les/", script: "gen.js"},
    ]);
}