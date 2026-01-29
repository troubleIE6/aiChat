import type { Persona } from '../types';
import { cn } from '../lib/utils';
import { Search } from 'lucide-react';

interface SidebarProps {
  personas: Persona[];
  selectedPersonaId: string;
  onSelectPersona: (persona: Persona) => void;
}

export function Sidebar({ personas, selectedPersonaId, onSelectPersona }: SidebarProps) {
  return (
    <div className="w-80 bg-[#f7f7f7] border-r border-gray-200 flex flex-col">
      <div className="p-4 bg-[#f7f7f7] border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center text-white font-bold">
            AI
          </div>
          <h1 className="text-xl font-semibold text-gray-800">AI 伴侣</h1>
        </div>
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="搜索"
            className="w-full bg-[#e2e2e2] text-sm rounded-md px-2 py-1 pl-8 outline-none focus:ring-1 focus:ring-green-500"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-2 top-1.5" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {personas.map((persona) => (
          <div
            key={persona.id}
            onClick={() => onSelectPersona(persona)}
            className={cn(
              "flex items-center p-3 cursor-pointer hover:bg-[#e2e2e2] transition-colors",
              selectedPersonaId === persona.id ? "bg-[#c4c4c4]" : ""
            )}
          >
            <img 
              src={persona.avatar} 
              alt={persona.name} 
              className="w-12 h-12 rounded-md mr-3 bg-white"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {persona.name}
                </h3>
                <span className="text-xs text-gray-400">12:00</span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {persona.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
