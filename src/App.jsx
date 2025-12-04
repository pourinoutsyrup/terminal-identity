import React, { useState, useEffect, useRef } from 'react';

// --- CONFIG & DATA ---

const MOON_PHASES = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

// Initial Post Data (Placeholder)
const INITIAL_POSTS = [
  {
    id: 1,
    content: "System initialized. The interface is not just a wrapper; it is the thought process itself exposed.",
    author: "sys_admin",
    moon: "🌔",
    date: "24-12",
    avatarSeed: "sys"
  },
  {
    id: 2,
    content: "Building a digital garden requires a different set of tools than building a billboard. One is for habitation, the other for attraction.",
    author: "sys_admin",
    moon: "🌓",
    date: "24-11",
    avatarSeed: "garden"
  },
  {
    id: 3,
    content: "Minimalism is often confused with emptiness. True minimalism is the removal of noise to amplify the signal.",
    author: "sys_admin",
    moon: "🌒",
    date: "24-10",
    avatarSeed: "min"
  },
  {
    id: 4,
    content: "Awaiting input stream...",
    author: "system",
    moon: "🌑",
    date: "25-01",
    avatarSeed: "bot"
  }
];

// --- COMPONENTS ---

const UserAvatar = ({ seed }) => (
  <img 
    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=000000`} 
    alt="pfp"
    className="w-4 h-4 grayscale opacity-60 hover:opacity-100 transition-opacity"
  />
);

const Post = ({ data }) => {
  return (
    <article className="w-full mb-10 flex flex-col gap-2 group shrink-0">
      {/* Primary Content */}
      <div className="text-base leading-relaxed text-zinc-300 whitespace-pre-wrap antialiased tracking-wide">
        {data.content}
      </div>

      {/* Metadata Row */}
      <div className="flex items-center w-full text-xs text-zinc-600 font-mono">
        <div className="flex items-center gap-3">
          <UserAvatar seed={data.avatarSeed} />
          <span className="hover:text-zinc-400 cursor-pointer transition-colors">
            @{data.author}
          </span>
        </div>
        
        {/* Date and Moon aligned right */}
        <div className="ml-auto flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
           <span>{data.date}</span>
           <span className="text-zinc-500">{data.moon}</span>
        </div>
      </div>
    </article>
  );
};

// Bottom-Up Recursive File System
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
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [inputText, setInputText] = useState("");
  
  // File System State (Dynamic Population)
  const [fileSystem, setFileSystem] = useState(null);
  const [expandedPaths, setExpandedPaths] = useState(['home']);

  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // SIMULATE DATA POPULATION
    const loadedFS = {
      name: 'home',
      type: 'dir',
      path: 'home',
      children: [
        { name: 'books', type: 'file', path: 'home\\books' },
        { name: 'articles', type: 'file', path: 'home\\articles' },
        { 
          name: 'works', 
          type: 'dir', 
          path: 'home\\works',
          children: [
            { name: 'projects.txt', type: 'file', path: 'home\\works\\projects.txt' },
            { name: 'experiments', type: 'file', path: 'home\\works\\experiments' },
            { name: 'archived', type: 'dir', path: 'home\\works\\archived', children: [
               { name: 'v1_site.html', type: 'file', path: 'home\\works\\archived\\v1.html' }
            ]}
          ]
        },
        { name: 'media', type: 'file', path: 'home\\media' },
        { name: 'sys_logs', type: 'file', path: 'home\\system\\logs' },
      ]
    };
    
    setFileSystem(loadedFS);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [posts]);

  const handlePost = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const date = new Date();
    const formattedDate = `${date.getFullYear().toString().substr(-2)}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    const newPost = {
      id: Date.now(),
      content: inputText,
      author: "guest",
      moon: MOON_PHASES[Math.floor(Math.random() * MOON_PHASES.length)],
      date: formattedDate,
      avatarSeed: "guest" + Date.now()
    };

    setPosts(prev => [...prev, newPost]);
    setInputText("");
  };

  const togglePath = (path) => {
    setExpandedPaths(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    );
  };

  if (!mounted) return null;

  return (
    <div className="h-screen w-screen bg-black text-zinc-300 flex overflow-hidden selection:bg-zinc-800 selection:text-white font-mono fixed inset-0">
      
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('[https://fonts.googleapis.com/css2?family=DotGothic16&display=swap](https://fonts.googleapis.com/css2?family=DotGothic16&display=swap)');
        
        :root {
          font-family: 'DotGothic16', sans-serif;
        }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        input:focus { outline: none; }
      `}</style>

      {/* --- LEFT COLUMN: NAV STACK (Bottom Aligned) --- */}
      <aside className="hidden md:flex w-1/4 lg:w-1/3 h-full flex-col justify-end pb-8 pr-8 z-10">
         <div className="flex flex-col-reverse items-end">
            {fileSystem && (
              <FileSystemNode 
                item={fileSystem} 
                expandedPaths={expandedPaths} 
                togglePath={togglePath} 
              />
            )}
         </div>
      </aside>

      {/* --- CENTER COLUMN: FEED + INPUT --- */}
      <main className="w-full md:w-1/2 lg:w-1/3 h-full relative flex flex-col">
        
        {/* POSTS AREA */}
        <div 
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-y-auto no-scrollbar pb-24 px-6 flex flex-col"
        >
          {/* Spacer to allow scrolling */}
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
            <button 
              type="submit"
              className="text-zinc-500 hover:text-zinc-100 transition-colors text-lg font-bold px-2 cursor-pointer"
            >
              &gt;
            </button>
          </form>
        </div>

      </main>

      {/* --- RIGHT COLUMN: EMPTY (For spacing) --- */}
      <div className="hidden md:block md:w-1/4 lg:w-1/3" />

    </div>
  );
}