'use client';

import { useState } from 'react';
import ExplainChat from '@/components/ExplainChat';
import QuizView from '@/components/QuizView';

export default function StudyPage() {
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'explain' | 'quiz'>('explain');

  return (
    <div className="min-h-screen bg-[#16241F] text-[#F2EFE4]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-8">
          <p className="font-mono text-xs tracking-[0.2em] text-[#8FA595] uppercase mb-2">
            Study Helper
          </p>
          <h1 className="font-(family-name:--font-display) text-4xl font-semibold">
            What are we studying today?
          </h1>
          <div className="flex gap-1.5 mt-5">
            <span className="h-1.5 w-8 rounded-full bg-[#E8C468]" />
            <span className="h-1.5 w-8 rounded-full bg-[#E4735E]" />
            <span className="h-1.5 w-8 rounded-full bg-[#7FA8C9]" />
          </div>
        </header>

        <div className="flex gap-6 border-b border-[#2C4A40] mb-8">
          <button
            onClick={() => setMode('explain')}
            className={`pb-3 font-(family-name:--font-display) text-lg relative ${
              mode === 'explain' ? 'text-[#F2EFE4]' : 'text-[#6E8079] hover:text-[#B9C4B9]'
            }`}
          >
            Ask &amp; Explain
            {mode === 'explain' && (
              <span
                className="absolute left-0 -bottom-px w-full h-0.5 bg-[#E8C468]"
                style={{ maskImage: 'repeating-linear-gradient(90deg, black 0 6px, transparent 6px 10px)' }}
              />
            )}
          </button>
          <button
            onClick={() => setMode('quiz')}
            className={`pb-3 font-(family-name:--font-display) text-lg relative ${
              mode === 'quiz' ? 'text-[#F2EFE4]' : 'text-[#6E8079] hover:text-[#B9C4B9]'
            }`}
          >
            Quiz Me
            {mode === 'quiz' && (
              <span
                className="absolute left-0 -bottom-px w-full h-0.5 bg-[#E8C468]"
                style={{ maskImage: 'repeating-linear-gradient(90deg, black 0 6px, transparent 6px 10px)' }}
              />
            )}
          </button>
        </div>

        {mode === 'explain' && <ExplainChat />}

        {mode === 'quiz' && (
          <div>
            <label className="block font-mono text-xs tracking-wider uppercase text-[#8FA595] mb-2">
              Your notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your study notes here…"
              rows={6}
              className="w-full bg-[#1D3229] border border-[#2C4A40] rounded-md px-4 py-3 text-sm placeholder:text-[#5C6E66] focus:outline-none focus:ring-2 focus:ring-[#E8C468] focus:ring-offset-2 focus:ring-offset-[#16241F] resize-y"
            />
            <QuizView notes={notes} />
          </div>
        )}
      </div>
    </div>
  );
}