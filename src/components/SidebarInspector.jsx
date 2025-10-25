import React, { useEffect, useState } from 'react';

export default function SidebarInspector({ selected, onChange }) {
  const [local, setLocal] = useState(selected);

  useEffect(() => {
    setLocal(selected);
  }, [selected]);

  const updateField = (path, value) => {
    setLocal((prev) => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const commitChange = () => {
    if (!local) return;
    onChange({
      id: local.id,
      position: local.position,
      rotation: local.rotation,
      color: local.color,
    });
  };

  const field = (label, value, onInput) => (
    <label className="flex items-center justify-between text-xs text-neutral-300">
      <span className="mr-2 text-neutral-400">{label}</span>
      <input
        className="w-24 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100"
        value={value}
        onChange={(e) => onInput(e.target.value)}
        onBlur={commitChange}
      />
    </label>
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-semibold text-neutral-300">Inspector</h2>
      {!local?.id && (
        <div className="text-xs text-neutral-500">Select an object to edit its properties.</div>
      )}
      {local?.id && (
        <div className="space-y-4">
          <div>
            <div className="text-xs text-neutral-400">Name</div>
            <div className="text-sm">{local.name}</div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400">Transform</div>
            <div className="grid grid-cols-3 gap-2">
              {field('Pos X', local.position.x.toFixed(2), (v) => updateField('position.x', parseFloat(v) || 0))}
              {field('Pos Y', local.position.y.toFixed(2), (v) => updateField('position.y', parseFloat(v) || 0))}
              {field('Pos Z', local.position.z.toFixed(2), (v) => updateField('position.z', parseFloat(v) || 0))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {field('Rot X', local.rotation.x.toFixed(2), (v) => updateField('rotation.x', parseFloat(v) || 0))}
              {field('Rot Y', local.rotation.y.toFixed(2), (v) => updateField('rotation.y', parseFloat(v) || 0))}
              {field('Rot Z', local.rotation.z.toFixed(2), (v) => updateField('rotation.z', parseFloat(v) || 0))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400">Appearance</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={local.color}
                onChange={(e) => {
                  updateField('color', e.target.value);
                  onChange({ ...local, color: e.target.value });
                }}
                className="h-8 w-10 bg-neutral-800 border border-neutral-700 rounded"
              />
              <input
                type="text"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-100 text-xs"
                value={local.color}
                onChange={(e) => updateField('color', e.target.value)}
                onBlur={commitChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
