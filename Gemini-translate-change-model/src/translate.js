load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

// === THAY ĐỔI 1: KHAI BÁO DANH SÁCH MODELS ===
// Khai báo danh sách các model, model đầu tiên sẽ được ưu tiên sử dụng.
// Nếu model đầu tiên thất bại với tất cả các key, hệ thống sẽ chuyển sang model tiếp theo.
var models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite" 
];
var testtext = `　　系统任务，萝莉诱惑，完成。　　目标：宋祖儿、周也。　　任务奖励：做爱时感受到的快感再次翻倍。（此时所感受的为原本的4倍)　　“~哦~”　　牛奕辰发出了一声怪异的呻吟，抱着周也的力气也不禁增大了许多。　　在他射入周也体内的一瞬间，牛奕辰的任务就完成了。　　但是牛奕辰叫出声来，却跟任务完成这件事情毫不相关。在射精的这一刻，牛奕辰忽然感觉自己体内多出了一股气体，这股气体自丹田而起，通过脊椎进入心脏，然后又通过心脏进入眉心，最终通过眉心再次向下，散入了四肢百骸。　　酥爽的感觉，让牛奕辰连着打了好几个冷颤，不知道过了多久，才终于缓缓回过神来。　　“怎么回事？”牛奕辰暗叫一声，将肉棒从周也的体内拔了出来，“一下子就彻底玄幻，不对，是武侠起来了？”　　牛奕辰始终都记得，自己练的是个叫‘玉骨舍利子密藏’的玩意儿，而且因为修炼这东西，每天睡两个小时就够，而且跟他做爱的女人还能一直保持青春，还有些其他的隐晦好处，只是一直都没细想　　但是这种武侠小说里面才有的内功真气，却是第一次感受到。也不对……仔细想想，其他时候似乎也感受过，比如说他在用技能的时候，还有做爱射精的时候，只是那时候的速度很快，而现在则不然，他每时每刻都能感觉到体内那股‘真气’的流动，仿佛做什么速度都要快上一些。　　‘这时候用上技能，会不会好一点?’　　牛奕辰低头看向了周也，却发现她竟然已经睡着了。也对，毕竟是小孩子，而且还第一次跟牛奕辰做爱，一直不停还好，这一停下，刺激断了，疲惫就占据上风了。　　既然小周也已经睡了，那么目标就只能在房间里唯一的成年女人身上了，周也的妈妈。　　连着玩儿了两个小女孩儿之后，也该用一个成年女人来换换口味了。而且直到现在为止，周也的妈妈可还在牛奕辰的控制之下呢，所以……要用什么方法玩儿她呢？　　周也的妈妈没有察觉到任何一点不同，在她眼里，周也终于被她给哄睡着了　　今天耽误的时间，可真的太长了些。　　所以接下来，她自己终于可以休息了。实在是太晚了，也不想再跑来跑去，而且宋祖儿的房间本身就有两张床，其中一张是原本宋祖儿妈妈的，现在就让她来睡一晚上吧。　　周妈妈躺了下来，但是不知道是不是因为睡意已经过去，所以她明明已经困了，但是闭上眼睛，却根本没有一点睡着的感觉。　　这种感觉让她无比难受，下意识的在床上来回翻腾了几下，就在这时，她的手忽然从枕头下摸到了一个坚硬的圆柱体。　　周妈妈一愣，伸手再次摸了几下，发现形状非常熟悉，而且尺寸很大。　　周妈妈一下红了脸，小心的将那个圆柱体给拿了出来。　　果然就是她想的那样，是一根按摩棒。　　‘这是涓涓妈妈的床，真是的……没想到她竟然还玩儿这个玩意儿……'虽然在心里则背着，但是只是摸着这按摩棒，周妈妈的身子就忍不住一阵酥软。　　自从生了两个孩子之后，老公已经有几年没跟她亲热过了，之前因为一直工作比较忙碌的关系，还没什么感觉　　现在有了闲暇， 肉体上的欲望立刻便蒸腾起来，再也无法压制了。　　尤其是在深夜里，在两个女孩都睡着的情况下。‘反正现在也睡不着，不如就玩儿一下吧，听说发泄一番之后，还更容易让人休息呢……’　　如此想着，周妈妈悄悄向周也和宋祖儿睡觉的那个地方看去，确认她们两个没有醒来之后，便起身默默的脱掉了自己的睡衣。`;
var testfrom = `zh`;
var testto = `vi_sac`;
// === THAY ĐỔI 2: CẬP NHẬT HÀM callGeminiAPI ĐỂ NHẬN THAM SỐ MODEL ===
function callGeminiAPI(text, prompt, apiKey, model) {
    if (!apiKey) {
        return { status: "error", message: "API Key không hợp lệ." };
    }
    if (!text || text.trim() === '') {
        return { status: "success", data: "" };
    }

    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": {
            "temperature": 1.0, "topP": 1.0, "topK": 40, "maxOutputTokens": 65536
        },
        "safetySettings": [
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    try {
        var response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        
        if (response.ok) {
            var result = JSON.parse(response.text());

            if (result.candidates && result.candidates.length > 0 
                && result.candidates[0].content 
                && result.candidates[0].content.parts 
                && result.candidates[0].content.parts.length > 0 
                && result.candidates[0].content.parts[0].text) {
                return { status: "success", data: result.candidates[0].content.parts[0].text.trim() };
            }
            
            if (result.promptFeedback && result.promptFeedback.blockReason) { 
                return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };
            }
            
            if (result.candidates && result.candidates.length > 0 && (!result.candidates[0].content || !result.candidates[0].content.parts)) {
                return { status: "blocked", message: "Bị chặn (không có nội dung trả về)." };
            }

            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + response.text() };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + " (response not ok model '" + model + "' đã thử cuối cùng)." };
        }
    } catch (e) {
        return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() };
    }
}

