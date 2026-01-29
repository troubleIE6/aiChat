import type { Persona } from '../types';

interface AIResponse {
  content: string;
  imageUrl?: string;
}

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock responses based on persona style
const mockResponses: Record<string, string[]> = {
  spirit_girl: [
    "哎呀，老铁，这也太秀了吧！😂",
    "花花世界迷人眼，没有实力别赛脸！💪",
    "只要小伙精神在，到哪都是实力派！",
    "别爱我，没结果，除非花手摇过我~ 🌸",
  ],
  mature_sister: [
    "小弟弟，这么晚了还不睡？",
    "乖，姐姐在呢。",
    "你这种想法，还真是可爱呢。",
    "有些事情，长大了你就懂了。",
  ],
  loli: [
    "欧尼酱~ 要抱抱！(｡･ω･｡)ﾉ♡",
    "哥哥最好了！",
    "人家想吃糖糖~ 🍬",
    "呜呜，哥哥欺负人...",
  ],
  caring_sister: [
    "发生什么事了吗？可以跟我说说哦。",
    "别太累了，要注意身体。",
    "我会一直陪着你的。",
    "生活总会有不顺心的，慢慢来。",
  ],
  warm_man: [
    "不管发生什么，我都在你身边。",
    "喝杯热牛奶，早点休息吧。",
    "你的感受很重要，慢慢说，我在听。",
    "别担心，一切都会好起来的。",
  ],
  pretty_boy: [
    "哎呀，这个衣服搭配稍微有点...不过你开心就好啦。",
    "今晚的月色真美，就像你一样。",
    "记得要护肤哦，熬夜对皮肤不好的。",
    "人家才没有撒娇呢！哼！",
  ],
  brat: [
    "切，谁稀罕啊！",
    "大笨蛋！略略略~ 😛",
    "我就不！你管我！",
    "虽然你很烦，但是...算了没什么。",
  ],
  straight_man: [
    "多喝热水。",
    "哦。",
    "牛逼。",
    "早点睡。",
  ],
};

export async function generateResponse(text: string, persona: Persona): Promise<AIResponse> {
  await delay(1000 + Math.random() * 2000); // Simulate network latency

  // Check if image generation is requested (simple keyword check)
  const isImageRequest = text.includes('照片') || text.includes('图片') || text.includes('看看你') || text.includes('自拍');
  
  if (isImageRequest) {
    // Call Qwen3 Image Generation API (Mock)
    return {
      content: getPhotoResponse(persona),
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.style}-${Date.now()}`, // Mock image
    };
  }

  // Call DeepSeek or Qwen3 Text API (Mock)
  // In a real app, you would make a fetch call here:
  /*
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: persona.systemPrompt },
        { role: 'user', content: text }
      ]
    })
  });
  */

  const responses = mockResponses[persona.style] || ["收到。"];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return {
    content: randomResponse,
  };
}

function getPhotoResponse(persona: Persona): string {
  switch (persona.style) {
    case 'spirit_girl': return "给你看看我的新摇摆！";
    case 'mature_sister': return "想看姐姐了吗？呐~";
    case 'loli': return "哥哥你看，好看吗？";
    case 'straight_man': return "发个照片。";
    default: return "这是我的照片。";
  }
}
