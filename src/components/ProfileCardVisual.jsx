import { useState } from 'react';

const GLYPHS = ['☿', '♀', '♁', '♂', '♃', '♄', '⊕', '☉', '☽'];

export default function ProfileCardVisual({ username, bio, status = 'active' }) {
  const [glyph, setGlyph] = useState('☿');
  const [pixellate, setPixellate] = useState(false);

  return (
    <div className="flex gap-6 items-start">
      <div className="flex flex-col gap-2">
        <div className="w-32 h-32 bg-zinc-900 border border-zinc-800">
          {/* PFP placeholder */}
        </div>
        <button
          onClick={() => setPixellate(!pixellate)}
          className="text-[10px] text-zinc-600 hover:text-zinc-400"
        >
          {pixellate ? 'UN-PIXELLATE' : 'PIXELLATE'}
        </button>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <select
            value={glyph}
            onChange={(e) => setGlyph(e.target.value)}
            className="bg-black border border-zinc-800 text-zinc-400 text-lg px-2"
          >
            {GLYPHS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <span className="text-2xl text-white">@{username}</span>
        </div>
        <p className="text-sm text-zinc-400 border-l-2 border-zinc-900 pl-4">{bio}</p>
      </div>

      <div className="text-zinc-600 text-xs writing-mode-vertical-rl">
        {status.split('').join(' ')}
      </div>
    </div>
  );
}