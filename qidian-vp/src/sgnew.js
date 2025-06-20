load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
            let doc = response.html();
            let books = [];
                    books.push({
                        name: doc.select(".box-content h1").text(),
                        cover: doc.select(".box-content img").first().attr("src"),
                        link: url,
                        description: 0,
                        host: BASE_URL
                    });
            return Response.success(books);
    };
}
