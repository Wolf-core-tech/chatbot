import React, { useState, useEffect, useRef } from 'react';
import { chatsAPI } from '../services/api';
import { getSocket } from '../services/socket';
import {
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  CheckCheck,
  Check,
  Image as ImageIcon,
  X,
  Reply,
  ArrowLeft,
} from 'lucide-react';

const COMMON_EMOJIS = ['😀', '😂', '😍', '👍', '❤️', '🔥', '🎉', '🙏', '😊', '🙌', '😎', '🚀', '💬', '✨', '👏', '💯'];

export default function ChatWindow({
  activeChat,
  currentUser,
  onCloseChat,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!activeChat) return;

    // Load message history
    chatsAPI.getMessages(activeChat.id)
      .then((res) => {
        setMessages(res.messages || []);
        scrollToBottom();
      })
      .catch((err) => console.error('Fetch messages error:', err));

    const socket = getSocket();
    if (socket) {
      socket.emit('join_conversation', activeChat.id);
      socket.emit('mark_read', { conversation_id: activeChat.id });

      const handleNewMessage = (msg) => {
        if (msg.conversation_id === activeChat.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();

          if (msg.sender_id !== currentUser?.id) {
            socket.emit('mark_read', { conversation_id: activeChat.id });
          }
        }
      };

      const handleTypingStart = ({ conversation_id, display_name }) => {
        if (conversation_id === activeChat.id) {
          setTypingUsers((prev) => new Set(prev).add(display_name));
        }
      };

      const handleTypingStop = ({ conversation_id, display_name }) => {
        if (conversation_id === activeChat.id) {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(display_name);
            return next;
          });
        }
      };

      const handleMessagesRead = ({ conversation_id }) => {
        if (conversation_id === activeChat.id) {
          setMessages((prev) =>
            prev.map((m) => ({ ...m, overallStatus: 'READ' }))
          );
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('user_typing_start', handleTypingStart);
      socket.on('user_typing_stop', handleTypingStop);
      socket.on('messages_read', handleMessagesRead);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing_start', handleTypingStart);
        socket.off('user_typing_stop', handleTypingStop);
        socket.off('messages_read', handleMessagesRead);
      };
    }
  }, [activeChat?.id, currentUser?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    const socket = getSocket();
    if (socket && activeChat) {
      socket.emit('typing_start', { conversation_id: activeChat.id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversation_id: activeChat.id });
      }, 1500);
    }
  };

  const handleSend = (mediaUrl = null, mediaType = null) => {
    if ((!inputText.trim() && !mediaUrl) || !activeChat) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', {
        conversation_id: activeChat.id,
        content: inputText.trim(),
        media_url: mediaUrl,
        media_type: mediaType,
        reply_to_id: replyTo ? replyTo.id : null,
      });

      socket.emit('typing_stop', { conversation_id: activeChat.id });
    }

    setInputText('');
    setReplyTo(null);
    setShowEmojis(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await chatsAPI.uploadFile(file);
      handleSend(res.url, res.mediaType);
    } catch (err) {
      alert(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!activeChat) {
    return (
      <div className="hidden md:flex flex-1 bg-[#111b21] flex-col items-center justify-center p-8 text-center border-b-8 border-[#00a884] chat-pattern select-none">
        <div className="max-w-md space-y-4">
          <div className="w-24 h-24 bg-[#00a884]/10 rounded-full flex items-center justify-center mx-auto text-[#00a884] border border-[#00a884]/30 shadow-xl">
            <Send className="w-12 h-12 ml-1" />
          </div>
          <h2 className="text-2xl font-bold text-[#e9edef]">WhatsApp Web</h2>
          <p className="text-xs text-[#8696a0] leading-relaxed">
            Send and receive real-time messages with end-to-end email invitation integration.
            Select a conversation on the left panel or click "User Plus" to invite a friend.
          </p>
        </div>
      </div>
    );
  }

  const typingArray = Array.from(typingUsers);
  const isPeerOnline = activeChat.type === 'direct' && activeChat.peerUser?.is_online === 1;

  return (
    <div className="flex-1 h-full bg-[#0b141a] flex flex-col relative overflow-hidden select-none">
      
      {/* Top Conversation Header */}
      <div className="h-16 bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222d34] shrink-0 z-10">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          <button
            onClick={onCloseChat}
            className="md:hidden p-1.5 hover:bg-[#2a3942] rounded-full text-[#8696a0] hover:text-[#e9edef] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img
            src={activeChat.avatar_url}
            alt={activeChat.name}
            className="w-10 h-10 rounded-full object-cover border border-[#2a3942]"
          />

          <div>
            <h3 className="text-sm font-bold text-[#e9edef]">{activeChat.name}</h3>
            <p className="text-xs text-[#00a884] font-medium">
              {typingArray.length > 0 ? (
                <span className="animate-pulse">
                  {activeChat.type === 'group'
                    ? `${typingArray.join(', ')} is typing...`
                    : 'typing...'}
                </span>
              ) : activeChat.type === 'direct' ? (
                isPeerOnline ? 'online' : 'offline'
              ) : (
                `${activeChat.members?.length || 0} members`
              )}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2 text-[#8696a0]">
          <button onClick={onCloseChat} className="p-2 hover:bg-[#2a3942] rounded-full hover:text-[#e9edef] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-pattern">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUser?.id;
          const showSenderName = activeChat.type === 'group' && !isMe;

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`relative max-w-[80%] md:max-w-[65%] rounded-xl p-3 shadow-md border ${
                  isMe
                    ? 'bg-[#005c4b] border-[#005c4b] text-[#e9edef] rounded-tr-none'
                    : 'bg-[#202c33] border-[#2a3942] text-[#e9edef] rounded-tl-none'
                }`}
              >
                {/* Group Sender Name */}
                {showSenderName && (
                  <p className="text-[11px] font-bold text-[#00a884] mb-1">
                    {msg.sender_name}
                  </p>
                )}

                {/* Media Image */}
                {msg.media_url && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-[#2a3942]/60 cursor-pointer">
                    <img
                      src={msg.media_url}
                      alt="Attachment"
                      className="max-h-60 w-full object-cover hover:scale-102 transition"
                      onClick={() => setSelectedImage(msg.media_url)}
                    />
                  </div>
                )}

                {/* Content */}
                {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                {/* Timestamp & Ticks */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696a0] mt-1">
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {isMe && (
                    <span>
                      {msg.overallStatus === 'READ' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      ) : msg.overallStatus === 'DELIVERED' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-[#8696a0]" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker Popover */}
      {showEmojis && (
        <div className="bg-[#202c33] border-t border-[#222d34] p-3 flex flex-wrap gap-2 text-xl max-h-36 overflow-y-auto">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setInputText((prev) => prev + emoji)}
              className="hover:bg-[#2a3942] p-1.5 rounded-lg transition cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-[#222d34] shrink-0">
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className="p-2 hover:bg-[#2a3942] rounded-full text-[#8696a0] hover:text-[#00a884] transition cursor-pointer"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 hover:bg-[#2a3942] rounded-full text-[#8696a0] hover:text-[#00a884] transition cursor-pointer"
          title="Attach Image"
        >
          <Paperclip className="w-6 h-6" />
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex-1 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a message"
            className="w-full bg-[#2a3942] border border-transparent focus:border-[#00a884]/40 rounded-xl px-4 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-[#00a884] hover:bg-[#008f70] text-[#111b21] rounded-full transition disabled:opacity-30 cursor-pointer shadow-md"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>

      {/* Fullscreen Image Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={selectedImage} alt="Enlarged" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}

    </div>
  );
}
