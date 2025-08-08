load("language_list.js"); 
load("apikey.js");
load("prompt.js");
load("edgetranslate.js");

// =======================================================================
// --- KHU VỰC CẤU HÌNH THỬ NGHIỆM ---
// --- Chỉ cần thay đổi nội dung trong 3 biến dưới đây để thử nghiệm ---
// =======================================================================

// 1. Dán văn bản bạn muốn thử nghiệm vào giữa hai dấu ` `
// VÍ DỤ 1 (Văn bản siêu ngắn để kiểm tra Edge Translate):
// var testText = `第一章`;

// VÍ DỤ 2 (Văn bản dài để kiểm tra Gemini AI với quy trình mới):
var testText = `
　　以及美丽娇俏的尤物堂姐
 　　这里是蘑菇蛋，很高兴恢复更新，谢谢大家。
 　　这篇给大家带来的是催眠之力系列，按照创作计划，催眠之力正传是以春节大章作为收尾，不过因为灵感因素，一直都未能创作完成，所以更新一篇外传，希望大家喜欢。
 　　“祝愿堂哥新年快乐，恭喜发财！”
 　　王光阳打开家门，看清来人面孔后抱拳恭喜，表现热情。
 　　“嗯，同喜同喜。”
 　　门外的中年男人淡淡回答，有些敷衍。
 　　环住他一侧胳膊的美丽熟妇，则是探头向内看了两眼，她点头暗自思忖什么，旋即莞尔轻笑，道：“这么多年了，堂弟家还是这个样子，这种风格的内饰都过时不知道多久了！”
 　　美妇话中有话，表情有些得意和骄傲。
 　　在余梦薇的潜意识里，堂弟王光阳是很普通的工薪阶级，但偏偏运气极佳，娶了个极品尤物，也就是莫雅仪。
 　　在颜值和身材上，同为美熟女的二者相差不大，不过莫雅仪的性格气质，对于男性而言堪称梦寐以求。
 　　娇羞温柔，贤淑典雅，恰似一汪春水，相处起来，给人无限温暖和舒适。
 　　相比之下，余梦薇的性子倒是颇为刻薄尖锐，还有强烈的妒忌虚荣心。
 　　起初两家还能平和来往，但随着堂哥王光林的近几年的步步高升，而王光阳一家还是平淡朴素，前者便诞生出了高高在上的心态。
 　　“这么多年了，住着也习惯了，我时常加班不回家，要是家里经常大变样，还都觉得陌生呢！哈哈。”
 　　王光阳解释道，姿态放得很低，余梦薇当然愈发骄傲，她昂起精致美丽的白皙玉颈，像是白天鹅般一言不发，懒得再搭理。
 　　其丈夫王光林，则是从淡淡的表情中挤出一丝悠然老练，他拍了拍堂弟的肩膀，假惺惺的安慰道：“不必在意这点小事，你还有个儿子嘛，以后努努力，未必不能过上好生活。”
 　　“可不像我生了个闺女，啧啧，以后想要给咱们老王家续香火，还得考虑挑选优秀上门女婿呢！”
 　　“哎，不说了，一提到玥玥就心烦，这丫头什么都好，就是太优秀，真不知道有哪位贵公子能赢得她的青睐哦。”
 　　王光阳木讷的笑了笑，并没觉得有什么不妥，反倒更在意侄女：“颖玥也来了吗？”
 　　“来了来了，年轻人精力旺盛，总喜欢四处逛逛，晚一点再过来吧。”王光林点点头，不动声色地又将话题引开，“说到孩子，小威最近怎么样？现在可是叛逆期，要认真教导才行呢！”
 　　面对堂哥的指导瘾，王光阳深以为然地嗯了一声，认真附和道：“小威半年前的确走上了弯路，不过还好，在我和雅仪的认真引导下，已经让他知错就改了。”
 　　堂哥王光林笑眯眯的，有些期待：“哦，浪子回头金不换，不过小孩子心思多，介不介意我和嫂子考究考究小威呀？”
 　　闻言，王光阳自是一顿高兴，赶紧邀请两位亲戚进门去了。
 　　“小威，出来拜年，你伯父伯母来了！”
 　　响亮的吆喝声从玄关处传来，但王光阳并没从房间内得到回应，而是一旁的开放式厨房，传来了爱妻幸福柔和的哼吟。
 　　“嗯嗯，呀，怎么，那么快呀，哥哥嫂子，喔喔～小威在我这里，等下再，呃呃，再操妈妈，先跟你，咿呀，不行，轻，轻一点啦。”
 　　莫雅仪声线极其柔媚，断断续续的甜美呻吟，更是让刚刚进门的夫妻二人，浑身涌出一阵异样。
 　　记忆里温婉贤淑的弟妹，也有这么放浪勾人的一面吗？
 　　往前走上两步，夫妻二人得见真容。
 　　正站在厨房烹饪的莫雅仪满脸潮红，丰满诱惑的雌体裹着一件围裙，单薄的布料不断产生奇怪的颤抖，她轻弯着腰，摆出了更加慵懒舒服的姿势，偶尔传来激烈短促的啪啪声时，她妩媚柔和的双眸，也会动情的快速翻眨数下，直到儿子放肆的征服稍微收敛，这位熟女妈妈，才会意犹未尽的咬紧下唇，从鼻腔里哼出一股浓郁的熟媚气息～
 　　好色情的后入做爱画面！
 　　王光林和余梦薇不是小孩子，哪怕莫雅仪浑身遮得严严实实，脑海里也瞬间蹦出了这个晴天霹雳似的想法。
 　　再联想到刚刚莫雅仪熟媚满足的回应，几乎可以断定，藏在丰腴熟女背后，不断施以有力冲刺，并使端庄人妻意乱情迷，媚欲横流的始作俑者，就是她的亲儿子王威了！
 　　“你们……疯了吧？”
 　　余梦薇不是没想过自己高莫雅仪一等，但最多也就幻想过堂弟废物，让莫雅仪心灰意冷，忍不住出轨。
 　　但此刻，母子乱伦交奸的淫荡戏剧堂而皇之的上演着，反倒叫她世界观崩塌了。
 　　“胡闹，当真是胡闹！”王光林满脸胀红，严厉抨击道，“老王家的脸，都被你们丢光了！”
 　　说罢，他便转身要走，吓得王光阳脸色煞白，慌忙阻拦并开口解释：“大哥，你别激动，这个事情，其实没你想得那么荒唐……”
 　　王光阳嘴笨，一时半会不知从何说起，哪怕他大脑的思考方式，早已被催眠之力完美扭曲。
 　　心满意足冲撞着美母雌臀的少年，这时才稍微把心思放在性爱之外的事情上，他脑袋往侧边一顶，早已被调教得乖巧懂事的妈妈立刻将手臂抬起，夹着儿子的脑袋轻轻蹭揉，以胳膊和胸部的柔软，对王威进行疼爱与刺激。
 　　“伯母，好，好！”
 　　王威对于几年不见一次的余梦薇，还是有些印象的，以前的他只觉得这位伯母刻薄，即便很美丽，相处起来也是如坐针毡。
 　　但现在他拥有了催眠之力，不用担心被世俗的规矩所束缚，自然毫无保留的使用淫邪且侵略性极强的火辣目光，大方视奸着这位冷艳伯母！
 　　余梦薇为了拜年，特意挑选了喜庆洋洋的红色套装，她的上衣是一件短款立领外套，白色的内衬裹着胸口和些许脖子，将雪白的颈部衬托得更加修长，衣服两侧的袖口宽大，露出了右手上穿戴的翠玉手镯。
 　　红色外套上的金色刺绣牡丹花图案，因为饱满胸脯的存在，看起来更加立体，中间的纽扣也是富丽堂皇的金色，乍一看喜庆红艳，细细欣赏一番，却给人一种贵气内敛的味道。
 　　她的下半身，搭配了一条精美的马面裙，和外套一般，裙身上也绣有许多图案，花卉和凤凰，象征着喜祥如意，裙至足踝，恰巧露出一双红色绣鞋的鞋尖。
 　　“果然是你，王威！”
 　　余梦薇下意识攥紧了拳头，冷艳高贵的面庞浮现一抹羞意。
 　　面对正在进行乱伦性爱的后辈，她不知道是该躲避还是直面，只能用恨恨的目光盯着对方，冷声质问道：
 　　“你在做什么！”
 　　“我，我在给妈妈肚子里的宝宝，嘿嘿，注入营养液啊！”
 　　面对看似强势，实则慌张的美丽熟女，王威猎艳的欲望高涨，深深插入亲生妈妈温暖雌穴里的大肉棒一跳一跳，即使没有很激烈的运动，但也足以让莫雅仪娇羞的雌体快感连连，竟当着大嫂的面，直接高潮了！
 　　“嗯呐哈～好，好满足，怀孕的小穴，嗯呐，高，高潮了！”
 　　莫雅仪双手撑着厨台，渴求浇灌的淫荡雌体，不受控制的进入了榨精模式，双手借力谄媚摇曳腰臀，让自己被撩起了裙子，露出在外的雪白屁股主动抬落在儿子的腹部上。
 　　饱满绵软的臀肉一次又一次的把儿子雄壮有力的男根吞入，直到紧紧守护着怀孕子宫的淫荡花心凹陷变形，恰似婴儿小嘴般咬紧王威的硕大龟头，下流的臀瓣狠狠摇曳好几下后，莫雅仪才结束这一次的突然高潮。
 　　而后有气无力的她吐出粉舌，像燥热的狗狗般轻轻喘息，淫媚的气息，从绯红面庞，从张嘴吐舌的口腔，从围裙之下，布料之中的完美雌体不断逸逃，侵入到余梦薇正在接受王威催眠之力篡改常识的大脑之中。
 　　“莫，莫雅仪，你用小穴套弄精液就老老实实套弄，干嘛还高潮了！”
 　　“天呐，你以为你女人味很足吗？在这跟我炫耀，哼，哪个女人被操高潮了，没法和你一样勾人！”
 　　余梦薇完美融入了王家的淫乱日常，并觉得母子二人的行为理所应当。
 　　她只是妒忌，莫雅仪利用母子乱伦交奸，散发出这么淫媚的雌欲，相比之下，她这个冷冰冰的女人，魅力也太低了，自然心生不满。
 　　“哼，这些稀奇古怪的规矩，也就是在你们家成立！”
 　　“外人又不知道，万一传出去，还不是丢我们老王家的脸！”
 　　王光林也接受了催眠之力的篡改，但他还是固执傲慢，气冲冲的走到阳台，并不给什么好脸色。
 　　王光阳无奈，只能继续追上去用好声好气的话解释讨好。
 　　于是乎，两对夫妻很快分离，分别经历着截然不同的事件。
 　　“我，咿呀，我没，没有嘛，已经，嗯嗯，很收敛了啦！”
 　　莫雅仪有些委屈，她平时一天要被儿子操高潮几十次，比这淫乱的媚态多了去了，结果不知怎么的，这位冷艳嫂嫂这么吃醋。
 　　她不解释还好，一解释的话，余梦薇立刻认定这是挑衅。
 　　绣有美丽花卉的上衣随着饱满胸脯的快速起伏晃动数下，余梦薇咬牙切齿，但最后只化作一声冷笑。
 　　她这么高高在上，怎么可能容忍自己像泼妇一般对看不起的家伙流露出嫉妒之意呢？
 　　“我可不像你一样，哼，家里来了客人，还忙自己的事情。”
 　　“行吧行吧，谁让我们是亲戚呢，我自己照顾自己，就不麻烦您这位尊贵的女主人啦。”
 　　余梦薇懒洋洋的转身，或许是刚刚莫雅仪流露而出的雌媚使其吃醋，渴求展示自身魅力的她，故意迈着夸张性感的猫步离开。
 　　飘逸的马面裙，随着极品翘臀的左右扭动一晃一晃，裙摆压在臀肉上时，轻而易举的凸显出了那饱满诱惑的轮廓，看得王威一阵兴奋，呼吸都急促起来了。
 　　“伯母，好，好色哦！”
 　　王威激动起来，眼神直勾勾地盯着红色背影，他双手伸入美妈裙中，一把环住了自己最爱的孕肚！
 　　这是少年最爱的杰作和心血，色气满满的西瓜肚稍微一环，体内孕有自身血脉的妈妈，便像是被肚子里的的宝宝催情堕化一般，不由自主的渴望着身后儿子兼丈夫兼宝宝爸爸的爱欲浇灌。
 　　“咿呀，小威，要，要射了吗！嗯嗯，可以的，妈妈一直都，喔喔，准备好了！”
 　　莫雅仪感激道，雌臀柳腰先淫媚的回应一步，开始往儿子的胯部上送去。
 　　又粗又长的肉棒在母子二人的齐心协力之下，肆意进出着成熟魅力的蜜贝花瓣，粗犷的茎身把泥泞腔肉磨到痉挛抽搐潮吹之时，王威也瞪大兴奋的目光，盯着冷艳伯母下坐时都要先向后弯腰，然后用手压住裙摆，刻意露出完美臀肉曲线的淫荡场景，愉悦的完成了对亲生妈妈的无套中出～
 　　……
 　　“气死了，早知道这样，还不如不来！老王也真是的，怎么指导瘾又犯了，替我说说话呀！”
 　　余梦薇心神不宁，时而翘起美腿，时而又瞥向阳台，看到丈夫谈笑风生，怡然自得的表情，觉得自己受到了莫雅仪打压的她，不禁更加郁闷。
 　　“这茶也不好喝！”
 　　于是乎，刚刚才带着王威过来拜年的莫雅仪还没开口，就被余梦薇甩了个难看的脸色。
 　　【这是伯母不会喝啦，我家的茶都是精液茶，要搭配精液来喝的呢！】
 　　王威个头不大，但运用上催眠之力的话语，却能让人心悦诚服。
 　　“精液茶？”余梦薇俏脸一僵。
 　　若是正常长辈，肯定是微笑着开口请教，并对王威进行表扬了。
 　　但她不一样，这位自视甚高的傲慢贵妇，只是淡淡的把下巴昂起，平静答道：“我当然会喝精液茶，不过是因为没想到你们家也有这么高端的喝法罢了。”
 　　“是这样的吗？那请伯母喝茶！”
 　　王威嘿嘿一笑，一下就走到了余梦薇面前，裤子轻轻一拉，又大又粗的变态肉棒淫荡跳出，炙热浓郁的气息爆发出来，弄得美熟女脸上痒痒的。
 　　而硬邦邦的硕大龟头更是直戳余梦薇美眸，鸡巴稍微发情跳动两下，带来的视觉冲击效果，不免让这位傲慢虚伪的贵妇乱了阵脚。
 　　“我……”
 　　余梦薇正要婉拒，说自己不渴，毕竟她只是接受了精液茶这个扭曲的常识，不懂怎么饮用。
 　　但王威可不给她逃脱的机会，少年一个挺腰，瞄准了性感红唇开启的瞬间，带着亲生妈妈淫汁骚味和残余精液的大棒径直插入了伯母的温暖口腔，并开始肆无忌惮的胡乱搅动。
 　　“喔喔，伯母，好，好会～精液茶，嘶，谐音是精液插～看似是精液和茶一起饮，实际上，嘿嘿，是先用鸡巴插嘴，然后再喝的～”
 　　余梦薇正要因为嘴里被塞入丑陋狰狞的下流肉棒发怒，高贵如她，怎么可能跟小巷子里的婊子妓女般给男人口交！
 　　哪怕是丈夫，都不曾有这种待遇。
 　　她的怒气来得快，但王威的解释更快，被迫含着大鸡巴，被龟头随意乱顶的余梦薇，竟然如释重负的眨了眨眼。
 　　“呜呜，原来精液茶，是这样的……我还以为是，呃呃，口交侵犯呢，还好没……呜呜，鸡巴好大，没第一时间生气，不然也……太没见识了……”
 　　“臭小威，怎么鸡巴那么大！嘴巴好吃力啊，不过好像……诶哈，脑子笨笨的，我只是刚刚张嘴……哈滋，他就以为我是要尝精液茶……喔喔，然后塞进来了，竟然还给我解释……”
 　　余梦薇虽然是第一次给男人舔鸡巴，但毕竟是成熟妩媚的熟女，温暖的口腔适应性很强。
 　　尽管活力满满的王威不断地操弄，甚至龟头将一侧口腔软肉都顶得凸显变形，映衬出圆鼓鼓的形状，但她却还能在心里沾沾自喜。
 　　“奇怪，伯母你怎么心不在焉的，是因为我的大肉棒不好吃吗？”
 　　仅是单方面施以凌辱，并不足以满足王威的欲望，他缓缓抽出肉棒，龟头抵住冷艳伯母的艳唇轻轻摩擦，发出天真询问。
 　　而后，催眠之力发作。
 　　【越大的鸡巴，越是宝贵！】
 　　扭曲的常识一经注入，余梦薇的双眸顿时亮起，除了兴奋之外，更多的是嫉妒与不满。
 　　“可恶，堂弟真是生了个好儿子，小小年纪，鸡巴就这么大！”
 　　“天呐，真是人比人气死人，还好这小子迷糊，不知道他的大肉棒是奢侈品……”
 　　余梦薇压了压心中的迫切，她坐直身子，挺了挺本就饱满的胸脯，素手抬起，翠玉手镯滑下些许，指尖理了理额前的发丝。
 　　她表现的从容淡定，优雅不凡，尽量不让这对穷亲戚母子看出自己的嫉妒。
 　　“还行吧，伯母吃过很多的大肉棒……嗯，你这根……唔，甚至都比不上你大伯父。”
 　　余梦薇懒洋洋的说道，傲慢的语气伪装得极好，但手掌落到少年变态肉茎上时，欢天喜地的攥握和撸动，却表现出了她内心的欢喜！
 　　“嫂嫂真是见多识广呢。”
 　　莫雅仪心思单纯，信以为真，露出和蔼可亲的笑意，抱着西瓜孕肚坐了上来。
 　　两位美熟女贴在一起，似乎要一同分享王威的大鸡巴似的。
 　　“你们也要多出去走走，像这种鸡巴，我都吃腻了！”
 　　余梦薇的虚荣心被满足得很好，她的大脑虽收获了欢愉，饥渴的肉体却发出了抗议，雪白的喉咙在说话这句话后，用力滚动两下，粉嫩的舌头从唇间露出，被贝齿轻咬着，妩媚冷艳的漂亮眼睛微微眯起，恨不得将视野都锁定在眼前的大肉棒上……
 　　“既然嫂嫂没什么想法，那让我先用一用小威吧，今天才内射了两次，还没口爆过哦！”
 　　莫雅仪用柔软的手，从余梦薇僵硬的抓握中夺回了亲生儿子的大肉棒，然后这位孕肚妈妈一手扶住孕肚底部，颇为羞涩的贴身上前，早已湿润的唇瓣，如热恋期像心爱男友索吻一般，深情的吻在了儿子的龟头上。
 　　“哦哈，妈妈，好，好色，舌头～呼，钻上来了～”
 　　美人红唇轻启，灵活的舌尖落在儿子龟头附近轻轻拨弄，拨开马眼蠕动两下，王威便爽得哆嗦了身子，迫不及待的手掌也爱抚上妈妈的熟媚脸蛋，最后更是像把玩宠物似的，亲昵的揉起了成熟蜜母的脑袋。
`;

