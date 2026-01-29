import { useState, useRef, useEffect } from 'react';
import type { Persona, Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { Image as ImageIcon, Smile, Trash2 } from 'lucide-react';

interface ChatWindowProps {
  persona: Persona;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping?: boolean;
  onClearHistory?: () => void;
}

export function ChatWindow({ persona, messages, onSendMessage, isTyping, onClearHistory }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5]">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center px-4 bg-[#f5f5f5] justify-between">
        <h2 className="text-lg font-medium text-gray-900">{persona.name}</h2>
        <div className="text-gray-400 cursor-pointer hover:text-red-500" onClick={onClearHistory} title="清空聊天记录">
          <Trash2 className="w-5 h-5" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} avatar={persona.avatar} />
        ))}
        <div ref={messagesEndRef} />
        {isTyping && (
          <div className="flex w-full mb-4 justify-start">
            <img 
              src={persona.avatar} 
              alt="AI" 
              className="w-9 h-9 rounded-md mr-2 self-start bg-white"
            />
            <div className="bg-white text-black border border-gray-100 max-w-[70%] rounded-md p-2 text-sm relative">
              <div className="absolute top-3 w-0 h-0 border-[6px] border-transparent left-[-6px] border-r-white" />
              <p className="text-gray-500">对方正在输入...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="h-auto min-h-[150px] border-t border-gray-200 bg-[#f5f5f5]">
        <div className="h-10 flex items-center px-4 space-x-4 text-gray-600">
          <Smile className="w-6 h-6 cursor-pointer hover:text-gray-900" />
          <ImageIcon className="w-6 h-6 cursor-pointer hover:text-gray-900" />
        </div>
        <div className="px-4 pb-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-24 bg-[#f5f5f5] outline-none resize-none text-gray-800"
            placeholder=""
          />
        </div>
        <div className="flex justify-end px-4 pb-4">
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="bg-[#e9e9e9] text-[#07c160] px-6 py-1.5 rounded-sm hover:bg-[#d2d2d2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            发送(S)
          </button>
        </div>
      </div>
    </div>
  );
}
