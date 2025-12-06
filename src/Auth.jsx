import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // TRICK: We attach a fake domain to satisfy Supabase's requirement for an email.
    // The user never sees this.
    const ghostEmail = `${username}@void.net`;

    try {
      // 1. Attempt Login first
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: ghostEmail,
        password,
      });

      if (!loginError && loginData.session) {
        setLoading(false);
        return; // Success, App.jsx handles the rest
      }

      // 2. If Login failed, assume user doesn't exist and try to Register
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ghostEmail,
        password,
        options: {
          data: {
            username: username, 
            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("unique")) {
          setMessage("Incorrect Password");
        } else if (signUpError.message.includes("security purposes") || signUpError.message.includes("rate limit")) {
          setMessage("System Cooldown: Wait 60s");
        } else {
          setMessage(signUpError.message); 
        }
      } else if (signUpData.user && !signUpData.session) {
         // This specific error state happens if "Confirm Email" is ON.
         setMessage("SETUP ERROR: Go to Supabase Dashboard -> Auth -> Providers -> Email -> Uncheck 'Confirm Email'.");
      } else if (signUpData.session) {
         setLoading(false);
         return;
      }

    } catch (err) {
      setMessage("System Error: " + err.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full max-w-xs font-mono text-zinc-300">
      <form onSubmit={handleAuth} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
          className="bg-black text-zinc-300 p-2 text-sm focus:outline-none placeholder-zinc-700"
          autoFocus
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-black text-zinc-300 p-2 text-sm focus:outline-none placeholder-zinc-700"
          required
        />
        
        <button 
          disabled={loading}
          className="text-left text-zinc-500 hover:text-zinc-300 text-xs py-2 uppercase font-bold"
        >
          {loading ? '...' : '[ CONNECT ]'}
        </button>
      </form>

      {message && <div className="text-xs text-red-500 mt-1 whitespace-pre-wrap">{message}</div>}
    </div>
  );
}