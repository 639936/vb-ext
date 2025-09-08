function execute() {
    return Response.success([
        {title: "Truyện theo dõi", input: "http://14.225.254.182/io/bookfollow/getFollowedBooks?format=html&user=0&filter=", script: "gen.js"},
        {title: "Mới cập nhật", input: "update", script: "gen.js"},
        {title: "Lượt đọc tổng", input: "view", script: "gen.js"},
        {title: "Lượt đọc tuần", input: "viewweek", script: "gen.js"},
        {title: "Lượt đọc ngày", input: "viewday", script: "gen.js"},
        {title: "Lượt thích", input: "like", script: "gen.js"},
        {title: "Lượt theo dõi", input: "following", script: "gen.js"},
        {title: "Lượt đánh dấu", input: "bookmarked", script: "gen.js"},
        {title: "Đề cử", input: "auto", script: "gen.js"},
    ]);
}