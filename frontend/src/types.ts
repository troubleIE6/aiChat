export interface Persona {
  id: string;
  name: string;
  avatar: string; // URL or placeholder color/initials
  description: string;
  systemPrompt: string;
  style: 'spirit_girl' | 'mature_sister' | 'loli' | 'caring_sister' | 'warm_man' | 'pretty_boy' | 'brat' | 'straight_man';
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: number;
  imageUrl?: string; // For generated images
  audioUrl?: string; // For TTS audio
}
