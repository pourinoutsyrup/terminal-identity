import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Profile from './Profile';
import { calculateMoonPhase } from './assets/MoonPhase';
import AsciiMoon from './assets/AsciiMoon';

// --- SKY LAYER COMPONENT ---
const SkyLayer = ({ density = 70 }) => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const starSymbols = ['·', '✦', '✧', '⋆', '∗', '*'];
    
    const generated = Array.from({ length: density }, (_, i) => {
      const yBase = Math.random();
      const y = Math.pow(yBase, 1.5) * 50;
      
      // More varied sizes including bigger visible symbols
      let size = 'text-[8px]';
      const sizeRoll = Math.random();
      if (sizeRoll > 0.95) size = 'text-lg'; // Big visible stars
      else if (sizeRoll > 0.85) size = 'text-base';
      else if (sizeRoll > 0.7) size = 'text-xs';
      
      // Pick symbol based on size - bigger stars get more visible symbols
      let symbol = '·';
      if (sizeRoll > 0.85) {
        symbol = starSymbols[Math.floor(Math.random() * starSymbols.length)];
      } else if (sizeRoll > 0.7) {
        symbol = Math.random() > 0.5 ? '·' : '∗';
      }
      
      return {
        id: i,
        x: Math.random() * 100,
        y: y,
        size: size,
        symbol: symbol,
        // Much slower, more varied animation
        duration: 3 + Math.random() * 5, // 3-8 seconds
        delay: Math.random() * 8,
        xOffset: (Math.random() - 0.5) * 10
      };
    });
    setStars(generated);
  }, [density]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {stars.map(s => (
        <span
          key={s.id}
          className={`absolute ${s.size} text-zinc-600 star-flicker`}
          style={{
            left: `calc(${s.x}% + ${s.xOffset}px)`,
            top: `${s.y}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`
          }}
        >
          {s.symbol}
        </span>
      ))}
    </div>
  );
};

// --- COMET LAYER COMPONENT ---
const CometLayer = ({ frequency = 12000 }) => {
  const [comets, setComets] = useState([]);

  useEffect(() => {
    const spawn = () => {
      const id = Date.now();
      setComets(prev => [...prev, { id, x: Math.random() * 80, y: 0 }]);
      setTimeout(() => setComets(prev => prev.filter(c => c.id !== id)), 3000);
    };

    const interval = setInterval(spawn, frequency);
    return () => clearInterval(interval);
  }, [frequency]);

  return (
    <div className="fixed inset-0 pointer-events-none z-45 overflow-hidden">
      {comets.map(c => (
        <div
          key={c.id}
          className="absolute text-zinc-500 text-xs comet-trail"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
        >
          *---&gt;
        </div>
      ))}
    </div>
  );
};

// --- CUSTOM CURSOR COMPONENT ---
const CustomCursor = ({ glyph = '✦' }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <div
        className="fixed pointer-events-none z-[9999] text-zinc-400 text-sm"
        style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      >
        {glyph}
      </div>
    </>
  );
};

