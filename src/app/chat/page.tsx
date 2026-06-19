"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, MessageCircle, CornerDownRight, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  reply_to_id: string | null;
  created_at: string;
  profile?: { pseudo: string };
  reply_to?: { content: string; profile?: { pseudo: string } };
}

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

const EMOJIS = ["👍", "⚽", "🔥", "😂", "😮", "❤️"];

export default function ChatPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [openEmojiFor, setOpenEmojiFor] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*, profile:profiles(pseudo), reply_to:reply_to_id(content, profile:profiles(pseudo))")
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages((data ?? []) as any);
    setLoading(false);
  };

  const fetchReactions = async () => {
    const { data } = await supabase.from("chat_reactions").select("*");
    setReactions((data ?? []) as Reaction[]);
  };

  useEffect(() => {
    fetchMessages();
    fetchReactions();

    const channel = supabase
      .channel("chat-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => {
        fetchMessages();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_reactions" }, () => {
        fetchReactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const content = input.trim();
    setInput("");
    const replyId = replyTo?.id ?? null;
    setReplyTo(null);

    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      content,
      reply_to_id: replyId,
    });

    if (error) {
      toast.error("Erreur : " + error.message);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    const existing = reactions.find((r) => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji);
    if (existing) {
      await supabase.from("chat_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("chat_reactions").insert({ message_id: messageId, user_id: user.id, emoji });
    }
    setOpenEmojiFor(null);
  };

  const groupedReactions = (messageId: string) => {
    const msgReactions = reactions.filter((r) => r.message_id === messageId);
    const groups: Record<string, { count: number; reacted: boolean }> = {};
    msgReactions.forEach((r) => {
      if (!groups[r.emoji]) groups[r.emoji] = { count: 0, reacted: false };
      groups[r.emoji].count += 1;
      if (r.user_id === user?.id) groups[r.emoji].reacted = true;
    });
    return groups;
  };

  if (!user) {
    return (
      <div className="card text-center py-12">
        <MessageCircle size={32} className="mx-auto mb-3 text-gray-500" />
        <p className="text-gray-400 mb-3">Connecte-toi pour accéder au chat</p>
        <a href="/auth/login" className="btn-primary inline-block">Se connecter</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={24} className="text-pitch-400" />
        <h1 className="font-display text-3xl font-bold text-white tracking-wide">CHAT</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Aucun message. Sois le premier à écrire !</div>
        ) : (
          messages.map((m) => {
            const isMine = m.user_id === user.id;
            const groups = groupedReactions(m.id);
            return (
              <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                {m.reply_to && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5 px-1">
                    <CornerDownRight size={11} />
                    <span className="truncate max-w-[200px]">
                      {m.reply_to.profile?.pseudo}: {m.reply_to.content}
                    </span>
                  </div>
                )}
                <div className={`group relative max-w-[80%] ${isMine ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 ${
                      isMine ? "bg-pitch-600 text-white" : "bg-surface-700 text-gray-200"
                    }`}
                  >
                    {!isMine && (
                      <div className="text-xs font-semibold text-pitch-400 mb-0.5">{m.profile?.pseudo}</div>
                    )}
                    <div className="text-sm break-words">{m.content}</div>
                  </div>

                  <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] text-gray-600">
                      {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })}
                    </span>
                    <button
                      onClick={() => setReplyTo(m)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300"
                      title="Répondre"
                    >
                      <CornerDownRight size={12} />
                    </button>
                    <button
                      onClick={() => setOpenEmojiFor(openEmojiFor === m.id ? null : m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300"
                      title="Réagir"
                    >
                      <Smile size={12} />
                    </button>
                  </div>

                  {openEmojiFor === m.id && (
                    <div className="absolute z-10 bg-surface-600 border border-surface-500 rounded-full px-2 py-1 flex gap-1 shadow-lg -top-9 left-0">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(m.id, emoji)}
                          className="hover:scale-125 transition-transform text-sm"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {Object.keys(groups).length > 0 && (
                    <div className={`flex gap-1 mt-1 flex-wrap ${isMine ? "justify-end" : "justify-start"}`}>
                      {Object.entries(groups).map(([emoji, { count, reacted }]) => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(m.id, emoji)}
                          className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                            reacted ? "bg-pitch-700/40 border-pitch-600 text-pitch-300" : "bg-surface-700 border-surface-600 text-gray-400"
                          }`}
                        >
                          {emoji} {count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="flex items-center justify-between bg-surface-700 rounded-t-lg px-3 py-2 text-xs text-gray-400 border-b border-surface-600">
          <span className="truncate">
            Réponse à <strong className="text-gray-300">{replyTo.profile?.pseudo}</strong>: {replyTo.content}
          </span>
          <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-gray-300 shrink-0 ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-surface-800 border border-surface-600 rounded-lg p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Écris un message..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600 px-2"
        />
        <button onClick={handleSend} disabled={!input.trim()} className="btn-primary p-2 disabled:opacity-30">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}