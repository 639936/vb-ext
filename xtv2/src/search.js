load("config.js");
function execute(key, page) { 
    // 1. Dọn dẹp URL, chỉ giữ lại tham số cần thiết
    let url = `https://www.google.com/search?q=${encodeURIComponent(key)}+site:truyensextv2.cc`;
    console.log(url)
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let data = [];
        
        // 2. Sửa lại selector cho đúng cú pháp
        // Google trả về các link trong các thẻ div có class nhất định
        let elems = doc.select("div.g"); 

        if (!elems.length) return Response.error(key);

        elems.forEach(function(e) {
            // 3. Sửa logic lấy link và tiêu đề
            let a = e.select("a[href^='/url?q=']").first(); // Link nằm trong thẻ a này
            let h3 = e.select("h3").first(); // Tiêu đề nằm trong thẻ h3

            if (a && h3) {
                let link = a.attr("href");
                // Trích xuất URL thật từ link của Google
                let realLink = link.match(/q=(.*?)&/);
                if (realLink && realLink[1]) {
                     // Decode URL và chỉ lấy phần đến trước dấu / cuối cùng nếu cần
                    let decodedLink = decodeURIComponent(realLink[1]);
                    if (decodedLink.includes("truyensextv2.cc")) {
                        data.push({
                            name: h3.text(),
                            link: decodedLink,
                            host: BASE_URL
                        });
                    }
                }
            }
        });
        return Response.success(data);
    }
    return null;
}