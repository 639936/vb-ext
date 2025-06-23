load("language_list.js"); 

function execute(text, from, to, apiKey1) {
    let apiKey = "AIzaSyDgovtoLcEZ5TWZ8Hnt36zBvFk5OZQWSww";
    if (!apiKey) {
        return Response.success("");
    }
    console.log(apiKey);
    console.log(text);
    console.log(from);
    console.log(to);

    const system_prompt = `với yêu cầu: Đảm bảo giữ nguyên văn phong, nội dung và cảm xúc của các nhân vật. các đại từ nhân xưng phù hợp với hoàn cảnh. Văn bản dịch phải lôi cuốn và khắc họa được tình cảm trong văn bản gốc. Với văn bản tiếng Trung, nên dùng các đại từ nhân xưng "ta", "ngươi", "hắn", "nàng" để dịch, không dùng các từ như "cô ta", "anh ta". Dịch không bỏ sót chi tiết nào. Chỉ trả về văn bản đã dịch, không thêm bất kỳ lời giải thích hay ghi chú nào khác.`;

    const full_prompt = `---\n${text}\n---\n\nDịch văn bản sau từ '${from}' sang '${to}' ${system_prompt}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 0.5, "topK": 1, "topP": 1, "maxOutputTokens": 8192, "stopSequences": []
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    let response = fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        let result = JSON.parse(response.text());

        if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0]) {
            let translatedBlock = result.candidates[0].content.parts[0].text;
            
            // Xử lý để đảm bảo định dạng đầu ra tương thích
            let lines = translatedBlock.split('\n');
            let trans = "";
            lines.forEach(line => {
                trans += line + "\n";
            });
            
            return Response.success(trans.trim());

        } else {
            // 2. Lỗi: API trả về thành công nhưng không có nội dung
            // Thay vì báo lỗi, trả về một chuỗi rỗng.
            return Response.success("");
        }
    } else {
        // 3. Lỗi: Gọi API thất bại (sai key, lỗi mạng, v.v.)
        // Thay vì báo lỗi, trả về một chuỗi rỗng.
        return Response.success("");
    }
}