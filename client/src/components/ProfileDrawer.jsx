import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { ArrowLeft, Check, Camera, Mail, Info, LogOut, User } from 'lucide-react';

export default function ProfileDrawer({ currentUser, onUpdateUser, onLogout, onClose }) {
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const presets = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe`,
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
      });
      onUpdateUser(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#111b21] flex flex-col border-r border-[#222d34] animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="bg-[#202c33] h-28 px-4 pb-3 flex items-end gap-6 text-[#e9edef]">
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2a3942] rounded-full text-[#8696a0] hover:text-[#e9edef] transition cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-medium">Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group w-40 h-40 rounded-full overflow-hidden border-2 border-[#00a884]/40 shadow-xl bg-[#202c33]">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          </div>

          <p className="text-xs text-[#8696a0] mt-3 mb-2 font-medium">Choose Avatar Preset:</p>
          <div className="flex gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setAvatarUrl(p)}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                  avatarUrl === p ? 'border-[#00a884] scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p} alt={`Preset ${idx}`} className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Display Name */}
        <div className="bg-[#111b21] rounded-lg p-3 border border-[#222d34]">
          <label className="text-xs font-semibold text-[#00a884] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Your Name
          </label>
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-transparent text-sm text-[#e9edef] focus:outline-none border-b border-transparent focus:border-[#00a884] py-1"
            />
          </div>
          <p className="text-[11px] text-[#8696a0] mt-1">This name will be visible to your WhatsApp contacts.</p>
        </div>

        {/* Primary Unique Identifier Email */}
        <div className="bg-[#111b21] rounded-lg p-3 border border-[#222d34]">
          <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#00a884]" /> Email Address (Primary Identifier)
          </label>
          <p className="text-sm font-mono text-[#d1d7db] py-1">{currentUser?.email}</p>
          <p className="text-[11px] text-[#8696a0] mt-1">Your Gmail address is used by friends to send invitations.</p>
        </div>

        {/* Bio */}
        <div className="bg-[#111b21] rounded-lg p-3 border border-[#222d34]">
          <label className="text-xs font-semibold text-[#00a884] uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> About / Bio
          </label>
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-transparent text-sm text-[#e9edef] focus:outline-none border-b border-transparent focus:border-[#00a884] py-1"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#00a884] hover:bg-[#008f70] text-[#111b21] font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : saving ? (
              'Saving...'
            ) : (
              'Save Profile Changes'
            )}
          </button>

          <button
            onClick={onLogout}
            className="w-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