// === THAY ĐỔI 3: CẬP NHẬT HÀM translateSingleChunkWithRetry VỚI LOGIC LỒNG NHAU ===
function translateSingleChunkWithRetry(chunkText, prompt) {
    var lastError = null;

    // Vòng lặp ngoài: Duyệt qua từng model trong danh sách `models`
    for (var m = 0; m < models.length; m++) {
        var modelToUse = models[m];
        console.log("----- Bắt đầu thử với Model: " + modelToUse + " -----");

        // Vòng lặp trong: Duyệt qua từng API key cho model hiện tại
        for (var i = 0; i < apiKeys.length; i++) {
            var apiKeyToUse = apiKeys[i];
            console.log("Đang thử Model '" + modelToUse + "' với Key Index " + i);

            // Gọi API với model và key cụ thể
            var result = callGeminiAPI(chunkText, prompt, apiKeyToUse, modelToUse);

            // Nếu thành công hoặc bị chặn có chủ đích, trả về kết quả ngay lập tức
            if (result.status === "success" || result.status === "blocked") {
                console.log("Thành công với Model '" + modelToUse + "', Key Index " + i);
                return result; 
            }
            
            // Nếu lỗi, lưu lại lỗi cuối cùng và thử key tiếp theo
            lastError = result; 
            console.log("Lỗi với Model '" + modelToUse + "', Key Index " + i + ": " + result.message + ". Đang thử key tiếp theo...");
        }

        console.log("----- Tất cả các key đều thất bại cho Model: " + modelToUse + ". Chuyển sang model tiếp theo (nếu có). -----");
    }

    // Nếu tất cả các model và key đều không thành công
    console.log("Tất cả API keys và Models đều không thành công cho chunk này.");
    return lastError; // Trả về lỗi cuối cùng gặp phải
}

function execute(text, from, to) {
        text = testtext; from = testfrom; to = testto;

    if (!text || text.trim() === '') {
        return Response.success("?");
    }

    var lines = text.split('\n');
    var isContent = false;
    if (text.length >= 100) {
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].length >= 50) {
                isContent = true;
                break;
            }
        }
    }

    if (text.length < 100 || !isContent) {
        console.log("Phát hiện văn bản ngắn hoặc danh sách chương. Sử dụng Edge Translate.");
        var edgeToLang = (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') ? 'vi' : to;
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0);
        
        if (rawTranslatedText !== null) {
            return Response.success(rawTranslatedText);
        } else { 
            return Response.error("Lỗi Edge Translate. Vui lòng thử lại."); 
        }
    }
    
    console.log("Phát hiện nội dung chương. Bắt đầu quy trình Gemini AI.");
    if (!apiKeys || apiKeys.length === 0) {
        return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 API key trong file apikey.js.");
    }
    if (!models || models.length === 0) {
        return Response.error("LỖI: Vui lòng cấu hình ít nhất 1 model trong file translate.js.");
    }
    
    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    var textChunks = [];
    const CHUNK_SIZE = 8000;
    const MIN_LAST_CHUNK_SIZE = 1000;
    var currentChunk = "";

    for (var i = 0; i < lines.length; i++) {
        var paragraph = lines[i];
        if (currentChunk.length === 0 && paragraph.length >= CHUNK_SIZE) {
            textChunks.push(paragraph);
            continue;
        }
        if (currentChunk.length + paragraph.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
            textChunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            currentChunk = currentChunk ? (currentChunk + "\n" + paragraph) : paragraph;
        }
    }
    if (currentChunk.length > 0) {
        textChunks.push(currentChunk);
    }
    if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
        var lastChunk = textChunks.pop();
        var secondLastChunk = textChunks.pop();
        textChunks.push(secondLastChunk + "\n" + lastChunk);
        console.log("Chunk cuối quá nhỏ, đã gộp vào chunk trước đó.");
    }
    
    console.log("Văn bản đã được chia thành " + textChunks.length + " phần.");

    var finalParts = [];
    for (var k = 0; k < textChunks.length; k++) {
        console.log("Bắt đầu xử lý phần " + (k + 1) + "/" + textChunks.length + "...");
        var chunkToSend = textChunks[k];

        if (isPinyinRoute) {
            try {
                load("phienam.js");
                chunkToSend = phienAmToHanViet(chunkToSend);
            } catch (e) {
                return Response.error("LỖI: Không thể tải hoặc thực thi file phienam.js.");
            }
        }

        var chunkResult = translateSingleChunkWithRetry(chunkToSend, selectedPrompt);
        
        if (chunkResult.status === 'success' || (chunkResult.status === 'blocked' && chunkResult.data)) {
            finalParts.push(chunkResult.data);
        } else {
            var errorString = "<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " (ĐÃ THỬ HẾT CÁC KEY VÀ MODEL) --->>>>>\n" 
                            + "Lý do: " + chunkResult.message + "\n" 
                            + "<<<<<--- KẾT THÚC LỖI --->>>>>";
            finalParts.push(errorString);
        }
    }
    
    var finalContent = finalParts.join('\n\n');
    return Response.success(finalContent.trim());
}