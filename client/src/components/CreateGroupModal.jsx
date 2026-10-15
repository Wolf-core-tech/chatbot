import React, { useState, useEffect } from 'react';
import { friendsAPI, chatsAPI } from '../services/api';
import { Users, Check, X, Shield, Plus } from 'lucide-react';

export default function CreateGroupModal({ onGroupCreated, onClose }) {
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    friendsAPI.getFriendsList()
      .then((res) => setFriends(res.friends || []))
      .catch(() => {});
  }, []);

  const toggleSelectFriend = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Please select at least 1 contact for the group');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await chatsAPI.createGroupChat({
        name: groupName.trim(),
        member_ids: selectedIds,
      });
      onGroupCreated(res.conversation_id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden text-[#e9edef] flex flex-col max-h-[550px]">
        
        {/* Header */}
        <div className="bg-[#202c33] p-4 border-b border-[#222d34] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00a884]" />
            <h3 className="text-base font-bold">New Group Chat</h3>
          </div>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef] p-1 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 flex-1 flex flex-col overflow-hidden space-y-4">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1">
              Group Name
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Project Dev Team 🚀"
              className="w-full bg-[#202c33] border border-[#2a3942] rounded-xl px-3.5 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-2">
              Add Group Members ({selectedIds.length} selected)
            </label>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {friends.length === 0 ? (
                <p className="text-xs text-[#8696a0] text-center py-6">
                  No contacts found. Add friends first to include them in group chats!
                </p>
              ) : (
                friends.map((friend) => {
                  const isSelected = selectedIds.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => toggleSelectFriend(friend.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#00a884]/15 border-[#00a884]'
                          : 'bg-[#202c33] border-[#2a3942] hover:border-[#00a884]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar_url} alt={friend.display_name} className="w-9 h-9 rounded-full" />
                        <div>
                          <p className="text-xs font-bold text-[#e9edef]">{friend.display_name}</p>
                          <p className="text-[10px] text-[#00a884]">{friend.email}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                        isSelected ? 'bg-[#00a884] border-[#00a884] text-[#111b21]' : 'border-[#8696a0]'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || friends.length === 0}
            className="w-full bg-[#00a884] hover:bg-[#008f70] text-[#111b21] font-bold py-3 rounded-xl text-sm transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Group...' : 'Create Group Chat'}
          </button>
        </form>

      </div>
    </div>
  );
}
