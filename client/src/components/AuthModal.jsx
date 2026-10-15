import React, { useState, useEffect } from 'react';
import { authAPI, setAuthToken } from '../services/api';
import { MessageSquare, Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('Hey there! I am using WhatsApp.');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState([]);

  useEffect(() => {
    // Parse URL params for invite code & email
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    const emailParam = params.get('email');

    if (code) {
      setInviteCode(code);
      setIsRegister(true);
    }
    if (emailParam) {
      setEmail(emailParam);
    }

    // Fetch demo accounts for quick testing
    authAPI.getDemoAccounts()
      .then((res) => setDemoAccounts(res.accounts || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await authAPI.register({
          email,
          password,
          display_name: displayName,
          bio,
          invite_code: inviteCode,
        });
      } else {
        res = await authAPI.login(email, password);
      }

      setAuthToken(res.token);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (accEmail) => {
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(accEmail, 'password123');
      setAuthToken(res.token);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden text-[#e9edef]">
        
        {/* Header Header */}
        <div className="bg-[#202c33] p-6 text-center border-b border-[#222d34] relative">
          <div className="w-16 h-16 bg-[#00a884]/20 border border-[#00a884]/40 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <MessageSquare className="w-8 h-8 text-[#00a884]" />
          </div>
          <h2 className="text-2xl font-bold tracking-wide">WhatsApp Web</h2>
          <p className="text-xs text-[#8696a0] mt-1">Real-Time Messaging with Email Invitations</p>

          {inviteCode && (
            <div className="mt-3 bg-[#00a884]/15 border border-[#00a884]/30 rounded-lg p-2.5 text-xs text-[#00a884] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>You were invited! Complete sign-up to connect automatically.</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-3 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-[#8696a0]" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#202c33] border border-[#2a3942] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1">
              Gmail / Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8696a0]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8696a0]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1">
                Bio / About
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Hey there! I am using WhatsApp."
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-lg px-3 py-2 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00a884] hover:bg-[#008f70] text-[#111b21] font-bold py-3 rounded-lg text-sm transition shadow-md disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create WhatsApp Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-[#00a884] hover:underline cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </form>

        {/* Quick Demo Switcher Section */}
        {demoAccounts.length > 0 && !isRegister && (
          <div className="bg-[#0b141a] p-4 border-t border-[#222d34]">
            <p className="text-[11px] text-[#8696a0] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00a884]" />
              Quick Demo Login (Click to switch user):
            </p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleQuickDemoLogin(acc.email)}
                  className="bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] hover:border-[#00a884]/50 rounded-lg px-2.5 py-1.5 text-xs text-[#e9edef] flex items-center gap-2 transition cursor-pointer"
                >
                  <img src={acc.avatar_url} alt={acc.display_name} className="w-4 h-4 rounded-full" />
                  <span className="font-medium">{acc.display_name.split(' ')[0]}</span>
                  <span className="text-[10px] text-[#8696a0]">({acc.email})</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
