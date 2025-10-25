import React, { useRef, useState } from 'react';
import Toolbar from './components/Toolbar';
import Viewport3D from './components/Viewport3D';
import SidebarInspector from './components/SidebarInspector';
import ChatbotAssistant from './components/ChatbotAssistant';

export default function App() {
  const viewportRef = useRef(null);
  const [selectedInfo, setSelectedInfo] = useState({ id: null, name: '', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, color: '#cccccc' });

  const handleAddCube = () => viewportRef.current?.addCube();
  const handleAddLight = () => viewportRef.current?.addLight();
  const handleToggleAnim = () => viewportRef.current?.toggleAnimation();
  const handleFocusLondon = () => viewportRef.current?.focusLondon();

  const handleSelect = (info) => {
    setSelectedInfo(info || { id: null, name: '', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, color: '#cccccc' });
  };

  const handleUpdateSelected = (updates) => {
    viewportRef.current?.updateSelected(updates);
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-bold text-indigo-300">3D</div>
          <h1 className="text-lg font-semibold tracking-tight">Open Studio — 3D Animation Playground</h1>
        </div>
        <div className="text-xs text-neutral-400">Inspired by pro tools, simplified for the web</div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-neutral-800 bg-neutral-900/40 overflow-y-auto">
          <Toolbar onAddCube={handleAddCube} onAddLight={handleAddLight} onToggleAnim={handleToggleAnim} onFocusLondon={handleFocusLondon} />
        </aside>
        <main className="flex-1 relative bg-neutral-950">
          <Viewport3D ref={viewportRef} onSelect={handleSelect} />
        </main>
        <aside className="w-80 border-l border-neutral-800 bg-neutral-900/40 overflow-y-auto">
          <SidebarInspector selected={selectedInfo} onChange={handleUpdateSelected} />
          <ChatbotAssistant className="border-t border-neutral-800" />
        </aside>
      </div>
    </div>
  );
}
