// File này không cần load language_list.js
load("language_list.js"); 

function execute(text, from, to, apiKey1) {
    let apiKey = "";
    // Nếu không có API Key, báo lỗi ngay lập tức.
    if (!apiKey) {
        return Response.error("API Key của Google AI Studio là bắt buộc.");
    }

    // Prompt dịch thuật chi tiết bạn đã cung cấp (đã cập nhật)
    const system_prompt = `Bạn cũng là công cụ dịch trang web nhanh chóng.
Khi dịch trang web, hãy dịch nhanh các phần không phải nội dung chính.
Khi dịch nội dung văn bản, bạn là một dịch giả chuyên nghiệp tiếng Anh, Trung, Nhật, và Hàn.
Hãy dịch văn bản sang tiếng Việt, đảm bảo giữ nguyên văn phong, đại từ nhân xưng. 
Văn bản dịch phải lôi cuốn và khắc họa được tình cảm trong văn bản gốc.
Lưu ý quan trọng:
- Với văn bản tiếng Trung, các tên riêng phải được dịch sang Hán Việt.
- Với văn bản tiếng Anh phải giữ nguyên các tên riêng gốc.
- Với văn bản tiếng Hàn, Nhật, các tên cần chuyển sang tên latin.
- Với văn bản tiếng Việt dịch sang các ngôn ngữ khác, hãy dịch tên tương ứng trong ngôn ngữ đích.
Chỉ trả về văn bản đã dịch, không thêm bất kỳ lời giải thích hay ghi chú nào khác.`;

    // Tạo nội dung hoàn chỉnh để gửi cho AI
    const full_prompt = `${system_prompt}\n\nDịch văn bản sau từ '${from}' sang '${to}':\n\n---\n${text}\n---`;

    // API Endpoint của Google Gemini. Model 'gemini-1.5-flash' nhanh và rẻ hơn.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // Cấu trúc body cho request tới API Gemini
    const body = {
        "contents": [{
            "parts": [{
                "text": full_prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.5,
            "topK": 1,
            "topP": 1,
            "maxOutputTokens": 8192,
            "stopSequences": []
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    // Thực hiện gọi API
    let response = fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        let result = JSON.parse(response.text());

        if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0]) {
            let translatedText = result.candidates[0].content.parts[0].text;
            return Response.success(translatedText.trim());
        } else {
            let error_reason = "Không nhận được nội dung dịch.";
            if (result.candidates && result.candidates[0] && result.candidates[0].finishReason) {
                error_reason = `Dịch thất bại, lý do: ${result.candidates[0].finishReason}`;
                 if(result.promptFeedback && result.promptFeedback.blockReason) {
                    error_reason += ` (${result.promptFeedback.blockReason})`;
                }
            }
            return Response.error(error_reason);
        }
    } else {
        let error_details = response.text();
        return Response.error(`Lỗi API (${response.status}): ${error_details}`);
    }
}