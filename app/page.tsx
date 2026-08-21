'use client';

import type { UIMessage } from 'ai';
import { useEffect, useState, useSyncExternalStore } from 'react';
import ExplainChat from '@/components/ExplainChat';
import NotesInput from '@/components/NotesInput';
import QuizView from '@/components/QuizView';
import ShortAnswer from '@/components/ShortAnswer';
import ProgressTracker, { ProgressStats } from '@/components/ProgressTracker';
import { ClipboardList, PenLine, Sparkles, type LucideIcon } from 'lucide-react';

const SESSION_KEY = 'study-helper:session';
const THEME_KEY = 'study-helper:theme';
type Theme = 'light' | 'dark';
type SessionState = { notes: string; stats: ProgressStats; messages: UIMessage[]; theme: Theme };

const defaultStats: ProgressStats = { quizzesTaken: 0, questionsAnswered: 0, correctAnswers: 0 };

function readSession(): SessionState {
  const systemTheme: Theme = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  if (typeof window === 'undefined') return { notes: '', stats: defaultStats, messages: [], theme: systemTheme };
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const saved = raw ? JSON.parse(raw) as SessionState : null;
    const storedTheme = localStorage.getItem(THEME_KEY);
    const preferredTheme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme;
    return saved ? {
      notes: saved.notes ?? '',
      stats: saved.stats ?? defaultStats,
      messages: saved.messages ?? [],
      theme: preferredTheme,
    } : { notes: '', stats: defaultStats, messages: [], theme: preferredTheme };
  } catch {
    return { notes: '', stats: defaultStats, messages: [], theme: systemTheme };
  }
}

