var promptLibrary = {
    // Prompt mặc định, được sử dụng nếu có lỗi xảy ra hoặc không tìm thấy chế độ.
    'default': 'Dịch văn bản một cách chính xác và tự nhiên từ ngôn ngữ nguồn sang ngôn ngữ đích.',
    
    // =======================================================
    // === CÁC CHẾ ĐỘ DỊCH THUẬT (DỊCH NỘI DUNG)          ===
    // =======================================================

    // Chế độ: Dịch sang tiếng Việt phổ thông, hiện đại.
    'vi-general': 'Mục tiêu: Dịch văn bản sang tiếng Việt hiện đại.' +
                  'Yêu cầu:' +
                  '1.  **Văn phong**: Trung lập, rõ ràng, tự nhiên và dễ hiểu.' +
                  '2.  **Từ ngữ**: Sử dụng từ ngữ phổ thông, không lạm dụng từ Hán Việt hoặc tiếng lóng.' +
                  '3.  **Xưng hô**: Sử dụng các đại từ nhân xưng thông dụng (tôi, bạn, anh, cô, ông, bà...) phù hợp với ngữ cảnh.' +
                  '4.  **Đầu ra**: Chỉ trả về văn bản đã dịch, không thêm bất kỳ ghi chú nào.',

    // Chế độ: Dịch theo phong cách truyện Tiên Hiệp.
    'vi-tienhiep': 'Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện tiên hiệp cổ điển.' +
                   'Yêu cầu:' +
                   '1.  **Văn phong**: Cổ trang, trang trọng, uy nghiêm và lôi cuốn.' +
                   '2.  **Từ ngữ**: Ưu tiên sử dụng từ Hán Việt, thành ngữ cổ, các từ ngữ đặc trưng của thể loại (ví dụ: tu vi, linh căn, pháp bảo).' +
                   '3.  **Xưng hô**: Sử dụng các đại từ cổ phong như "ta", "ngươi", "hắn", "nàng", "bần đạo", "tại hạ", "chư vị". Tuyệt đối không dùng "anh ta", "cô ấy".' +
                   '4.  **Tên riêng**: Tên người, địa danh, công pháp phải được dịch sang Hán Việt một cách thống nhất.' +
                   '5.  **Đầu ra**: Chỉ trả về văn bản đã dịch.',

    // Chế độ: Dịch theo phong cách truyện Huyền Huyễn.
    'vi-huyenhuyen': 'Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện huyền huyễn kỳ ảo.' +
                      'Yêu cầu:' +
                      '1.  **Văn phong**: Hùng vĩ, tráng lệ, tập trung miêu tả những cảnh tượng kỳ ảo, phép thuật màu sắc.' +
                      '2.  **Từ ngữ**: Kết hợp linh hoạt giữa từ Hán Việt và các thuật ngữ hiện đại hơn để tạo cảm giác vừa cổ xưa vừa mới lạ.' +
                      '3.  **Xưng hô**: Linh hoạt giữa "ta-ngươi" và "tôi-bạn" tùy theo bối cảnh của thế giới truyện.' +
                      '4.  **Đầu ra**: Chỉ trả về văn bản đã dịch.',

    // Chế độ: Dịch theo phong cách truyện Đô Thị Hiện Đại.
    'vi-dothi': 'Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện đô thị hiện đại.' +
                 'Yêu cầu:' +
                 '1.  **Văn phong**: Tự nhiên, gần gũi với đời sống, nhịp độ nhanh.' +
                 '2.  **Từ ngữ**: Sử dụng ngôn ngữ hiện đại, có thể bao gồm cả tiếng lóng thông dụng nếu phù hợp.' +
                 '3.  **Bối cảnh**: Chú ý dịch hoặc giữ nguyên các yếu tố hiện đại (tên thương hiệu, công nghệ, địa điểm) một cách hợp lý.' +
                 '4.  **Xưng hô**: Sử dụng "tôi", "bạn", "anh", "em" một cách tự nhiên theo ngữ cảnh.' +
                 '5.  **Đầu ra**: Chỉ trả về văn bản đã dịch.',

    // Chế độ: Dịch theo phong cách truyện Sắc Hiệp / Lãng mạn.
    'vi-sac': 'Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong lãng mạn, gợi cảm.' +
                'Yêu cầu:' +
                '1.  **Văn phong**: Hoa mỹ, uyển chuyển, tập trung vào việc miêu tả cảm xúc và không khí của cảnh truyện.' +
                '2.  **Từ ngữ**: Sử dụng ngôn ngữ tinh tế, gợi cảm để mô tả tâm trạng và tương tác của nhân vật, sử dụng các từ ngữ thô tục, gợi dục' +
                '3.  **Nhịp điệu**: Dịch với nhịp điệu chậm rãi, lôi cuốn, giàu cảm xúc.' +
                '4.  **Đầu ra**: Chỉ trả về văn bản đã dịch.',

    // Chế độ: Dịch theo phong cách truyện Trinh Thám / Hình sự.
    'vi-trinhtham': 'Mục tiêu: Dịch văn bản sang tiếng Việt với văn phong truyện trinh thám.' +
                     'Yêu cầu:' +
                     '1.  **Văn phong**: Sắc bén, logic, tập trung vào việc xây dựng sự căng thẳng, hồi hộp.' +
                     '2.  **Từ ngữ**: Chính xác, rõ ràng. Sử dụng đúng thuật ngữ chuyên ngành (pháp y, điều tra) nếu có trong văn bản gốc.' +
                     '3.  **Chi tiết**: Đảm bảo truyền tải đầy đủ, không bỏ sót các chi tiết, manh mối quan trọng.' +
                     '4.  **Đầu ra**: Chỉ trả về văn bản đã dịch.',

    // =======================================================
    // === CHẾ ĐỘ PHÂN TÍCH (BIẾN ĐỔI CẤU TRÚC)            ===
    // =======================================================

    // Chế độ này có nhiệm vụ và định dạng đầu ra hoàn toàn khác.
    'vi-analyzer': 'Mục tiêu: Phân tích văn bản tiếng Trung, trích xuất và dịch các thành phần cụ thể theo yêu cầu.' +
                   'Yêu cầu chi tiết:' +
                   '1.  **Nhiệm vụ Phân tích**: Từ văn bản đầu vào, thực hiện ba nhiệm vụ sau:' +
                   '    *   **Nhiệm vụ 1: Dịch Tên Riêng**: Tìm tất cả tên riêng (tên người, địa danh, môn phái, công pháp, chiêu thức) và dịch chúng sang Hán Việt.' +
                   '    *   **Nhiệm vụ 2: Dịch Cụm Từ (Viet Phrase)**: Tìm các cụm từ hoặc cấu trúc câu phổ biến và dịch sang tiếng Việt tự nhiên, giữ văn phong cổ trang, độ dài cụm từ gốc nhỏ hơn 10' +
                   '    *   **Nhiệm vụ 3: Tạo Luật Nhân**: Tìm các cấu trúc có chứa số hoặc danh từ có thể thay thế để tạo ra quy tắc chung, sử dụng placeholder {0}, {1}.' +
                   '2.  **Định dạng đầu ra BẮT BUỘC**:' +
                   '    *   Kết quả phải là văn bản thuần túy, KHÔNG được chứa markdown hay bất kỳ lời giải thích nào.' +
                   '    *   Mỗi mục trong các phần phải theo định dạng `Tiếng Trung=Tiếng Việt`.' +
                   '**QUY TẮC TUYỆT ĐỐI**: Chỉ được trả về kết quả theo đúng định dạng đã yêu cầu. Nếu không tìm thấy mục nào cho một phần, hãy để trống phần đó (ví dụ: "- tên:" rồi xuống dòng ngay).'
};