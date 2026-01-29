import type { Message } from '../types';
import { cn } from '../lib/utils';

interface MessageBubbleProps {
  message: Message;
  avatar: string;
}

export function MessageBubble({ message, avatar }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <img 
          src={avatar} 
          alt="AI" 
          className="w-9 h-9 rounded-md mr-2 self-start bg-white"
        />
      )}
      
      <div className={cn(
        "max-w-[70%] rounded-md p-2 text-sm relative",
        isUser ? "bg-[#95ec69] text-black" : "bg-white text-black border border-gray-100"
      )}>
        {/* Triangle arrow */}
        <div className={cn(
          "absolute top-3 w-0 h-0 border-[6px] border-transparent",
          isUser 
            ? "right-[-6px] border-l-[#95ec69]" 
            : "left-[-6px] border-r-white"
        )} />
        
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        
        {message.audioUrl && (
          <div className="mt-2">
            <audio controls src={message.audioUrl} className="max-w-full h-8" />
          </div>
        )}
        
        {message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Generated" 
            className="mt-2 rounded-md max-w-full" 
          />
        )}
      </div>

      {isUser && (
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" 
          alt="User" 
          className="w-9 h-9 rounded-md ml-2 self-start bg-gray-300"
        />
      )}
    </div>
  );
}
