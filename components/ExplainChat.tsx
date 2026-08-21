'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles } from 'lucide-react';

type ExplainChatProps = {
  initialMessages?: UIMessage[];
  onMessagesChange?: (messages: UIMessage[]) => void;
};

export default function ExplainChat({ initialMessages = [], onMessagesChange }: ExplainChatProps) {
  // Capture the incoming messages ONLY on first mount (or when this component
  // remounts via a changed `key`, e.g. StudyPage's resetKey on "Clear session").
  // We intentionally ignore later changes to the `initialMessages` prop so that
  // syncing our messages back up to the parent doesn't feed a new array
  // reference back down and re-trigger this component, which caused the
  // "Maximum update depth exceeded" infinite loop.
  const [frozenInitialMessages] = useState(initialMessages);
  const { messages, sendMessage, status } = useChat({
    messages: frozenInitialMessages,
    // Batches UI updates instead of re-rendering on every streamed chunk.
    // Without this, fast/complex streamed content (e.g. Markdown tables via
    // react-markdown + remark-gfm) can trigger synchronous re-render storms
    // that React reports as "Maximum update depth exceeded". This is a known
    // AI SDK issue: https://ai-sdk.dev/docs/troubleshooting/react-maximum-update-depth-exceeded
    experimental_throttle: 50,
  });
  const [input, setInput] = useState('');

  // Extra safety net: only call onMessagesChange when the actual content of
  // messages has changed, not just its object reference.
  const lastSerialized = useRef<string>('');

  useEffect(() => {
    const serialized = JSON.stringify(messages);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

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