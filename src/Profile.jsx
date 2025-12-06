import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

const SkyLayer = ({ density = 40 }) => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const starSymbols = ['·', '✦', '✧', '⋆', '∗', '*'];
    
    const generated = Array.from({ length: density }, (_, i) => {
      const yBase = Math.random();
      const y = Math.pow(yBase, 1.5) * 40;
      
      let size = 'text-[8px]';
      const sizeRoll = Math.random();
      if (sizeRoll > 0.95) size = 'text-lg';
      else if (sizeRoll > 0.85) size = 'text-base';
      else if (sizeRoll > 0.7) size = 'text-xs';
      
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
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 8,
        xOffset: (Math.random() - 0.5) * 8
      };
    });
    setStars(generated);
  }, [density]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {stars.map(s => (
        <span
          key={s.id}
          className={`absolute ${s.size} text-zinc-700 star-flicker`}
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

const BORDER_STYLES = {
  double_solid: { 
    example: '╔═══╗',
    horizontal: 'border-t-2 border-b-2 border-solid border-zinc-800',
    vertical: 'border-l-2 border-r-2 border-solid border-zinc-800',
    frame: 'border-2 border-solid border-zinc-700'
  },
  single_solid: { 
    example: '┌───┐',
    horizontal: 'border-t border-b border-solid border-zinc-700',
    vertical: 'border-l border-r border-solid border-zinc-700',
    frame: 'border border-solid border-zinc-700'
  },
  thick_block: { 
    example: '█▀▀█',
    horizontal: 'border-t-4 border-b-4 border-solid border-zinc-800',
    vertical: 'border-l-4 border-r-4 border-solid border-zinc-800',
    frame: 'border-4 border-solid border-zinc-800'
  },
  simple_dashed: { 
    example: '- - -',
    horizontal: 'border-t-2 border-b-2 border-dashed border-zinc-700',
    vertical: 'border-l-2 border-r-2 border-dashed border-zinc-700',
    frame: 'border-2 border-dashed border-zinc-700'
  },
  equals_bar: { 
    example: '=====',
    horizontal: 'border-t-2 border-b-2 border-solid border-zinc-700',
    vertical: 'border-l-2 border-r-2 border-solid border-zinc-700',
    frame: 'border-2 border-solid border-zinc-700'
  },
  hash_fill: { 
    example: '#####',
    horizontal: 'border-t-2 border-b-2 border-dotted border-zinc-700',
    vertical: 'border-l-2 border-r-2 border-dotted border-zinc-700',
    frame: 'border-2 border-dotted border-zinc-700'
  },
  dot_leader: { 
    example: '.....',
    horizontal: 'border-t border-b border-dotted border-zinc-600',
    vertical: 'border-l border-r border-dotted border-zinc-600',
    frame: 'border border-dotted border-zinc-600'
  },
  dashed_chain: { 
    example: '┄┄┄┄┄',
    horizontal: 'border-t-2 border-b-2 border-dashed border-zinc-600',
    vertical: 'border-l-2 border-r-2 border-dashed border-zinc-600',
    frame: 'border-2 border-dashed border-zinc-600'
  },
  light_dotted: { 
    example: '• • •',
    horizontal: 'border-t border-b border-dotted border-zinc-600',
    vertical: 'border-l border-r border-dotted border-zinc-600',
    frame: 'border border-dotted border-zinc-600'
  },
  star_rune: { 
    example: '★─★─★',
    horizontal: 'border-t-2 border-b-2 border-double border-zinc-700',
    vertical: 'border-l-2 border-r-2 border-double border-zinc-700',
    frame: 'border-2 border-double border-zinc-700'
  },
  chevron: { 
    example: '><><>',
    horizontal: 'border-t border-b border-dashed border-zinc-700',
    vertical: 'border-l border-r border-dashed border-zinc-700',
    frame: 'border border-dashed border-zinc-700'
  },
  tilde_wave: { 
    example: '~~~~~',
    horizontal: 'border-t-2 border-b-2 border-dotted border-zinc-600',
    vertical: 'border-l-2 border-r-2 border-dotted border-zinc-600',
    frame: 'border-2 border-dotted border-zinc-600'
  },
  heavy_double: { 
    example: '╔═══╗',
    horizontal: 'border-t-4 border-b-4 border-double border-zinc-800',
    vertical: 'border-l-4 border-r-4 border-double border-zinc-800',
    frame: 'border-4 border-double border-zinc-800'
  },
  thin_single: { 
    example: '─────',
    horizontal: 'border-t border-b border-solid border-zinc-600',
    vertical: 'border-l border-r border-solid border-zinc-600',
    frame: 'border border-solid border-zinc-600'
  },
  mixed: { 
    example: '╒══─',
    horizontal: 'border-t-2 border-b border-solid border-zinc-700',
    vertical: 'border-l-2 border-r border-solid border-zinc-700',
    frame: 'border-2 border-solid border-zinc-700'
  }
};

const SIGIL_LIST = [
  '∞', '☉', '✦', '⊕', '⚕', '❋', '☸',
  '☽', '☾', '◐', '◑', '△', '▽', '☆', '✱', '⚙',
  '♀', '♂', '♃', '♄', '☿', '⊗', '⊙',
  '◇', '◆', '◈', '▢', '▣', '⊞', '⊠', '⊡',
  '☂', '♐', '◊', '⊥', '⊢', '⊣', '⊤', '⊧',
  '✚', '✛', '✜', '✝', '☩', '⊹', '✕',
  '⊏', '⊐', '⊓', '⊔', '∩', '∪', '⌘',
  '☑', '☒', '⊚', '⊘', '⊛', '⊜', '⊝',
  'Ṃ', '⧈', '⧄', '⧉', '⧊', '⌬', '⌭',
  'ᚾ', '⋀', '⋁', '⋂', '⋃', '℘', '⚌',
  '≋', '≡', '∽', '∾', '∿', '⌇', '⌆'
];

const generateNodeId = (userId, username, createdAt) => {
  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  const combined = `${userId}${username}${createdAt}`;
  const hashValue = hash(combined);
  return hashValue.toString(16).toUpperCase().slice(0, 8);
};

const formatLastSeen = (lastSeenDate) => {
  const now = new Date();
  const lastSeen = new Date(lastSeenDate);
  const diffMs = now - lastSeen;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return lastSeen.toLocaleDateString();
};

export default function Profile({ session, onClose }) {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customTagline, setCustomTagline] = useState('');
  const [borderStyle, setBorderStyle] = useState('double_solid');
  const [pfpFrame, setPfpFrame] = useState('simple_dashed');
  const [profileSigil, setProfileSigil] = useState('∞');
  const [showSystemInfo, setShowSystemInfo] = useState(true);
  const [customStatus, setCustomStatus] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  const fileInputRef = useRef(null);
  const isOwnProfile = true;

  useEffect(() => {
    getProfile();
    getUserPosts();
    updateOnlineStatus(true);

    const heartbeat = setInterval(() => {
      updateOnlineStatus(true);
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      updateOnlineStatus(false);
    };
  }, [session]);

  const updateOnlineStatus = async (online) => {
    try {
      await supabase
        .from('profiles')
        .update({ 
          is_online: online,
          last_seen: new Date().toISOString()
        })
        .eq('id', session.user.id);
      setIsOnline(online);
      setLastSeen(new Date().toISOString());
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  const getProfile = async () => {
    try {
      const { user } = session;
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
        setCustomTagline(data.custom_tagline || '');
        setBorderStyle(data.border_style || 'double_solid');
        setPfpFrame(data.pfp_frame || 'simple_dashed');
        setProfileSigil(data.profile_sigil || '∞');
        setShowSystemInfo(data.show_system_info !== false);
        setCustomStatus(data.custom_status || '');
        setIsOnline(data.is_online || false);
        setLastSeen(data.last_seen);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('author', session.user.user_metadata.username)
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload: JPEG, PNG, GIF, or WebP');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File too large. Maximum size: 5MB');
      return;
    }

    try {
      setUploading(true);
      
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${session.user.id}_${timestamp}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      setAvatarUrl(urlData.publicUrl);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;
      const username = user.user_metadata.username;
      
      const updates = {
        id: user.id,
        username: username,
        bio: bio,
        avatar_url: avatarUrl,
        custom_tagline: customTagline,
        border_style: borderStyle,
        pfp_frame: pfpFrame,
        profile_sigil: profileSigil,
        show_system_info: showSystemInfo,
        custom_status: customStatus,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) throw error;

      // Update all posts by this user with new avatar
      const { error: postsError } = await supabase
        .from('posts')
        .update({ avatar_seed: avatarUrl })
        .eq('author', username);

      if (postsError) {
        console.error('Failed to update posts:', postsError);
      }
      
      setEditing(false);
      getProfile(); 
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to save profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return null;

  const currentBorderStyle = BORDER_STYLES[borderStyle] || BORDER_STYLES.double_solid;
  const currentPfpFrameStyle = BORDER_STYLES[pfpFrame] || BORDER_STYLES.simple_dashed;
  const nodeId = generateNodeId(
    session.user.id, 
    session.user.user_metadata.username,
    session.user.created_at
  );
  
  const displayStatus = isOnline 
    ? (customStatus || 'active') 
    : 'offline';

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      
      <style>{`
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
      `}</style>

      <div className="relative bg-black w-full max-w-4xl pointer-events-auto" style={{ height: '85vh' }}>
        
        <div className="absolute -top-2 -left-2 text-zinc-700 text-xl leading-none">╔═</div>
        <div className="absolute -top-2 -right-2 text-zinc-700 text-xl leading-none">═╗</div>
        <div className="absolute -bottom-2 -left-2 text-zinc-700 text-xl leading-none">╚═</div>
        <div className="absolute -bottom-2 -right-2 text-zinc-700 text-xl leading-none">═╝</div>

        <div className={`absolute -top-1 left-6 right-6 ${currentBorderStyle.horizontal}`}></div>
        <div className={`absolute -bottom-1 left-6 right-6 ${currentBorderStyle.horizontal}`}></div>
        <div className={`absolute top-6 bottom-6 -left-1 ${currentBorderStyle.vertical}`}></div>
        <div className={`absolute top-6 bottom-6 -right-1 ${currentBorderStyle.vertical}`}></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-6 z-50 text-zinc-500 hover:text-white text-xl transition-colors"
        >
          ×
        </button>

        <div className="h-full overflow-y-auto no-scrollbar p-10 md:p-16 font-mono text-zinc-300">
          
          <div className="flex flex-col md:flex-row gap-8 items-start mb-10 relative">
            
            <div className="relative shrink-0">
              <div className={`${currentPfpFrameStyle.frame} p-1`}>
                <img 
                  src={avatarUrl || session.user?.user_metadata?.avatar_url} 
                  alt="Avatar" 
                  className="w-28 h-28 md:w-36 md:h-36 grayscale object-cover"
                />
              </div>
              {editing && isOwnProfile && (
                <div className="absolute -bottom-12 left-0 w-full flex flex-col gap-1">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-[9px] w-full text-center text-zinc-500 hover:text-zinc-300 uppercase cursor-pointer"
                  >
                    {uploading ? '[ uploading... ]' : '[ upload ]'}
                  </button>
                  <button 
                    onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`)}
                    className="text-[9px] w-full text-center text-zinc-500 hover:text-zinc-300 uppercase cursor-pointer"
                  >
                    [ reroll ]
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  @{session.user?.user_metadata?.username || profile?.username}
                </h1>
                {isOwnProfile && (
                  !editing ? (
                    <button 
                      onClick={() => setEditing(true)} 
                      className="text-[9px] px-2 py-1 hover:text-white transition-colors uppercase text-zinc-500"
                    >
                      [ edit ]
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(false)} className="text-[9px] text-zinc-500 hover:text-white px-1 uppercase">cancel</button>
                      <button onClick={updateProfile} className="text-[9px] text-white hover:text-zinc-400 uppercase">save</button>
                    </div>
                  )
                )}
              </div>

              {customTagline && !editing && (
                <div className="text-xs text-zinc-500 italic -mt-2">
                  {customTagline}
                </div>
              )}

              {editing && isOwnProfile && (
                <div className="flex flex-col gap-3 p-3 bg-zinc-900/30 border border-zinc-800 text-xs relative z-30">
                  <div className="text-[10px] uppercase text-zinc-600 mb-1">Customize Profile</div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-600 uppercase">Tagline</label>
                    <input 
                      className="bg-black border border-zinc-800 p-2 text-xs focus:outline-none text-zinc-300 placeholder-zinc-700"
                      value={customTagline}
                      onChange={(e) => setCustomTagline(e.target.value)}
                      placeholder="custom tagline..."
                      maxLength={50}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-600 uppercase">Custom Status</label>
                    <input 
                      className="bg-black border border-zinc-800 p-2 text-xs focus:outline-none text-zinc-300 placeholder-zinc-700"
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                      placeholder="active / building / researching..."
                      maxLength={30}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-zinc-600 uppercase">Border</label>
                      <select 
                        className="bg-black border border-zinc-800 p-2 text-xs focus:outline-none text-zinc-300 font-mono"
                        value={borderStyle}
                        onChange={(e) => setBorderStyle(e.target.value)}
                      >
                        {Object.entries(BORDER_STYLES).map(([key, style]) => (
                          <option key={key} value={key}>{style.example}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-zinc-600 uppercase">PFP Frame</label>
                      <select 
                        className="bg-black border border-zinc-800 p-2 text-xs focus:outline-none text-zinc-300 font-mono"
                        value={pfpFrame}
                        onChange={(e) => setPfpFrame(e.target.value)}
                      >
                        {Object.entries(BORDER_STYLES).map(([key, style]) => (
                          <option key={key} value={key}>{style.example}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-600 uppercase">Profile Sigil</label>
                    <select 
                      className="bg-black border border-zinc-800 p-2 text-base focus:outline-none text-zinc-300"
                      value={profileSigil}
                      onChange={(e) => setProfileSigil(e.target.value)}
                    >
                      {SIGIL_LIST.map(sigil => (
                        <option key={sigil} value={sigil}>{sigil}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="showSystemInfo"
                      checked={showSystemInfo}
                      onChange={(e) => setShowSystemInfo(e.target.checked)}
                      className="bg-black border border-zinc-800"
                    />
                    <label htmlFor="showSystemInfo" className="text-[9px] text-zinc-600 uppercase cursor-pointer">
                      Show System Info
                    </label>
                  </div>
                </div>
              )}

              <div className="text-[10px] uppercase tracking-widest text-zinc-600">Bio:</div>
              {editing && isOwnProfile ? (
                <textarea
                  className="w-full h-24 bg-zinc-900/30 border border-zinc-800 p-3 text-xs focus:outline-none resize-none text-zinc-300 placeholder-zinc-700 font-mono"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="enter bio..."
                />
              ) : (
                <div className="text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">
                  {bio || "..."}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center justify-center shrink-0 relative z-20" style={{ height: '144px', width: '80px' }}>
              <div className="text-zinc-700 text-7xl leading-none">
                {profileSigil}
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-dashed border-zinc-800"></div>

          {showSystemInfo && (
            <div className="mb-10">
              <div className="text-[11px] uppercase tracking-widest text-zinc-600 mb-4">
                &lt;NODE_STATUS&gt;
              </div>
              <div className="border border-zinc-800 bg-zinc-950/50 p-4 text-xs text-zinc-500">
                <div className="flex flex-col gap-1 font-mono">
                  <div className="flex items-start">
                    <span className="text-zinc-700 mr-2">├─</span>
                    <span>Entries: {posts.length}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-zinc-700 mr-2">├─</span>
                    <span>Status: {displayStatus}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-zinc-700 mr-2">├─</span>
                    <span>Last Seen: {isOnline ? 'now' : (lastSeen ? formatLastSeen(lastSeen) : 'unknown')}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-zinc-700 mr-2">└─</span>
                    <span>Node: #{nodeId}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6">
            <div className="text-[11px] uppercase tracking-widest text-zinc-600 mb-6">
              &lt;TRANSMISSION_LOG&gt;
            </div>
            
            <div className="flex flex-col gap-6">
              {posts.map((post, idx) => (
                <div key={post.id} className="relative">
                  <div className="pl-4 border-l border-zinc-800">
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2 opacity-70">
                      {post.context === 'global' ? `\\home` : `\\home\\@${session.user?.user_metadata?.username}`}
                    </div>
                    
                    <div className="text-sm text-zinc-300 whitespace-pre-wrap mb-2 leading-relaxed">{post.content}</div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  {idx < posts.length - 1 && (
                    <div className="mt-6 border-t border-dotted border-zinc-900"></div>
                  )}
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-zinc-700 text-sm text-center py-12 italic">No transmissions yet.</div>
              )}
            </div>
          </div>

          {!editing && isOwnProfile && (
            <div className="mt-12 pt-6 border-t border-dashed border-zinc-800 text-center">
              <button 
                onClick={() => setEditing(true)}
                className="text-xs text-zinc-600 hover:text-zinc-400 uppercase tracking-widest"
              >
                [ &gt; edit scroll &lt; ]
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}