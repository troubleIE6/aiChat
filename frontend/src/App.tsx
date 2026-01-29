import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import type { Persona, Message } from './types';
import { personas } from './data/personas';
import { getMessageHistory, saveMessage, clearHistory, generateResponse } from './services/api';

function App() {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectPersona = async (persona: Persona) => {
    setSelectedPersona(persona);
    if (!messages[persona.id]) {
      const history = await getMessageHistory(persona.id);
      setMessages((prev) => ({
        ...prev,
        [persona.id]: history,
      }));
    }
  };

  // Initial load
  useEffect(() => {
     handleSelectPersona(selectedPersona);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Temporary ID for UI
      sender: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => ({
      ...prev,
      [selectedPersona.id]: [...(prev[selectedPersona.id] || []), newMessage],
    }));
    
    // Save to backend
    await saveMessage(selectedPersona.id, newMessage);

    setIsTyping(true);

    try {
      // Pass the current messages as history (limiting to last 15 for context efficiency)
      const history = (messages[selectedPersona.id] || []).slice(-15);
      const response = await generateResponse(text, selectedPersona, history);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response.content,
        imageUrl: response.imageUrl,
        audioUrl: response.audioUrl,
        timestamp: Date.now(),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedPersona.id]: [...(prev[selectedPersona.id] || []), aiMessage],
      }));
      
      // Save AI response to backend
      await saveMessage(selectedPersona.id, aiMessage);
    } catch (error) {
      console.error("Failed to generate response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('确定要清空与该角色的聊天记录吗？')) {
      await clearHistory(selectedPersona.id);
      setMessages((prev) => ({
        ...prev,
        [selectedPersona.id]: [],
      }));
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
          onClearHistory={handleClearHistory}
        />
      </div>
    </div>
  );
}

export default App;
