function execute(url) {
    let body = {
        method: "POST",
        headers: {
            "User-Agent": UserAgent.android()
        }
    };
    
    let response = fetch(url, body);
    if (response.ok) {
        let doc = response.html();
        let content = "";
        console.log(doc);
        doc.select(".line").forEach(e => {
            content += e.text() + "<br>";
        });
        if (content && !content.includes("您在登录后即可阅读")) {
            return Response.success(content);
        } else return Response.error("đăng nhập hoặc xác thực capcha để đọc")
    }
    return null
}