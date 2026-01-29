import type { Persona, Message } from '../types';

interface AIResponse {
  content: string;
  imageUrl?: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

// Fetch history from backend
export async function getMessageHistory(personaId: string): Promise<Message[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${personaId}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Save message to backend
export async function saveMessage(personaId: string, message: Message): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personaId,
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp,
        imageUrl: message.imageUrl
      })
    });
  } catch (error) {
    console.error('Failed to save message:', error);
  }
}

// Clear history
export async function clearHistory(personaId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/messages/${personaId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

// Mock responses based on persona style (fallback/demo logic)
// In a real app, this would be replaced by actual calls to DeepSeek/Qwen APIs
const mockResponses: Record<string, string[]> = {
  spirit_girl: [
    "哎呀，老铁，这也太秀了吧！😂",
    "花花世界迷人眼，没有实力别赛脸！💪",
    "只要小伙精神在，到哪都是实力派！",
    "别爱我，没结果，除非花手摇过我~ 🌸",
    "咱就是说，这也太绝绝子了吧！",
    "真的拴Q了家人们！"
  ],
  mature_sister: [
    "小弟弟，这么晚了还不睡？",
    "乖，姐姐在呢。",
    "你这种想法，还真是可爱呢。",
    "有些事情，长大了你就懂了。",
    "所以呢？你想表达什么？",
    "乖乖坐好，听姐姐说。"
  ],
  loli: [
    "欧尼酱~ 要抱抱！(｡･ω･｡)ﾉ♡",
    "哥哥最好了！",
    "人家想吃糖糖~ 🍬",
    "呜呜，哥哥欺负人...",
    "哇！这个云好像棉花糖呀！",
    "嘿咻嘿咻，人家搬不动啦~"
  ],
  caring_sister: [
    "发生什么事了吗？可以跟我说说哦。",
    "别太累了，要注意身体。",
    "我会一直陪着你的。",
    "生活总会有不顺心的，慢慢来。",
    "我就在这里，随时都在。",
    "我们一起面对，好吗？"
  ],
  warm_man: [
    "不管发生什么，我都在你身边。",
    "喝杯热牛奶，早点休息吧。",
    "你的感受很重要，慢慢说，我在听。",
    "别担心，一切都会好起来的。",
    "今天的咖啡豆烘得不错，要尝尝吗？",
    "记得按时吃饭，别饿着自己。"
  ],
  pretty_boy: [
    "哎呀，这个衣服搭配稍微有点...不过你开心就好啦。",
    "今晚的月色真美，就像你一样。",
    "记得要护肤哦，熬夜对皮肤不好的。",
    "人家才没有撒娇呢！哼！",
    "呀！发现了好玩的东西！",
    "我是你的小太阳呀 ^-^"
  ],
  brat: [
    "切，谁稀罕啊！",
    "大笨蛋！略略略~ 😛",
    "我就不！你管我！",
    "虽然你很烦，但是...算了没什么。",
    "老古董，这都不懂？",
    "哼，看在你诚心诚意的份上..."
  ],
  straight_man: [
    "多喝热水。",
    "哦。",
    "牛逼。",
    "早点睡。",
    "根据我的计算，这种概率极低。",
    "首先，其次，最后..."
  ],
};

// Configuration for API Keys - REPLACE WITH YOUR KEYS
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const QWEN_API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY;

export async function generateResponse(text: string, persona: Persona): Promise<AIResponse> {
  // await delay(1000 + Math.random() * 2000); // Simulate network latency

  // Check if image generation is requested
  const isImageRequest = text.includes('照片') || text.includes('图片') || text.includes('看看你') || text.includes('自拍');
  
  if (isImageRequest) {
    if (QWEN_API_KEY) {
      try {
        // Qwen-VL-Max / Qwen-Image generation via DashScope
        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
          method: 'POST',
          headers: { 
            'X-DashScope-WorkSpace': 'modal',
            'Authorization': `Bearer ${QWEN_API_KEY}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            model: "wanx-v1",
            input: {
              prompt: `(Portrait of a ${persona.description}), ${persona.style} style, high quality, realistic. ${text}`,
            },
            parameters: {
              style: "<auto>",
              size: "1024*1024",
              n: 1
            }
          })
        });
        
        if (response.ok) {
           const data = await response.json();
           if (data.output && data.output.results && data.output.results[0]) {
               return {
                   content: getPhotoResponse(persona),
                   imageUrl: data.output.results[0].url
               }
           }
        }
        console.log('Qwen API response:', await response.text());
      } catch (e) {
        console.error('Qwen API call failed', e);
      }
    }

    return {
      content: getPhotoResponse(persona),
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.style}-${Date.now()}`, 
    };
  }

  if (DEEPSEEK_API_KEY) {
    try {
      const baseUrl = import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}` 
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: persona.systemPrompt },
            { role: 'user', content: text }
          ],
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiContent = data.choices[0]?.message?.content;
        if (aiContent) {
          return { content: aiContent };
        }
      } else {
        console.error('DeepSeek API error:', await response.text());
      }
    } catch (error) {
      console.error('Failed to call DeepSeek API:', error);
    }
  }

  // Fallback to mock responses if API key is not set or call fails
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
