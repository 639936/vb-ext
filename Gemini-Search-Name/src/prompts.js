const promptLibrary = {
    // Prompt mặc định nếu không tìm thấy chế độ nào khớp
    'default': `Dịch văn bản một cách chính xác và tự nhiên từ ngôn ngữ nguồn sang ngôn ngữ đích.`,
    
    // Prompt cho chế độ Phổ thông
    'vi-general': `Dịch văn bản một cách chính xác, rõ ràng và tự nhiên sang tiếng Việt hiện đại. Giữ văn phong trung lập, dễ hiểu.`,

    // Prompt cho chế độ Tiên Hiệp
    'vi-tienhiep': `Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện tiên hiệp.
Yêu cầu:
1.  **Từ ngữ**: Sử dụng nhiều từ Hán Việt, thành ngữ cổ, và các từ ngữ mang sắc thái cổ xưa.
2.  **Xưng hô**: Ưu tiên sử dụng các đại từ cổ phong như "ta", "ngươi", "hắn", "nàng", "bần đạo", "tại hạ", "chư vị". Tuyệt đối không dùng "anh ta", "cô ấy".
3.  **Giọng văn**: Trang trọng, uy nghiêm nhưng vẫn phải lôi cuốn.
4.  **Tên riêng**: Tên người, địa danh, công pháp phải được dịch sang Hán Việt và thống nhất.
5.  **Đầu ra**: Chỉ trả về văn bản đã dịch.`,

    // Prompt cho chế độ Huyền Huyễn
    'vi-huyenhuyen': `Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện huyền huyễn kỳ ảo.
Yêu cầu:
1.  **Từ ngữ**: Kết hợp từ Hán Việt với các từ ngữ hiện đại hơn một chút so với tiên hiệp, tạo cảm giác kỳ ảo, ma mị. Có thể sáng tạo các thuật ngữ mới nếu cần.
2.  **Xưng hô**: Linh hoạt giữa "ta-ngươi", "tôi-bạn" tùy theo bối cảnh (thế giới phép thuật ở đô thị, trường học ma pháp...).
3.  **Giọng văn**: Hùng vĩ, tráng lệ, tập trung miêu tả những cảnh tượng kỳ vĩ, những trận chiến đầy màu sắc phép thuật.
4.  **Đầu ra**: Chỉ trả về văn bản đã dịch.`,

    // Prompt cho chế độ Đô Thị Hiện Đại
    'vi-dothi': `Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện đô thị hiện đại.
Yêu cầu:
1.  **Từ ngữ**: Sử dụng ngôn ngữ hiện đại, gần gũi với đời sống, có thể dùng tiếng lóng, từ thông dụng trên mạng xã hội nếu phù hợp.
2.  **Bối cảnh**: Chú ý đến các yếu tố hiện đại như tên thương hiệu, công nghệ, địa điểm nổi tiếng và dịch hoặc giữ nguyên một cách hợp lý.
3.  **Xưng hô**: Dùng "tôi", "bạn", "anh", "em", "cô", "chú" một cách tự nhiên theo ngữ cảnh.
4.  **Đầu ra**: Chỉ trả về văn bản đã dịch.`,

    // Prompt cho chế độ Sắc Hiệp (Lưu ý: Vẫn phải tuân thủ chính sách của API)
    'vi-sac': `Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện người lớn, tập trung vào mô tả cảm xúc và chi tiết tinh tế.
Yêu cầu:
1.  **Từ ngữ**: Sử dụng ngôn ngữ gợi cảm, hoa mỹ, tập trung vào việc miêu tả tâm trạng, cảm xúc nhân vật và không khí của cảnh truyện. Tránh từ ngữ thô tục, trực diện.
2.  **Nhịp điệu**: Dịch với nhịp điệu chậm rãi, uyển chuyển, lôi cuốn.
3.  **Cảm xúc**: Đảm bảo truyền tải được sự sâu sắc trong tình cảm và sự tinh tế trong các tương tác của nhân vật.
4.  **Đầu ra**: Chỉ trả về văn bản đã dịch.`,

    // Prompt cho chế độ Trinh thám
    'vi-trinhtham': `Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện trinh thám, hình sự.
Yêu cầu:
1.  **Từ ngữ**: Chính xác, logic, rõ ràng. Sử dụng đúng các thuật ngữ chuyên ngành (pháp y, điều tra, tội phạm học) nếu có.
2.  **Giọng văn**: Tập trung vào việc xây dựng sự căng thẳng, hồi hộp, gay cấn. Lời văn cần sắc bén, không rườm rà.
3.  **Chi tiết**: Tuyệt đối không bỏ sót các chi tiết, manh mối nhỏ có trong văn bản gốc.
4.  **Đầu ra**: Chỉ trả về văn bản đã dịch.`,

    // Prompt cho chế độ Phân tích (từ yêu cầu trước của bạn)
    'vi-analyzer': `Mục tiêu: Phân tích và xử lý văn bản tiếng Trung, trích xuất và dịch các thành phần cụ thể theo văn phong truyện tiên hiệp/huyền huyễn của Việt Nam.
Yêu cầu chi tiết:
1.  **Phân tích và Trích xuất**:
    *   **Nhiệm vụ 1: Tìm và Dịch Tên Riêng (Hán Việt)**: Xác định tất cả tên riêng (người, địa danh, môn phái, công pháp) và dịch sang Hán Việt.
    *   **Nhiệm vụ 2: Tìm và Dịch Cụm Từ (Việt Phrase)**: Xác định các cụm từ phổ biến và dịch sang tiếng Việt cổ phong.
    *   **Nhiệm vụ 3: Tạo Luật Thay Thế (Luật Nhân)**: Tìm các cấu trúc có chứa số/danh từ có thể thay thế và tạo quy tắc chung với placeholder {0}.
2.  **Định dạng đầu ra BẮT BUỘC**:
    *   Kết quả phải là văn bản thuần túy, KHÔNG có markdown.
    *   Nội dung chia thành BA phần: \`- tên:\`, \`- việt phrase:\`, \`- luật nhân:\`.
    *   Mỗi mục theo định dạng \`Tiếng Trung=Tiếng Việt\`.
QUY TẮC TUYỆT ĐỐI: Chỉ trả về kết quả theo đúng định dạng trên. Không thêm bất kỳ văn bản nào khác.`
};