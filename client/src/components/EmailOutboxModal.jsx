import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../services/api';
import { Mail, ExternalLink, RefreshCw, X, Copy, Check } from 'lucide-react';

export default function EmailOutboxModal({ onClose }) {
  const [outbox, setOutbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchOutbox();
  }, []);

  const fetchOutbox = async () => {
    setLoading(true);
    try {
      const res = await friendsAPI.getEmailOutbox();
      setOutbox(res.outbox || []);
    } catch (err) {
      console.error('Failed to fetch outbox log:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[550px] text-[#e9edef]">
        
        {/* Header */}
        <div className="bg-[#202c33] p-4 border-b border-[#222d34] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#00a884]" />
            <h3 className="text-base font-bold">Automated Email Outbox Inspector</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOutbox}
              className="p-1.5 hover:bg-[#2a3942] rounded-full text-[#8696a0] hover:text-[#00a884] transition cursor-pointer"
              title="Refresh log"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-[#2a3942] rounded-full text-[#8696a0] hover:text-[#e9edef] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="bg-[#00a884]/10 border-b border-[#00a884]/20 px-4 py-2 text-xs text-[#00a884] flex items-center gap-2">
          <span>📧 All friend invitations dispatched via Nodemailer are logged here with live preview links.</span>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {outbox.length === 0 ? (
            <div className="text-center py-16 text-[#8696a0] space-y-2">
              <Mail className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm">No emails sent yet. Invite an unregistered Gmail address to see it here!</p>
            </div>
          ) : (
            outbox.map((mail) => (
              <div
                key={mail.id}
                className="bg-[#202c33] border border-[#2a3942] rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00a884]"></span>
                    <h4 className="text-xs font-bold text-[#e9edef]">
                      To: <span className="text-[#00a884] font-mono">{mail.receiverEmail}</span>
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#8696a0]">
                    {new Date(mail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-[#d1d7db]">
                  Sender: <strong>{mail.senderName}</strong> ({mail.senderEmail})
                </p>

                <div className="bg-[#111b21] rounded-lg p-2.5 border border-[#222d34] space-y-2 text-[11px]">
                  <p className="text-[#8696a0]">Subject: <span className="text-[#e9edef]">{mail.senderName} invited you to chat on WhatsApp Web!</span></p>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#222d34]">
                    <span className="text-[#8696a0] truncate max-w-sm font-mono">
                      {mail.registerUrl}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyUrl(mail.registerUrl, mail.id)}
                        className="bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] px-2 py-1 rounded text-[10px] text-[#e9edef] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === mail.id ? <Check className="w-3 h-3 text-[#00a884]" /> : <Copy className="w-3 h-3" />}
                        Copy Link
                      </button>

                      {mail.previewUrl && (
                        <a
                          href={mail.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#00a884] hover:bg-[#008f70] text-[#111b21] font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" /> Preview Ethereal Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
