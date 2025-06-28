load('config.js');

function execute() {
    return Response.success([
        {
            input: BASE_URL,
            title: "Mới cập nhật",
            script: "gen.js"
        },
        {
            input: BASE_URL + "/?s=&post_type=wp-manga&m_orderby=views",
            title: "Most views",
            script: "gen1.js"
        },
        {
            input: BASE_URL + "/?s&post_type=wp-manga&m_orderby=trending",
            title: "Trending",
            script: "gen1.js"
        },
        {
            input: BASE_URL + "?s&post_type=wp-manga&m_orderby=rating",
            title: "Rating",
            script: "gen1.js"
        }
    ]);
}