const UserAvatar = ({ seed }) => (
  <img 
    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=000000`} 
    alt="pfp"
    className="w-4 h-4 grayscale transition-opacity"
  />
);

const TerminalMarquee = ({ text, speed = 15, isHovered }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const hasOverflow = Math.ceil(textRef.current.scrollWidth) > Math.ceil(containerRef.current.clientWidth);
        setIsOverflowing(hasOverflow);
      }
    };

    checkOverflow();
    document.fonts.ready.then(checkOverflow);
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden flex items-center ${isOverflowing ? 'mask-linear-fade' : ''}`}
      title={text}
    >
      <div 
        className={`whitespace-nowrap flex items-center ${isOverflowing ? 'w-max marquee-anim-target' : 'w-full'}`}
        style={{
          '--marquee-duration': `${speed}s`,
          animationPlayState: isHovered && isOverflowing ? 'running' : 'paused',
        }}
      >
        <span ref={textRef} className={`text-white text-sm ${isOverflowing ? 'mr-12' : ''}`}>
          {text}
        </span>
        {isOverflowing && (
          <span className="text-white text-sm mr-12" aria-hidden="true">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

const NativeMedia = ({ url }) => {
  const [meta, setMeta] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchMeta = async () => {
      try {
        const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
        const html = await res.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const getMetaContent = (property) => {
          const meta = doc.querySelector(`meta[property="${property}"]`) || 
                       doc.querySelector(`meta[name="${property}"]`);
          return meta?.getAttribute('content');
        };
        
        const title = getMetaContent('og:title') || 
                     getMetaContent('twitter:title') || 
                     doc.querySelector('title')?.textContent;
        
        const author = getMetaContent('og:site_name') || 
                      getMetaContent('author') ||
                      new URL(url).hostname.replace('www.', '');
        
        const thumbnail = getMetaContent('og:image') || 
                         getMetaContent('twitter:image');
        
        if (!cancelled && title && title !== url) {
          setMeta({
            title: title.trim(),
            author_name: author,
            thumbnail_url: thumbnail
          });
        }
        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error("Media fetch failed", e);
        if (!cancelled) setLoading(false);
      }
    };
    fetchMeta();
    return () => { cancelled = true; };
  }, [url]);

  const getSmartFallback = (u) => {
    try {
      const urlObj = new URL(u);
      const hostname = urlObj.hostname.replace('www.', '');
      
      if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
        return { title: 'YouTube Video', author: 'YouTube' };
      }
      if (hostname.includes('twitter') || hostname.includes('x.com')) {
        return { title: 'Social Post', author: 'X / Twitter' };
      }
      if (hostname.includes('soundcloud')) {
        return { title: 'Audio Track', author: 'SoundCloud' };
      }
      if (hostname.includes('spotify')) {
        return { title: 'Music Stream', author: 'Spotify' };
      }
      
      return { title: 'External Link', author: hostname };
    } catch {
      return { title: 'Link', author: 'Unknown' };
    }
  };

  const fallback = getSmartFallback(url);
  
  const displayTitle = (meta?.title && meta.title !== url) ? meta.title : fallback.title;
  const displayAuthor = (meta?.author_name && meta.author_name !== 'unknown') ? meta.author_name : fallback.author;
  const thumbnail = meta?.thumbnail_url;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="media-card flex items-center justify-between gap-4 mt-3 w-full select-none cursor-pointer hover:bg-zinc-900/20 py-2 rounded transition-colors"
    >
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center gap-1">
        <div className="relative h-6 w-full">
          <TerminalMarquee text={displayTitle} speed={15} isHovered={isHovered} />
        </div>
        <div className="text-xs text-white font-mono truncate">
          {displayAuthor}
        </div>
      </div>
      
      {thumbnail && (
        <div className="w-12 h-12 shrink-0 bg-zinc-900 border border-zinc-800">
          <img 
            src={thumbnail} 
            alt="Art" 
            className="w-full h-full object-cover grayscale opacity-100 group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      )}
    </a>
  );
};

