load("language_list.js"); 

function execute(text, from, to) {
    // --- BẮT ĐẦU PHẦN TÍCH HỢP ---
    
    // 1. Logic tạo system_prompt động
    let pronounRule;
    let nameRule;
    let modeRule;

    // Thiết lập quy tắc "Đại Từ Nhân Xưng"
    if (from === 'zh' && to === 'vi') {
        pronounRule = `Đối với chuyển ngữ từ zh sang vi: Ưu tiên sử dụng các đại từ nhân xưng cổ phong như "ta", "ngươi", "hắn", "nàng". Tuyệt đối không dùng các từ như "cô ta", "anh ta".`;
    } else {
        pronounRule = `Các đại từ nhân xưng phải phù hợp với hoàn cảnh, không khí và mối quan hệ của nhân vật trong văn bản.`;
    }

    // Thiết lập quy tắc "Tên Nhân Vật"
    if (from === 'zh') {
        nameRule = `Tên của nhân vật phải được dịch sang Hán Việt và có tính đồng nhất trong toàn bộ văn bản.`;
    } else {
        nameRule = `Tên của nhân vật phải được giữ nguyên hoặc phiên âm hợp lý, đảm bảo tính đồng nhất trong toàn bộ văn bản.`;
    }

    // Thiết lập quy tắc "Chế độ Chuyển ngữ/Sáng tạo"
    if (from === 'vi' && to === 'vi') {
        modeRule = `Khi chuyển ngữ từ vi sang vi: Sáng tạo lại nội dung dựa trên cốt truyện, cảm xúc, thông điệp và văn phong gốc. Bản sáng tạo phải mang tính độc đáo nhưng vẫn tuân thủ tất cả các tiêu chí đã nêu.`;
    } else {
        // Quy tắc chung cho tất cả các cặp dịch thuật khác
        modeRule = `Thực hiện dịch thuật văn bản từ ngôn ngữ nguồn ('${from}') sang ngôn ngữ đích ('${to}'), tuân thủ tất cả các tiêu chí đã nêu.`;
    }

    // 2. Tạo system_prompt hoàn chỉnh từ các quy tắc đã xác định
    const system_prompt = `Mục tiêu: Chuyển ngữ hoặc sáng tạo lại văn bản, đảm bảo duy trì tối đa văn phong, nội dung và cảm xúc gốc, đồng thời phù hợp với các quy tắc ngôn ngữ và phong cách đã định.
Yêu cầu chi tiết:
1.  **Văn phong, Nội dung & Cảm xúc:** Đảm bảo giữ nguyên vẹn văn phong, truyền tải đầy đủ nội dung và cảm xúc sâu sắc của các nhân vật.
2.  **Tính Lôi Cuốn:** Văn bản dịch/sáng tạo phải lôi cuốn, hấp dẫn người đọc và khắc họa rõ nét tình cảm trong văn bản gốc.
3.  **Độ Chính Xác:** Đảm bảo truyền tải đầy đủ, chính xác mọi ý nghĩa, thông tin và chi tiết cốt lõi của văn bản gốc, không lược bỏ bất kỳ ý tứ quan trọng nào.
4.  **Đại Từ Nhân Xưng:** ${pronounRule}
5.  **Tên Nhân Vật:** ${nameRule}
6.  **Chế độ Chuyển ngữ/Sáng tạo:** ${modeRule}
7.  **Định dạng đầu ra:** Chỉ trả về văn bản đã được dịch hoặc sáng tạo, không thêm bất kỳ lời giải thích hay ghi chú nào khác trong bất cứ trường hợp nào. Nếu đầu vào là trống, trả lời bằng một dấu ?, không trả lời bằng bất kỳ cách thức khác.`;
    
    // --- KẾT THÚC PHẦN TÍCH HỢP ---
    
    // API Key được giữ nguyên theo cấu trúc gốc của bạn
    let apiKey = ""; // <--- Vui lòng nhập API Key của bạn vào đây
    if (!apiKey) {
        // Trả về lỗi nếu chưa có key
        console.log("Vui lòng nhập API Key");
        return Response.error("API Key không hợp lệ.");
    }
    
    // Xử lý đầu vào trống trước khi gọi API để tiết kiệm tài nguyên
    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    // Tạo prompt cuối cùng để gửi đến API.
    // Lưu ý: Cấu trúc prompt này kết hợp cả System Prompt và User Prompt thành một.
    const full_prompt = `${system_prompt}\n\n---\n\n${text}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 0.5,
            "topK": 1,
            "topP": 1,
            "maxOutputTokens": 64000, // Tăng giới hạn token cho các văn bản dài
            "stopSequences": []
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    try {
        let response = fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            let result = JSON.parse(response.text());

            // Kiểm tra lỗi từ API (ví dụ: bị chặn do an toàn)
            if (result.candidates && result.candidates.length > 0) {
                 if (result.candidates[0].content && result.candidates[0].content.parts[0]) {
                    let translatedText = result.candidates[0].content.parts[0].text;
                    return Response.success(translatedText.trim());
                }
            }
            
            // Xử lý trường hợp API trả về nhưng không có nội dung hoặc bị chặn
            if (result.promptFeedback && result.promptFeedback.blockReason) {
                console.log("Yêu cầu bị chặn bởi API. Lý do: " + result.promptFeedback.blockReason);
                return Response.error("Yêu cầu bị chặn bởi API vì lý do an toàn.");
            }

            console.log("API không trả về nội dung hợp lệ. Phản hồi: " + JSON.stringify(result));
            return Response.error("Không nhận được bản dịch từ API.");

        } else {
            console.log(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
            return Response.error(`Lỗi kết nối đến API: ${response.status}`);
        }
    } catch (e) {
        console.log("Exception khi gọi API: " + e.toString());
        return Response.error("Đã xảy ra lỗi trong quá trình dịch.");
    }
}