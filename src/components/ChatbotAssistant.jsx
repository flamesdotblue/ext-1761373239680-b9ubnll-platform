import React, { useMemo, useState } from 'react';

function generateResponse(input) {
  const text = input.toLowerCase();
  if (/(add|create).*(cube|box)/.test(text)) {
    return 'To add a cube: Click “Add Cube” in the Create panel, then click the cube in the viewport to select it. Use the Inspector to change its transform and color.';
  }
  if (/(light|lighting)/.test(text)) {
    return 'Lights: Use “Add Light” to place a point light at the camera. You already have ambient and directional lights. Move lights like any other object by selecting them (if selectable) and changing position.';
  }
  if (/(select|click|pick)/.test(text)) {
    return 'Selection: Left-click any building or cube. The selected item highlights and appears in the Inspector for editing.';
  }
  if (/(animate|animation|spin|rotate)/.test(text)) {
    return 'Animation: Press “Toggle Animation” to spin the selected object. For keyframes, duplicate objects and adjust transforms while we prepare a timeline UI in future builds.';
  }
  if (/(london|city|map)/.test(text)) {
    return 'London Scene: The viewport includes a simplified London: river and building clusters. Click “Focus London” to center the camera on it.';
  }
  if (/(export|save|download)/.test(text)) {
    return 'Export: In this demo, export is not implemented. You can take a screenshot via your system tools. 3D export (e.g., glTF) can be added on request.';
  }
  if (/(help|beginner|guide|how)/.test(text)) {
    return 'Quick Start: 1) Add a cube. 2) Orbit with right-drag, zoom with wheel. 3) Select with left-click. 4) Tweak transform in Inspector. 5) Toggle animation to spin.';
  }
  return 'I can help with creating cubes, adding lights, selecting objects, simple animation, and navigating the London demo scene. Ask me something specific!';
}

export default function ChatbotAssistant({ className = '' }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your 3D guide. Ask me how to add cubes, lights, animate, or focus the London scene.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    const response = generateResponse(content);
    setMessages((m) => [...m, { role: 'user', content }, { role: 'assistant', content: response }]);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-80 ${className}`}>
      <div className="p-3 text-sm font-semibold text-neutral-300">AI Assistant</div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`text-xs leading-relaxed ${m.role === 'assistant' ? 'text-neutral-300' : 'text-neutral-200'} `}>
            <span className={`inline-block px-3 py-2 rounded max-w-[90%] ${m.role === 'assistant' ? 'bg-neutral-800' : 'bg-indigo-600'}`}>{m.content}</span>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-neutral-800 flex items-center gap-2">
        <input
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
          placeholder="Ask about animation, lights, or London..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm">Send</button>
      </div>
    </div>
  );
}
