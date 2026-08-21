'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles } from 'lucide-react';

export default function ExplainChat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div>
      <div className="chat-log" aria-live="polite">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div>
              <div className="empty-icon" aria-hidden="true"><Sparkles size={22} strokeWidth={1.8} /></div>
              <h3 className="empty-title">Your tutor is ready.</h3>
              <p className="empty-copy">Ask about a concept, request an example, or paste your notes and ask me to explain them.</p>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`message-row ${m.role === 'user' ? 'user' : ''}`}>
            {m.role !== 'user' && <div className="message-avatar" aria-hidden="true">S</div>}
            <div className="message-bubble">
              <p className="message-label">{m.role === 'user' ? 'You' : 'Study Helper'}</p>
              {m.parts.map((part, i) =>
                part.type === 'text' ? (
                  <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                ) : null
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="thinking" role="status"><span>Thinking</span><span className="thinking-dots" aria-hidden="true"><i /><i /><i /></span></div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-composer">
        <input
          aria-label="Ask your study tutor"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or explain a concept..."
          className="chat-input"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="primary-button chat-send"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}