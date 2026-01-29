import type { Persona, Message } from '../types';

interface AIResponse {
  content: string;
  imageUrl?: string;
  audioUrl?: string;
}

// Configuration for API Keys - Handled by Backend Proxy
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

export async function generateResponse(text: string, persona: Persona, history: Message[] = []): Promise<AIResponse> {
  // 1. 首先调用 Chat API 获取 AI 回复文字
  let aiContent = "";
  try {
    const apiMessages = [
      { role: 'system', content: persona.systemPrompt },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: text }
    ];

    const chatResponse = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages
      })
    });

    if (chatResponse.ok) {
      const data = await chatResponse.json();
      aiContent = data.choices?.[0]?.message?.content || "";
    }
  } catch (error) {
    console.error('Chat API call failed:', error);
  }

  // 如果文字生成失败，回退到 Mock 数据
  if (!aiContent) {
    const responses = mockResponses[persona.style] || ["收到。"];
    aiContent = responses[Math.floor(Math.random() * responses.length)];
  }

  // 2. 判断是否需要合成语音
  const isVoiceRequest = text.includes('语音') || text.includes('听听') || text.includes('说话') || text.includes('声音') || text.includes('发声');
  let audioUrl = undefined;

  if (isVoiceRequest && aiContent) {
    try {
      // 这里的 text 使用上面刚刚由 AI 生成的内容，不再使用死代码
      const ttsResponse = await fetch(`${API_BASE_URL}/ai/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiContent, // 使用真实的 AI 回复内容
          model: "qwen3-tts-flash"
        })
      });
      
      if (ttsResponse.ok) {
        const data = await ttsResponse.json();
        audioUrl = data.audioUrl;
      } else {
        console.error('Backend TTS API error:', await ttsResponse.text());
      }
    } catch (e) {
      console.error('Backend TTS API call failed', e);
    }
  }

  // 3. 返回最终结果
  return {
    content: aiContent,
    audioUrl: audioUrl
  };
}

// 移除不再需要的 getVoiceResponse 函数

