import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  UserPlus,
  Mail,
  Search,
  MoreVertical,
  LogOut,
  User,
  Plus,
  CheckCheck,
  Check,
} from 'lucide-react';

export default function Sidebar({
  currentUser,
  chats,
  activeChatId,
  pendingCount,
  onSelectChat,
  onOpenProfile,
  onOpenFriends,
  onOpenCreateGroup,
  onOpenEmailOutbox,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'unread', 'groups'
  const [showMenu, setShowMenu] = useState(false);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterTab === 'unread') return chat.unreadCount > 0;
    if (filterTab === 'groups') return chat.type === 'group';
    return true;
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-[380px] lg:w-[420px] h-full bg-[#111b21] border-r border-[#222d34] flex flex-col relative select-none shrink-0">
      
      {/* Top Header */}
      <div className="h-16 bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222d34] shrink-0">
        {/* User Avatar */}
        <button
          onClick={onOpenProfile}
          className="relative group flex items-center gap-2 cursor-pointer focus:outline-none"
          title="Profile & Settings"
        >
          <div className="relative">
            <img
              src={currentUser?.avatar_url}
              alt={currentUser?.display_name}
              className="w-10 h-10 rounded-full border border-[#00a884]/40 object-cover group-hover:scale-105 transition"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full"></span>
          </div>
          <span className="text-xs font-bold text-[#e9edef] hidden sm:block max-w-[100px] truncate">
            {currentUser?.display_name}
          </span>
        </button>

        {/* Action Header Icons */}
        <div className="flex items-center gap-1 text-[#8696a0]">
          {/* Email Outbox Inspector */}
          <button
            onClick={onOpenEmailOutbox}
            className="p-2 hover:bg-[#2a3942] rounded-full hover:text-[#00a884] transition cursor-pointer relative"
            title="Nodemailer Email Outbox Inspector"
          >
            <Mail className="w-5 h-5" />
          </button>

          {/* Friends & Requests */}
          <button
            onClick={onOpenFriends}
            className="p-2 hover:bg-[#2a3942] rounded-full hover:text-[#00a884] transition cursor-pointer relative"
            title="Friends & Email Invitations"
          >
            <UserPlus className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#00a884] text-[#111b21] rounded-full text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          {/* New Group */}
          <button
            onClick={onOpenCreateGroup}
            className="p-2 hover:bg-[#2a3942] rounded-full hover:text-[#00a884] transition cursor-pointer"
            title="New Group Chat"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#2a3942] rounded-full hover:text-[#e9edef] transition cursor-pointer"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 z-50 w-48 bg-[#233138] border border-[#2a3942] rounded-xl shadow-2xl py-2 text-xs text-[#d1d7db] space-y-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#00a884]" /> Profile
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenFriends();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#00a884]" /> Contacts & Requests
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenEmailOutbox();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] flex items-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-[#00a884]" /> Email Outbox Log
                </button>
                <div className="border-t border-[#2a3942] my-1"></div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] text-red-400 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 bg-[#111b21] border-b border-[#222d34]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8696a0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-[#202c33] border border-transparent focus:border-[#00a884]/40 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'groups', label: 'Groups' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-[#00a884] text-[#111b21]'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-[#8696a0] space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs">No conversations found.</p>
            <button
              onClick={onOpenFriends}
              className="text-xs text-[#00a884] font-semibold hover:underline cursor-pointer"
            >
              Find or invite friends to start chatting
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isPeerOnline = chat.type === 'direct' && chat.peerUser?.is_online === 1;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-3 flex items-center gap-3 cursor-pointer transition ${
                  isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                }`}
              >
                {/* Avatar with Online Badge */}
                <div className="relative shrink-0">
                  <img
                    src={chat.avatar_url}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#2a3942]"
                  />
                  {isPeerOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] border-2 border-[#111b21] rounded-full"></span>
                  )}
                </div>

                {/* Chat details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#e9edef] truncate">{chat.name}</h3>
                    <span className="text-[10px] text-[#8696a0] shrink-0">
                      {formatTime(chat.lastMessage?.created_at || chat.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className="text-xs text-[#8696a0] truncate flex items-center gap-1">
                      {chat.lastMessage?.sender_id === currentUser?.id && (
                        <span>
                          {chat.lastMessage?.overallStatus === 'READ' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-[#8696a0] inline" />
                          )}
                        </span>
                      )}
                      <span>
                        {chat.lastMessage
                          ? chat.lastMessage.content || '[Media attachment]'
                          : 'No messages yet'}
                      </span>
                    </p>

                    {chat.unreadCount > 0 && (
                      <span className="bg-[#00a884] text-[#111b21] font-bold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
