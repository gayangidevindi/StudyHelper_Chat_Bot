'use client';

import { useState } from 'react';

type Grade = {
  correct: boolean;
  score: number;
  feedback: string;
};

export default function ShortAnswer({ notes }: { notes: string }) {
  const [question, setQuestion] = useState('');
  const [referenceAnswer, setReferenceAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingGrade, setLoadingGrade] = useState(false);
  const [error, setError] = useState('');

  const exportAnswer = () => {
    const markdown = [
      '# Study Helper Short Answer',
      '',
      '## Question',
      '',
      question,
      '',
      '## Reference Answer',
      '',
      referenceAnswer || 'Not available',
      '',
      '## Your Answer',
      '',
      userAnswer || 'Not answered',
      '',
      ...(grade ? ['## Grade', '', `Score: ${grade.score}/100`, `Result: ${grade.correct ? 'Correct' : 'Needs improvement'}`, '', grade.feedback, ''] : []),
    ].join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'study-helper-short-answer.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateQuestion = async () => {
    setError('');
    setLoadingQuestion(true);
    setQuestion('');
    setReferenceAnswer('');
    setUserAnswer('');
    setGrade(null);
    try {
      const res = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to generate question');
      const data = await res.json();
      setQuestion(data.question);
      setReferenceAnswer(data.referenceAnswer);
    } catch {
      setError('Could not generate a question. Try again.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setError('');
    setLoadingGrade(true);
    setGrade(null);
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, correctAnswer: referenceAnswer, userAnswer }),
      });
      if (!res.ok) throw new Error('Failed to grade answer');
      const data = await res.json();
      setGrade(data);
    } catch {
      setError('Could not grade your answer. Try again.');
    } finally {
      setLoadingGrade(false);
    }
  };

  return (
    <div className="short-answer min-w-0">
      <button
        onClick={generateQuestion}
        disabled={loadingQuestion || !notes.trim()}
        className="primary-button min-h-11 w-full px-4 text-sm sm:w-auto"
      >
        {loadingQuestion ? 'Writing a question...' : question ? 'Try another question' : 'Generate short-answer question'}
      </button>

      {error && <p className="error-message" role="alert">{error}</p>}

      {question && (
        <div className="answer-flow grid gap-4 sm:gap-5" style={{ marginTop: 24 }}>
          <div className="flow-step min-w-0"><p className="flow-label">Your question</p><div className="question-card min-w-0 p-4 sm:p-5"><p className="wrap-break-word text-base sm:text-xl">{question}</p></div></div>
          <div className="flow-step min-w-0"><p className="flow-label">Your answer</p><textarea aria-label="Your short answer" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Take a moment to explain it in your own words..." rows={5} disabled={!!grade} className="answer-textarea min-h-32 w-full p-3 text-sm sm:min-h-36 sm:p-4 sm:text-base wrap-anywhere" />{!grade && <button onClick={submitAnswer} disabled={loadingGrade || !userAnswer.trim()} className="primary-button mt-2 min-h-11 w-full px-4 text-sm sm:w-auto">{loadingGrade ? 'Grading your answer...' : 'Submit answer'}</button>}</div>
          {grade && <div className="flow-step min-w-0"><p className="flow-label">Tutor feedback</p><div className="feedback-card flex-col gap-4 sm:flex-row sm:gap-5"><div className="score-ring shrink-0" aria-label={`Score ${grade.score} out of 100`}>{grade.score}</div><div className="min-w-0"><p className="feedback-status">{grade.correct ? 'Correct understanding' : 'Keep building'}</p><p className="text-sm sm:text-base wrap-anywhere">{grade.feedback}</p></div></div></div>}
          <button type="button" className="secondary-button export-button min-h-11 w-full sm:w-auto" onClick={exportAnswer}>Export</button>
        </div>
      )}
    </div>
  );
}