// 2. Nhập mã ngôn ngữ nguồn (ví dụ: 'zh' cho tiếng Trung)
var testFrom = 'zh';

// 3. Nhập mã của prompt đích bạn muốn dùng (ID từ file language_list.js)
// Ví dụ: 'vi', 'vi_sac', 'vi_NameEng', 'vi_vietlai', 'en'
var testTo = 'vi_sac';

// =======================================================================
// --- KẾT THÚC KHU VỰC CẤU HÌNH ---
// --- Không cần chỉnh sửa code bên dưới ---
// =======================================================================

var currentKeyIndex = 0;

// --- LOGIC CỦA GEMINI AI (Không thay đổi) ---
function callGeminiAPI(text, prompt, apiKey) {
    if (!apiKey) { return { status: "error", message: "API Key không hợp lệ." }; }
    if (!text || text.trim() === '') { return { status: "success", data: "" }; }
    var full_prompt = prompt + "\n\n---\n\n" + text;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;
    var body = {
        "contents": [{ "parts": [{ "text": full_prompt }] }],
        "generationConfig": { "temperature": 0.85, "topP": 0.95, "maxOutputTokens": 65536 },
        "safetySettings": [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ]
    };
    try {
        var response = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (response.ok) {
            var result = JSON.parse(response.text());
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content) { return { status: "success", data: result.candidates[0].content.parts[0].text.trim() }; }
            if (result.promptFeedback && result.promptFeedback.blockReason) { return { status: "blocked", message: "Bị chặn bởi Safety Settings: " + result.promptFeedback.blockReason };}
            return { status: "error", message: "API không trả về nội dung hợp lệ. Phản hồi: " + response.text() };
        } else {
            return { status: "key_error", message: "Lỗi HTTP " + response.status + " (API key có thể sai hoặc hết hạn mức)." };
        }
    } catch (e) {
        return { status: "error", message: "Ngoại lệ Javascript: " + e.toString() };
    }
}
function translateInChunksByLine(text, prompt) {
    var lines = text.split('\n'); var translatedLines = []; var errorOccurred = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i]; if (line.trim() === '') { translatedLines.push(''); continue; }
        var lineTranslated = false;
        for (var j = 0; j < apiKeys.length; j++) {
            var key = apiKeys[currentKeyIndex]; var result = callGeminiAPI(line, prompt, key);
            if (result.status === "success") { translatedLines.push(result.data); lineTranslated = true; break; }
            if (result.status === "blocked") { translatedLines.push("..."); lineTranslated = true; break; }
            if (result.status === "key_error") { currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; } 
            else { translatedLines.push("[LỖI DỊCH DÒNG: " + result.message + "]"); lineTranslated = true; errorOccurred = true; break; }
        }
        if (!lineTranslated) { translatedLines.push("[LỖI: TẤT CẢ API KEY ĐỀU KHÔNG HOẠT ĐỘNG]"); errorOccurred = true; }
    }
    if (errorOccurred) { return { status: "partial_error", data: translatedLines.join('\n') }; }
    return { status: "success", data: translatedLines.join('\n') };
}
function translateSingleChunk(chunkText, prompt, isPinyinRoute) {
    for (var i = 0; i < apiKeys.length; i++) {
        var key = apiKeys[currentKeyIndex]; var result = callGeminiAPI(chunkText, prompt, key);
        if (result.status === "success") { return result; }
        if (result.status === "blocked") {
            if (isPinyinRoute) { return result; } 
            else { return translateInChunksByLine(chunkText, prompt); }
        }
        if (result.status === "key_error") { currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; } 
        else { return result; }
    }
    return { status: "error", message: "Tất cả các API key đều không hoạt động." };
}

