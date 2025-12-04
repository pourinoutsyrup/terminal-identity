import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient'; // Import the connection

// --- CONFIG ---
const MOON_PHASES = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

// --- COMPONENTS ---

const UserAvatar = ({ seed }) => (
  <img 
    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=000000`} 
    alt="pfp"
    className="w-4 h-4 grayscale opacity-60 hover:opacity-100 transition-opacity"
  />
);

const Post = ({ data }) => {
  // Format the timestamp from Supabase
  const dateObj = new Date(data.created_at);
  const dateStr = `${dateObj.getFullYear().toString().substr(-2)}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <article className="w-full mb-10 flex flex-col gap-2 group shrink-0">
      <div className="text-base leading-relaxed text-zinc-300 whitespace-pre-wrap antialiased tracking-wide">
        {data.content}
      </div>

      <div className="flex items-center w-full text-xs text-zinc-600 font-mono">
        <div className="flex items-center gap-3">
          <UserAvatar seed={data.avatar_seed || 'guest'} />
          <span className="hover:text-zinc-400 cursor-pointer transition-colors">
            @{data.author}
          </span>
        </div>
        
        <div className="ml-auto flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
           <span>{dateStr}</span>
           <span className="text-zinc-500">{data.moon_phase}</span>
        </div>
      </div>
    </article>
  );
};

// Simple File System Node (Visual Only for now)
const FileSystemNode = ({ item, level = 0, expandedPaths, togglePath }) => {
  const isExpanded = expandedPaths.includes(item.path);
  const isDir = item.type === 'dir';
  const paddingRight = level * 12; 

  return (
    <div className="flex flex-col-reverse items-end w-full">
      <div 
        onClick={() => isDir ? togglePath(item.path) : null}
        className={`
          cursor-pointer py-1 text-right select-none transition-colors
          ${isDir ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-300'}
        `}
        style={{ paddingRight: `${paddingRight}px` }}
      >
        <span className={`text-sm tracking-wide ${!isDir ? 'hover:underline decoration-zinc-800 underline-offset-4' : ''}`}>
           {item.name}{isDir ? '\\' : ''}
        </span>
      </div>
      
      {isDir && isExpanded && item.children && (
        <div className="flex flex-col-reverse w-full">
          {item.children.map((child) => (
            <FileSystemNode 
              key={child.path} 
              item={child} 
              level={level + 1} 
              expandedPaths={expandedPaths}
              togglePath={togglePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [posts, setPosts] = useState([]); // Empty start, fill from DB
  const [inputText, setInputText] = useState("");
  const [expandedPaths, setExpandedPaths] = useState(['home']);
  const bottomRef = useRef(null);

  // 1. Fetch Posts from Supabase on Load
  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. Auto-scroll when posts change
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [posts]);

  // Function to get data
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: true }); // Oldest first (top) -> Newest last (bottom)
    
    if (error) console.log('error', error);
    else setPosts(data);
  };

  // Function to send data
  const handlePost = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMoon = MOON_PHASES[Math.floor(Math.random() * MOON_PHASES.length)];
    const newSeed = "guest" + Date.now();

    // Insert into Supabase
    const { error } = await supabase
      .from('posts')
      .insert([
        { 
          content: inputText, 
          author: 'guest', 
          moon_phase: newMoon,
          avatar_seed: newSeed
        }
      ]);

    if (error) {
      console.error('Error posting:', error);
    } else {
      // If success, clear input and refresh list
      setInputText("");
      fetchPosts(); 
    }
  };

  const togglePath = (path) => {
    setExpandedPaths(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
  };

  // Hardcoded FS for now (We will connect this to DB later)
  const fileSystem = {
    name: 'home', type: 'dir', path: 'home',
    children: [
      { name: 'books', type: 'file', path: 'home\\books' },
      { name: 'sys_logs', type: 'file', path: 'home\\system\\logs' },
    ]
  };

  return (
    <div className="h-screen w-screen bg-black text-zinc-300 flex overflow-hidden selection:bg-zinc-800 selection:text-white font-mono fixed inset-0">
      <style>{`
        @import url('[https://fonts.googleapis.com/css2?family=DotGothic16&display=swap](https://fonts.googleapis.com/css2?family=DotGothic16&display=swap)');
        :root { font-family: 'DotGothic16', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input:focus { outline: none; }
      `}</style>

      {/* LEFT COLUMN: NAV STACK */}
      <aside className="hidden md:flex w-1/4 lg:w-1/3 h-full flex-col justify-end pb-8 pr-8 z-10">
         <div className="flex flex-col-reverse items-end">
            <FileSystemNode item={fileSystem} expandedPaths={expandedPaths} togglePath={togglePath} />
         </div>
      </aside>

      {/* CENTER COLUMN: FEED */}
      <main className="w-full md:w-1/2 lg:w-1/3 h-full relative flex flex-col">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-24 px-6 flex flex-col">
          <div className="mt-auto pt-32 flex flex-col gap-2">
            {posts.map((post) => (
              <Post key={post.id} data={post} />
            ))}
            <div ref={bottomRef} className="h-2" />
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
          <form onSubmit={handlePost} className="flex items-center gap-4">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-transparent border-none text-zinc-100 placeholder-zinc-800 flex-1 text-base p-0 focus:ring-0 tracking-wider"
              autoFocus
            />
            <button type="submit" className="text-zinc-500 hover:text-zinc-100 transition-colors text-lg font-bold px-2 cursor-pointer">
              &gt;
            </button>
          </form>
        </div>
      </main>

      {/* RIGHT COLUMN: EMPTY */}
      <div className="hidden md:block md:w-1/4 lg:w-1/3" />
    </div>
  );
}