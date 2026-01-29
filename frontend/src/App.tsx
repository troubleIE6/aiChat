import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import type { Persona, Message } from './types';
import { personas } from './data/personas';
import { generateResponse } from './services/api';

function App() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedPersona.id]: [...(prev[selectedPersona.id] || []), newMessage],
    }));

    setIsTyping(true);

    try {
      const response = await generateResponse(text, selectedPersona);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response.content,
        imageUrl: response.imageUrl,
        timestamp: Date.now(),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), aiMessage],
      }));
    } catch (error) {
      console.error("Failed to generate response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const currentMessages = messages[selectedPersona.id] || [];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto flex h-full shadow-xl rounded-lg overflow-hidden bg-white my-0 md:my-4 md:h-[calc(100vh-2rem)]">
        <Sidebar 
          personas={personas} 
          selectedPersonaId={selectedPersona.id} 
          onSelectPersona={handleSelectPersona} 
        />
        <ChatWindow 
          persona={selectedPersona} 
          messages={currentMessages} 
          onSendMessage={handleSendMessage} 
          isTyping={isTyping}
        />
      </div>
    </div>
  );
}

export default App;
