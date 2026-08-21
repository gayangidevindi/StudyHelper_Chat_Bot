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
    <div className="short-answer">
      <button
        onClick={generateQuestion}
        disabled={loadingQuestion || !notes.trim()}
        className="primary-button"
      >
        {loadingQuestion ? 'Writing a question...' : question ? 'Try another question' : 'Generate short-answer question'}
      </button>

      {error && <p className="error-message" role="alert">{error}</p>}

      {question && (
        <div className="answer-flow" style={{ marginTop: 24 }}>
          <div className="flow-step"><p className="flow-label">Your question</p><div className="question-card"><p>{question}</p></div></div>
          <div className="flow-step"><p className="flow-label">Your answer</p><textarea aria-label="Your short answer" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Take a moment to explain it in your own words..." rows={5} disabled={!!grade} className="answer-textarea" />{!grade && <button onClick={submitAnswer} disabled={loadingGrade || !userAnswer.trim()} className="primary-button" style={{ marginTop: 10 }}>{loadingGrade ? 'Grading your answer...' : 'Submit answer'}</button>}</div>
          {grade && <div className="flow-step"><p className="flow-label">Tutor feedback</p><div className="feedback-card"><div className="score-ring" aria-label={`Score ${grade.score} out of 100`}>{grade.score}</div><div><p className="feedback-status">{grade.correct ? 'Correct understanding' : 'Keep building'}</p><p>{grade.feedback}</p></div></div></div>}
        </div>
      )}
    </div>
  );
}