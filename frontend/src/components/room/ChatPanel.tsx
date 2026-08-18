'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/store/roomStore';
import { Send, MessageSquare } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUserId?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  currentUserId,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 p-4">
        <MessageSquare className="h-4 w-4 text-teal-400" />
        <h3 className="text-sm font-bold">Chat de la Sesión</h3>
        <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
          {messages.length}
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-8">
            No hay mensajes aún. ¡Haz una pregunta al emprendedor!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-bold text-slate-300">
                    {msg.senderName}
                  </span>
                  <span className="rounded bg-slate-800 px-1 py-0.2 text-[9px] text-teal-400 uppercase">
                    {msg.senderRole}
                  </span>
                </div>
                <div
                  className={`rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed ${
                    isMe
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-xl bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};
