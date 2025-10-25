import React from 'react';

export default function Toolbar({ onAddCube, onAddLight, onToggleAnim, onFocusLondon }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-neutral-300 mb-2">Create</h2>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onAddCube} className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm">Add Cube</button>
          <button onClick={onAddLight} className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm">Add Light</button>
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-neutral-300 mb-2">Scene</h2>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={onToggleAnim} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm">Toggle Animation</button>
          <button onClick={onFocusLondon} className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm">Focus London</button>
        </div>
      </div>
      <div className="text-xs text-neutral-400 pt-2 border-t border-neutral-800">
        • Left-click: select • Right-drag: orbit • Wheel: zoom
      </div>
    </div>
  );
}