const ContentRenderer = ({ content }) => {
  const words = content.split(/\s+/);
  const mediaUrls = [];
  const textWords = [];

  words.forEach(word => {
    const isYt = word.match(/(?:youtube\.com|youtu\.be)/);
    const isSc = word.match(/soundcloud\.com/);
    const isUrl = word.match(/^https?:\/\//);

    if (isYt || isSc || isUrl) {
      mediaUrls.push(word);
    } else {
      textWords.push(word);
    }
  });

  return (
    <div className="flex flex-col">
      {textWords.length > 0 && (
        <div className="text-base leading-relaxed text-white whitespace-pre-wrap antialiased tracking-wide">
          {textWords.join(' ')}
        </div>
      )}
      {mediaUrls.map((url, idx) => (
        <NativeMedia key={idx} url={url} />
      ))}
    </div>
  );
};

const Post = ({ data, index, totalPosts }) => {
  const dateObj = new Date(data.created_at);
  const dateStr = `${dateObj.getFullYear().toString().substr(-2)}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

  let displayGlyph = "";
  let tooltipText = null;

  try {
    if (data.moon_phase && data.moon_phase.startsWith('{')) {
      const parsed = JSON.parse(data.moon_phase);
      displayGlyph = parsed.glyph;
      tooltipText = `> ${parsed.phaseName} ${parsed.illumination}`;
    } else {
      const historicalData = calculateMoonPhase(dateObj);
      displayGlyph = historicalData.glyph;
      tooltipText = `> ${historicalData.phaseName} ${historicalData.illumination}`;
    }
  } catch (e) {
    displayGlyph = "◯"; 
  }

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const glyphRef = useRef(null);

  const handleMouseEnter = () => {
    if (glyphRef.current) {
      const rect = glyphRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + (rect.height / 2),
        left: rect.left + 8 
      });
      setShowTooltip(true);
    }
  };

  return (
    <article className="w-full mb-10 flex flex-col gap-2 group shrink-0 post-node">
      <ContentRenderer content={data.content} />
      
      <div className="flex items-center w-full text-xs text-white font-mono mt-2">
        <div className="flex items-center gap-3">
          <UserAvatar seed={data.avatar_seed || 'guest'} />
          <span className="hover:underline cursor-pointer transition-colors">
            @{data.author}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
           <span>{dateStr}</span>
           
           <span 
             ref={glyphRef}
             className="text-white hover:text-white transition-colors cursor-default"
             onMouseEnter={handleMouseEnter}
             onMouseLeave={() => setShowTooltip(false)}
           >
             {displayGlyph}
           </span>

           {showTooltip && tooltipText && (
             <div 
               className="fixed z-[9999] text-white text-[10px] pointer-events-none whitespace-nowrap bg-black/80 backdrop-blur-sm px-2 rounded"
               style={{ 
                 top: tooltipPos.top, 
                 left: tooltipPos.left,
                 transform: 'translateY(-50%)'
               }}
             >
               {tooltipText}
             </div>
           )}
        </div>
      </div>
    </article>
  );
};

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
          ${isDir ? 'text-zinc-400 hover:text-zinc-400' : 'text-white hover:text-white'}
          hover:underline decoration-current underline-offset-4
        `}
        style={{ paddingRight: `${paddingRight}px` }}
      >
        <span className="text-sm tracking-wide">
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

export default function App() {
  const [posts, setPosts] = useState([]);
  const [inputText, setInputText] = useState("");
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [viewProfile, setViewProfile] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState(['home']);
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0); 
  
  const bottomRef = useRef(null);

  const fileSystem = {
    name: 'home', type: 'dir', path: 'home',
    children: [
      { name: 'books', type: 'file', path: 'home\\books' },
      { name: 'articles', type: 'file', path: 'home\\articles' },
      { 
        name: 'works', type: 'dir', path: 'home\\works',
        children: [
          { name: 'projects.txt', type: 'file', path: 'home\\works\\projects.txt' },
        ]
      },
      { name: 'sys_logs', type: 'file', path: 'home\\system\\logs' },
    ]
  };

  useEffect(() => {
    fetchPosts();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or('context.eq.global,context.is.null') 
      .order('created_at', { ascending: true });
    
    if (!error) setPosts(data);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !session) return;

    const moonData = calculateMoonPhase(new Date());
    const moonPayload = JSON.stringify(moonData);
    
    const username = session.user?.user_metadata?.username || 'user';
    const avatar = session.user?.user_metadata?.avatar_url || 'guest';
    const context = viewProfile ? 'profile' : 'global';

    const { error } = await supabase
      .from('posts')
      .insert([
        { 
          content: inputText, 
          author: username, 
          moon_phase: moonPayload, 
          avatar_seed: avatar,
          context: context
        }
      ]);

    if (!error) {
      setInputText("");
      if (!viewProfile) {
        fetchPosts();
      } else {
        setProfileRefreshTrigger(prev => prev + 1);
      }
    } else {
      console.error("Post error:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setViewProfile(false);
  };

  const togglePath = (path) => {
    setExpandedPaths(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
  };

  const currentPath = viewProfile && session
    ? `scientialiberabit\\home\\@${session.user.user_metadata.username}`
    : `scientialiberabit\\home`;

  return (
    <div className="h-screen w-screen bg-black text-white flex overflow-hidden selection:bg-zinc-800 selection:text-white font-mono fixed inset-0">
      
      <SkyLayer density={60} />
      <CometLayer frequency={15000} />
      <CustomCursor glyph="✦" />
      <AsciiMoon />
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input:focus { outline: none; }
        
        @keyframes terminal-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .marquee-anim-target {
          animation-name: terminal-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .mask-linear-fade {
          mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }

        @keyframes star-flicker {
          0% { opacity: 0; }
          10% { opacity: 0.2; }
          20% { opacity: 1; }
          30% { opacity: 0.8; }
          40% { opacity: 0.3; }
          50% { opacity: 0; }
          60% { opacity: 0; }
          70% { opacity: 0.4; }
          80% { opacity: 0.9; }
          90% { opacity: 0.6; }
          100% { opacity: 0; }
        }

        .star-flicker {
          animation: star-flicker ease-in-out infinite;
        }

        @keyframes comet-trail {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(200px, 200px);
            opacity: 0;
          }
        }

        .comet-trail {
          animation: comet-trail 3s linear forwards;
        }

        @keyframes post-float {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .post-node {
          animation: post-float 0.6s ease-out;
        }

        main > div:first-child::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(to bottom, black 0%, transparent 100%);
          pointer-events: none;
          z-index: 10;
        }
      `}</style>

      {showAuth && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="relative">
            <button 
              onClick={() => setShowAuth(false)}
              className="absolute -top-6 right-0 text-zinc-500 hover:text-white text-xs"
            >
              [ESC]
            </button>
            <Auth />
          </div>
        </div>
      )}

      {viewProfile && session && (
        <Profile 
          session={session} 
          onClose={() => setViewProfile(false)} 
          key={profileRefreshTrigger} 
        />
      )}

      <aside className="hidden md:flex w-1/4 lg:w-1/3 h-full flex-col justify-end pb-6 pr-8 z-10 border-r border-zinc-900/0">
         <div className="flex flex-col-reverse items-end">
            <FileSystemNode item={fileSystem} expandedPaths={expandedPaths} togglePath={togglePath} />
         </div>
      </aside>

      <main className="w-full md:w-1/2 lg:w-1/3 h-full relative flex flex-col">
        <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-24 px-6 flex flex-col">
          <div className="mt-auto pt-32 flex flex-col gap-2">
            {posts.map((post, index) => (
              <Post key={post.id} data={post} index={index} totalPosts={posts.length} />
            ))}
            <div ref={bottomRef} className="h-2" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
          {!session ? (
            <div className="flex items-center">
              <button 
                onClick={() => setShowAuth(true)}
                className="text-zinc-500 hover:text-zinc-100 text-sm font-bold uppercase tracking-widest animate-pulse"
              >
                [ CONNECT ]
              </button>
            </div>
          ) : (
            <form onSubmit={handlePost} className="flex items-center justify-between w-full">
              <div className="flex items-center flex-1 mr-4 min-w-0">
                <span className="text-xs md:text-sm text-zinc-500 font-bold whitespace-nowrap select-none mr-2">
                  {currentPath} {'>'}
                </span>
                <input 
                  type="text" 
                  autoComplete="off"
                  data-lpignore="true" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="bg-transparent border-none text-white placeholder-zinc-500 flex-1 text-sm md:text-base p-0 focus:ring-0 tracking-wide min-w-0"
                  autoFocus
                />
              </div>
            </form>
          )}
        </div>
      </main>

      <aside className="hidden md:flex w-1/4 lg:w-1/3 h-full flex-col justify-end pb-6 pl-8 z-10 overflow-visible">
        {session && (
          <div className="relative group flex items-center gap-3 cursor-pointer w-max" onClick={() => setViewProfile(true)}>
             <div className="relative z-20 flex items-center gap-3 bg-black">
               <UserAvatar seed={session.user?.user_metadata?.username || 'guest'} />
               <span className="text-sm text-zinc-400 hover:text-white hover:underline transition-colors">
                 @{session.user?.user_metadata?.username}
               </span>
             </div>
             
             <button 
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                className="absolute left-full ml-4 text-xs text-red-900 hover:text-red-500 transition-all duration-300 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap z-10"
             >
                {'>'} logout
             </button>
          </div>
        )}
      </aside>
    </div>
  );
}