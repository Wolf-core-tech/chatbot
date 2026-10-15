import React, { useState, useEffect } from 'react';
import { authAPI, chatsAPI, friendsAPI, setAuthToken } from './services/api';
import { initSocketClient, disconnectSocket, getSocket } from './services/socket';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ProfileDrawer from './components/ProfileDrawer';
import FriendsModal from './components/FriendsModal';
import CreateGroupModal from './components/CreateGroupModal';
import EmailOutboxModal from './components/EmailOutboxModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Modals state
  const [showProfile, setShowProfile] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEmailOutbox, setShowEmailOutbox] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authAPI.getMe();
      setCurrentUser(res.user);
      initUserSession(res.user);
    } catch (err) {
      setCurrentUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  const initUserSession = async (user) => {
    // Init socket
    const socket = initSocketClient();

    // Fetch conversations & pending requests count
    loadChats();
    loadPendingCount();

    if (socket) {
      socket.on('conversation_updated', () => {
        loadChats();
      });

      socket.on('user_status_change', ({ userId, is_online }) => {
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.peerUser && chat.peerUser.id === userId) {
              return {
                ...chat,
                peerUser: { ...chat.peerUser, is_online },
              };
            }
            return chat;
          })
        );
      });
    }
  };

  const loadChats = async () => {
    try {
      const res = await chatsAPI.getChats();
      setChats(res.chats || []);
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const loadPendingCount = async () => {
    try {
      const res = await friendsAPI.getRequests();
      setPendingCount(res.incoming?.length || 0);
    } catch (err) {
      console.error('Failed to load pending requests count:', err);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    initUserSession(user);
  };

  const handleLogout = () => {
    setAuthToken(null);
    disconnectSocket();
    setCurrentUser(null);
    setChats([]);
    setActiveChatId(null);
    setShowProfile(false);
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  if (loadingAuth) {
    return (
      <div className="fixed inset-0 bg-[#0b141a] flex items-center justify-center text-[#00a884]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-[#8696a0]">Loading WhatsApp Web...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="w-screen h-screen bg-[#0b141a] flex overflow-hidden relative">
      
      {/* Sidebar (Left Panel) */}
      <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
        <Sidebar
          currentUser={currentUser}
          chats={chats}
          activeChatId={activeChatId}
          pendingCount={pendingCount}
          onSelectChat={(id) => setActiveChatId(id)}
          onOpenProfile={() => setShowProfile(true)}
          onOpenFriends={() => setShowFriends(true)}
          onOpenCreateGroup={() => setShowCreateGroup(true)}
          onOpenEmailOutbox={() => setShowEmailOutbox(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* Chat Window (Right Panel) */}
      <div className={`${!activeChatId ? 'hidden md:flex' : 'flex'} flex-1 h-full`}>
        <ChatWindow
          activeChat={activeChat}
          currentUser={currentUser}
          onCloseChat={() => setActiveChatId(null)}
        />
      </div>

      {/* Profile Drawer */}
      {showProfile && (
        <ProfileDrawer
          currentUser={currentUser}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Friends & Invitations Modal */}
      {showFriends && (
        <FriendsModal
          currentUser={currentUser}
          onSelectChat={(id) => {
            loadChats();
            setActiveChatId(id);
          }}
          onClose={() => {
            setShowFriends(false);
            loadChats();
            loadPendingCount();
          }}
        />
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onGroupCreated={(id) => {
            loadChats();
            setActiveChatId(id);
          }}
          onClose={() => setShowCreateGroup(false)}
        />
      )}

      {/* Email Outbox Log Inspector Modal */}
      {showEmailOutbox && (
        <EmailOutboxModal onClose={() => setShowEmailOutbox(false)} />
      )}

    </div>
  );
}
