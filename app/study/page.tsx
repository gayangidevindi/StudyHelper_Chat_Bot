'use client';

import { useState } from 'react';
import ExplainChat from '@/components/ExplainChat';
import NotesInput from '@/components/NotesInput';
import QuizView from '@/components/QuizView';
import ShortAnswer from '@/components/ShortAnswer';
import ProgressTracker, { ProgressStats } from '@/components/ProgressTracker';
import { ClipboardList, PenLine, Sparkles, type LucideIcon } from 'lucide-react';

export default function StudyPage() {
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'explain' | 'quiz' | 'shortanswer'>('explain');
  const [stats, setStats] = useState<ProgressStats>({
    quizzesTaken: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
  });

  const handleQuizComplete = (correct: number, total: number) => {
    setStats((prev) => ({
      quizzesTaken: prev.quizzesTaken + 1,
      questionsAnswered: prev.questionsAnswered + total,
      correctAnswers: prev.correctAnswers + correct,
    }));
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
        <div className="nav-status"><i className="status-dot" aria-hidden="true" /><span>AI tutor online</span></div>
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

        <ProgressTracker stats={stats} />

        <div className="mode-tabs" role="tablist" aria-label="Learning modes">
          {tabs.map((tab) => {
            const Icon = tabDetails[tab.key].icon;

            return (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                role="tab"
                aria-selected={mode === tab.key}
                className={`mode-tab ${mode === tab.key ? 'active' : ''}`}
              >
                <span className="mode-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
                <span><span className="mode-tab-title">{tab.label}</span><span className="mode-tab-copy">{tabDetails[tab.key].copy}</span></span>
              </button>
            );
          })}
        </div>

        {mode === 'explain' && (
          <section className="workspace single" role="tabpanel">
            <div className="panel">
              <div className="panel-header"><div><p className="panel-kicker">01 / Understand</p><h2 className="panel-title">Ask your tutor anything.</h2><p className="panel-description">Untangle a tricky idea, ask for an example, or paste a concept you want explained simply.</p></div><span className="mode-icon" aria-hidden="true"><Sparkles size={18} strokeWidth={1.8} /></span></div>
              <div className="panel-body"><ExplainChat /></div>
            </div>
          </section>
        )}

        {mode === 'quiz' && (
          <section className="workspace" role="tabpanel">
            <div className="panel"><div className="panel-header"><div><p className="panel-kicker">02 / Recall</p><h2 className="panel-title">Build a quiz from your notes.</h2><p className="panel-description">Practice retrieval with five focused questions, then see why each answer is right.</p></div></div><div className="panel-body"><NotesInput value={notes} onChange={setNotes} /><QuizView notes={notes} onComplete={handleQuizComplete} /></div></div>
            <aside className="tip-card"><span className="tip-label">A small study tip</span><h2>Recall beats rereading.</h2><p>Try answering from memory before checking the explanation. That little pause helps the idea stick.</p></aside>
          </section>
        )}
//full dashboard
        {mode === 'shortanswer' && (
          <section className="workspace" role="tabpanel">
            <div className="panel"><div className="panel-header"><div><p className="panel-kicker">03 / Explain</p><h2 className="panel-title">Put your understanding into words.</h2><p className="panel-description">Write a thoughtful answer, then get specific feedback from your AI tutor.</p></div></div><div className="panel-body"><NotesInput value={notes} onChange={setNotes} /><div style={{ marginTop: 24 }}><ShortAnswer notes={notes} /></div></div></div>
            <aside className="tip-card"><span className="tip-label">A small study tip</span><h2>Clarity comes from effort.</h2><p>Do not worry about perfect wording. Start with what you know and let the feedback show you what to strengthen.</p></aside>
          </section>
        )}
      </main>
    </div>
  );
}