// --- HÀM THỰC THI CHÍNH (SỬ DỤNG DỮ LIỆU TEST) ---
function execute(text, from, to) {
    // ---- GHI ĐÈ DỮ LIỆU TỪ ỨNG DỤNG BẰNG DỮ LIỆU THỬ NGHIỆM ----
    text = testText;
    from = testFrom;
    to = testTo;
    console.log("!!! CHẾ ĐỘ THỬ NGHIỆM ĐANG BẬT !!! Đang sử dụng dữ liệu được khai báo trong file.");
    // -----------------------------------------------------------

    if (!text || text.trim() === '') { return Response.success("?"); }

    if (text.length < 200) {
        console.log("Phát hiện văn bản ngắn (< 200 ký tự). Sử dụng Edge Translate.");
        var edgeToLang = to;
        if (to === 'vi_sac' || to === 'vi_vietlai' || to === 'vi_NameEng') { edgeToLang = 'vi'; }
        var rawTranslatedText = edgeTranslateContent(text, from, edgeToLang, 0); 
        if (rawTranslatedText !== null) {
            var lines = rawTranslatedText.split('\n');
            var finalOutput = "";
            for (var i = 0; i < lines.length; i++) { finalOutput += lines[i] + "\n"; }
            return Response.success(finalOutput.trim());
        } else {
            return Response.error("Lỗi khi dịch bằng Edge Translate.");
        }
    }
    
    console.log("Văn bản dài. Sử dụng quy trình Gemini AI." + text.length);
    if (!apiKeys || apiKeys.length === 0 || (apiKeys[0].indexOf("YOUR_GEMINI_API_KEY") !== -1)) {
        return Response.error("Vui lòng cấu hình API key trong file apikey.js.");
    }

    var selectedPrompt = prompts[to] || prompts["vi"];
    var isPinyinRoute = (to === 'vi' || to === 'vi_sac' || to === 'vi_NameEng');

    // =======================================================================
    // --- QUY TRÌNH MỚI: CHIA NHỎ VĂN BẢN GỐC TRƯỚC ---
    // =======================================================================

    var textChunks = [];
    // QUAN TRỌNG: Các hằng số này giờ đây áp dụng cho văn bản tiếng Trung gốc
    var CHUNK_SIZE = 7500;
    var MIN_LAST_CHUNK_SIZE = 2000;
    
    if (text.length > CHUNK_SIZE) {
        console.log("Văn bản quá dài, bắt đầu chia nhỏ thông minh văn bản gốc...");
        var paragraphs = text.split('\n');
        var currentChunk = "";
        for (var i = 0; i < paragraphs.length; i++) {
            var paragraph = paragraphs[i];
            if (paragraph.length > CHUNK_SIZE) {
                if (currentChunk.length > 0) { textChunks.push(currentChunk); currentChunk = ""; }
                textChunks.push(paragraph); 
                continue;
            }
            if (currentChunk.length + paragraph.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
                textChunks.push(currentChunk);
                currentChunk = paragraph;
            } else {
                if (currentChunk.length > 0) { currentChunk += "\n" + paragraph; } 
                else { currentChunk = paragraph; }
            }
        }
        if (currentChunk.length > 0) { textChunks.push(currentChunk); }
        console.log("Đã chia văn bản gốc thành " + textChunks.length + " phần.");

        if (textChunks.length > 1 && textChunks[textChunks.length - 1].length < MIN_LAST_CHUNK_SIZE) {
            console.log("Phần cuối quá nhỏ, đang gộp vào phần trước đó.");
            var lastChunk = textChunks.pop();
            var secondLastChunk = textChunks.pop();
            textChunks.push(secondLastChunk + "\n" + lastChunk);
            console.log("Số phần sau khi gộp: " + textChunks.length);
        }
    } else {
        textChunks.push(text);
    }
    
    // --- BƯỚC 2: PHIÊN ÂM TỪNG PHẦN VÀ DỊCH ---
    var finalParts = [];
    for (var k = 0; k < textChunks.length; k++) {
        var chunkToSend;
        if (isPinyinRoute) {
            try {
                load("phienam.js"); // Tải lại để đảm bảo an toàn
                chunkToSend = phienAmToHanViet(textChunks[k]);
            } catch (e) {
                return Response.error("LỖI: Không thể tải file phienam.js.");
            }
        } else {
            chunkToSend = textChunks[k];
        }

        var chunkResult = translateSingleChunk(chunkToSend, selectedPrompt, isPinyinRoute);

        if (chunkResult.status === 'success' || chunkResult.status === 'partial_error') {
            finalParts.push(chunkResult.data);
        } else {
            var errorString = "\n\n<<<<<--- LỖI DỊCH PHẦN " + (k + 1) + " --->>>>>\n" +
                              "Lý do: " + chunkResult.message + "\n" +
                              "<<<<<--- KẾT THÚC LỖI --->>>>>\n\n";
            finalParts.push(errorString);
        }
    }
    
    var finalContent = finalParts.join('\n');
    var lines = finalContent.split('\n');
    var finalOutput = "";
    for (var i = 0; i < lines.length; i++) {
        finalOutput += lines[i] + "\n";
    }
    return Response.success(finalOutput.trim());
}