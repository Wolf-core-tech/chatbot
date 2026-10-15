import React, { useState, useEffect } from 'react';
import { friendsAPI, chatsAPI } from '../services/api';
import confetti from 'canvas-confetti';
import {
  UserPlus,
  Users,
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Send,
  MessageSquare,
  Copy,
  ExternalLink,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';

export default function FriendsModal({ currentUser, onSelectChat, onClose }) {
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'incoming', 'outgoing', 'contacts'
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [incomingReqs, setIncomingReqs] = useState([]);
  const [outgoingReqs, setOutgoingReqs] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reqsData, friendsData] = await Promise.all([
        friendsAPI.getRequests(),
        friendsAPI.getFriendsList(),
      ]);
      setIncomingReqs(reqsData.incoming || []);
      setOutgoingReqs(reqsData.outgoing || []);
      setFriendsList(friendsData.friends || []);
    } catch (err) {
      console.error('Failed to load friends data:', err);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    setResultMessage(null);

    try {
      const res = await friendsAPI.sendRequest(emailInput.trim());
      setResultMessage({
        type: 'success',
        text: res.message,
        details: res,
      });
      setEmailInput('');
      loadData();
    } catch (err) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Failed to send invitation',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await friendsAPI.respondRequest(requestId, action);
      if (action === 'ACCEPT') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
      loadData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleStartChatWithFriend = async (friendId) => {
    try {
      const res = await chatsAPI.createDirectChat(friendId);
      onSelectChat(res.conversation_id);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to open chat');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] text-[#e9edef]">
        
        {/* Header Tabs */}
        <div className="bg-[#202c33] p-4 border-b border-[#222d34] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-lg font-bold">Contacts & Invitations</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8696a0] hover:text-[#e9edef] p-1.5 hover:bg-[#2a3942] rounded-full transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation bar */}
        <div className="flex border-b border-[#222d34] bg-[#111b21] px-4 pt-2">
          {[
            { id: 'add', label: 'Add / Invite Email', icon: UserPlus, badge: null },
            { id: 'incoming', label: 'Requests', icon: Inbox, badge: incomingReqs.length },
            { id: 'outgoing', label: 'Sent Invites', icon: Clock, badge: outgoingReqs.length },
            { id: 'contacts', label: 'My Contacts', icon: Users, badge: friendsList.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-[#00a884] text-[#00a884]'
                    : 'border-transparent text-[#8696a0] hover:text-[#e9edef]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-[#00a884] text-[#111b21]' : 'bg-[#202c33] text-[#8696a0]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* TAB 1: ADD FRIEND / EMAIL INVITE */}
          {activeTab === 'add' && (
            <div className="space-y-6 max-w-lg mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#00a884]/15 rounded-full flex items-center justify-center mx-auto text-[#00a884]">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold">Connect via Gmail / Email</h3>
                <p className="text-xs text-[#8696a0]">
                  Enter another user's Gmail address. If they are registered, a friend request will be sent. If not registered, an automated email invitation with sign-up link will be dispatched via Nodemailer!
                </p>
              </div>

              <form onSubmit={handleSendRequest} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8696a0]" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="friend@gmail.com"
                    className="w-full bg-[#202c33] border border-[#2a3942] rounded-xl pl-10 pr-4 py-3 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00a884] hover:bg-[#008f70] text-[#111b21] font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {loading ? 'Processing...' : (
                    <>
                      <Send className="w-4 h-4" /> Send Friend Request / Email Invite
                    </>
                  )}
                </button>
              </form>

              {/* Feedback Alert */}
              {resultMessage && (
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                  resultMessage.type === 'success'
                    ? 'bg-[#00a884]/10 border-[#00a884]/30 text-[#e9edef]'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  <div className="flex items-center gap-2 font-semibold">
                    {resultMessage.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-[#00a884]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span>{resultMessage.text}</span>
                  </div>

                  {resultMessage.details?.emailResult && (
                    <div className="pt-2 border-t border-[#222d34] space-y-1.5 text-[11px] text-[#8696a0]">
                      <p className="flex items-center gap-1.5 text-[#00a884]">
                        <Sparkles className="w-3.5 h-3.5" /> Automated Email Dispatched via Nodemailer
                      </p>
                      {resultMessage.details.emailResult.previewUrl && (
                        <p>
                          Nodemailer Preview Link:{' '}
                          <a
                            href={resultMessage.details.emailResult.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#53bdeb] underline font-mono flex items-center gap-1"
                          >
                            Open Ethereal Mail <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      )}
                      {resultMessage.details.emailResult.registerUrl && (
                        <p className="font-mono text-[#d1d7db] truncate">
                          Invite Link: {resultMessage.details.emailResult.registerUrl}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING FRIEND REQUESTS */}
          {activeTab === 'incoming' && (
            <div className="space-y-3">
              {incomingReqs.length === 0 ? (
                <div className="text-center py-12 text-[#8696a0] space-y-2">
                  <Inbox className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm">No pending incoming friend requests.</p>
                </div>
              ) : (
                incomingReqs.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#202c33] border border-[#2a3942] rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.sender_avatar}
                        alt={req.sender_name}
                        className="w-12 h-12 rounded-full border border-[#00a884]/30"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-[#e9edef]">{req.sender_name}</h4>
                        <p className="text-xs text-[#00a884]">{req.sender_email}</p>
                        <p className="text-[11px] text-[#8696a0] mt-0.5">{req.sender_bio}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(req.id, 'ACCEPT')}
                        className="bg-[#00a884] hover:bg-[#008f70] text-[#111b21] font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, 'DECLINE')}
                        className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-medium px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: OUTGOING REQUESTS & EMAIL INVITATIONS */}
          {activeTab === 'outgoing' && (
            <div className="space-y-3">
              {outgoingReqs.length === 0 ? (
                <div className="text-center py-12 text-[#8696a0] space-y-2">
                  <Clock className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm">No outgoing invitations sent yet.</p>
                </div>
              ) : (
                outgoingReqs.map((req) => {
                  const shareUrl = `${window.location.origin}?invite=${req.invite_code}&email=${encodeURIComponent(req.receiver_email)}`;
                  const isPending = req.status === 'PENDING';
                  const isAccepted = req.status === 'ACCEPTED';

                  return (
                    <div
                      key={req.id}
                      className="bg-[#202c33] border border-[#2a3942] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#e9edef]">
                            {req.receiver_name || req.receiver_email}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isAccepted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : req.status === 'DECLINED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <p className="text-xs text-[#8696a0] mt-1">
                          Target Gmail: <span className="text-[#d1d7db]">{req.receiver_email}</span>
                        </p>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(shareUrl, req.id)}
                            className="bg-[#111b21] hover:bg-[#2a3942] border border-[#2a3942] text-[#e9edef] px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            {copiedCode === req.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#00a884]" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#00a884]" /> Copy Link
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: MY CONTACTS LIST */}
          {activeTab === 'contacts' && (
            <div className="space-y-3">
              {friendsList.length === 0 ? (
                <div className="text-center py-12 text-[#8696a0] space-y-2">
                  <Users className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm">No active contacts yet. Add friends using their Gmail address above!</p>
                </div>
              ) : (
                friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-[#202c33] border border-[#2a3942] hover:border-[#00a884]/40 rounded-xl p-3.5 flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatar_url}
                          alt={friend.display_name}
                          className="w-11 h-11 rounded-full border border-[#2a3942]"
                        />
                        {friend.is_online === 1 && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full"></span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#e9edef]">{friend.display_name}</h4>
                        <p className="text-xs text-[#00a884]">{friend.email}</p>
                        <p className="text-[11px] text-[#8696a0] truncate max-w-xs">{friend.bio}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartChatWithFriend(friend.id)}
                      className="bg-[#00a884] hover:bg-[#008f70] text-[#111b21] font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" /> Message
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