export default function StudyPage() {
  const [initialSession] = useState(readSession);
  const [notes, setNotes] = useState(initialSession.notes);
  const [mode, setMode] = useState<'explain' | 'quiz' | 'shortanswer'>('explain');
  const [stats, setStats] = useState<ProgressStats>({
    ...initialSession.stats,
  });
  const [chatMessages, setChatMessages] = useState<UIMessage[]>(initialSession.messages);
  const [theme, setTheme] = useState<Theme>(initialSession.theme ?? 'dark');
  const [resetKey, setResetKey] = useState(0);
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ notes, stats, messages: chatMessages }));
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        // Storage may be unavailable or full; the in-memory session still works.
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [chatMessages, hydrated, notes, stats, theme]);

  if (!hydrated) return null;

  const handleQuizComplete = (correct: number, total: number) => {
    setStats((prev) => ({
      quizzesTaken: prev.quizzesTaken + 1,
      questionsAnswered: prev.questionsAnswered + total,
      correctAnswers: prev.correctAnswers + correct,
    }));
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Continue resetting the in-memory session if storage is unavailable.
    }
    setNotes('');
    setStats({ quizzesTaken: 0, questionsAnswered: 0, correctAnswers: 0 });
    setChatMessages([]);
    setResetKey((current) => current + 1);
  };

  const tabs: { key: typeof mode; label: string }[] = [
    { key: 'explain', label: 'Ask & Explain' },
    { key: 'quiz', label: 'Quiz Me' },
    { key: 'shortanswer', label: 'Short Answer' },
  ];

  const tabDetails: Record<typeof mode, { icon: LucideIcon; copy: string }> = {
    explain: { icon: Sparkles, copy: 'Learn with a tutor' },
    quiz: { icon: ClipboardList, copy: 'Test your recall' },
    shortanswer: { icon: PenLine, copy: 'Practice deeply' },
  } as const;

  return (
    <div className="app-shell">
      <nav className="app-nav" aria-label="Application navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">S</div>
          <div><span className="brand-name">Study Helper</span><span className="brand-caption">Your active learning desk</span></div>
        </div>
        <div className="nav-actions">
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5 8.5 8.5 0 1 0 20.5 14.7Z" /></svg>}
          </button>
          <div className="nav-status"><i className="status-dot" aria-hidden="true" /><span>AI tutor online</span></div>
        </div>
      </nav>

      <main className="dashboard">
        <header className="hero">
          <div>
            <p className="eyebrow">Good to see you · Focus mode</p>
            <h1>Make your next<br />study session count.</h1>
            <div className="hero-accent" aria-hidden="true"><span /><span /><span /></div>
          </div>
          <p className="hero-copy">Turn notes into understanding with a patient AI tutor, useful practice, and feedback that keeps you moving.</p>
        </header>

        <div className="progress-actions"><ProgressTracker stats={stats} /><button type="button" className="secondary-button clear-session" onClick={clearSession}>Clear session</button></div>

        <div className="mode-tabs !flex !grid-cols-none gap-2 !overflow-x-auto !overflow-y-hidden pb-1 sm:!grid sm:!overflow-visible" role="tablist" aria-label="Learning modes">
          {tabs.map((tab) => {
            const Icon = tabDetails[tab.key].icon;

            return (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                role="tab"
                aria-selected={mode === tab.key}
                className={`mode-tab !min-w-[205px] !shrink-0 !px-3 !py-3 sm:!min-w-0 sm:!px-[18px] sm:!py-4 ${mode === tab.key ? 'active' : ''}`}
              >
                <span className="mode-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
                <span className="min-w-0"><span className="mode-tab-title !text-base sm:!text-lg">{tab.label}</span><span className="mode-tab-copy !text-xs sm:!text-[11px]">{tabDetails[tab.key].copy}</span></span>
              </button>
            );
          })}
        </div>

        <section className={`workspace single ${mode === 'explain' ? '!block' : '!hidden'}`} role="tabpanel" aria-hidden={mode !== 'explain'}>
            <div className="panel">
              <div className="panel-header"><div><p className="panel-kicker">01 / Understand</p><h2 className="panel-title">Ask your tutor anything.</h2><p className="panel-description">Untangle a tricky idea, ask for an example, or paste a concept you want explained simply.</p></div><span className="mode-icon" aria-hidden="true"><Sparkles size={18} strokeWidth={1.8} /></span></div>
              <div className="panel-body"><ExplainChat key={resetKey} initialMessages={chatMessages} onMessagesChange={setChatMessages} /></div>
            </div>
        </section>

        <section className={`workspace gap-4 ${mode === 'quiz' ? '!grid !grid-cols-1 md:!grid-cols-[minmax(0,1.4fr)_minmax(280px,.8fr)]' : '!hidden'}`} role="tabpanel" aria-hidden={mode !== 'quiz'}>
            <div className="panel"><div className="panel-header"><div><p className="panel-kicker">02 / Recall</p><h2 className="panel-title">Build a quiz from your notes.</h2><p className="panel-description">Practice retrieval with five focused questions, then see why each answer is right.</p></div></div><div className="panel-body"><NotesInput value={notes} onChange={setNotes} /><QuizView key={resetKey} notes={notes} onComplete={handleQuizComplete} /></div></div>
            <aside className="tip-card"><span className="tip-label">A small study tip</span><h2>Recall beats rereading.</h2><p>Try answering from memory before checking the explanation. That little pause helps the idea stick.</p></aside>
        </section>

        <section className={`workspace gap-4 ${mode === 'shortanswer' ? '!grid !grid-cols-1 md:!grid-cols-[minmax(0,1.4fr)_minmax(280px,.8fr)]' : '!hidden'}`} role="tabpanel" aria-hidden={mode !== 'shortanswer'}>
            <div className="panel"><div className="panel-header"><div><p className="panel-kicker">03 / Explain</p><h2 className="panel-title">Put your understanding into words.</h2><p className="panel-description">Write a thoughtful answer, then get specific feedback from your AI tutor.</p></div></div><div className="panel-body"><NotesInput value={notes} onChange={setNotes} /><div style={{ marginTop: 24 }}><ShortAnswer key={resetKey} notes={notes} /></div></div></div>
            <aside className="tip-card"><span className="tip-label">A small study tip</span><h2>Clarity comes from effort.</h2><p>Do not worry about perfect wording. Start with what you know and let the feedback show you what to strengthen.</p></aside>
        </section>
      </main>
    </div>
  );
}