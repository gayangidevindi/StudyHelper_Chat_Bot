'use client';

import { useState, useEffect, useRef } from 'react';

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type Difficulty = 'easy' | 'medium' | 'hard';

const LETTERS = ['A', 'B', 'C', 'D'];

type QuizViewProps = {
  notes: string;
  onComplete?: (correct: number, total: number) => void;
};

export default function QuizView({ notes, onComplete }: QuizViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const reported = useRef(false);

  const generateQuiz = async () => {
    setError('');
    setLoading(true);
    setAnswers({});
    reported.current = false;
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, difficulty }),
      });
      if (!res.ok) throw new Error('Failed to generate quiz');
      const data = await res.json();
      setQuestions(data.questions);
    } catch {
      setError('Something went wrong generating the quiz. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportQuiz = () => {
    const markdown = [
      '# Study Helper Quiz',
      '',
      `Difficulty: ${difficulty}`,
      '',
      ...questions.flatMap((question, index) => {
        const selected = answers[index];
        const selection = selected === undefined ? 'Not answered' : `${LETTERS[selected]}: ${question.options[selected]}`;
        const correctness = selected === undefined ? 'Not answered' : selected === question.correctIndex ? 'Correct' : 'Incorrect';
        return [
          `## Question ${index + 1}`,
          '',
          question.question,
          '',
          ...question.options.map((option, optionIndex) => `- ${LETTERS[optionIndex]}. ${option}`),
          '',
          `**Selected:** ${selection}`,
          `**Result:** ${correctness}`,
          `**Correct answer:** ${LETTERS[question.correctIndex]}: ${question.options[question.correctIndex]}`,
          '',
          `**Explanation:** ${question.explanation}`,
          '',
        ];
      }),
      `## Score`,
      '',
      `${score}/${questions.length} correct (${Math.round((score / questions.length) * 100)}%)`,
      '',
    ].join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'study-helper-quiz.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    if (answers[qIndex] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const score = questions.length
    ? Object.entries(answers).filter(([qi, oi]) => questions[Number(qi)].correctIndex === oi).length
    : 0;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    if (
      questions.length > 0 &&
      answeredCount === questions.length &&
      !reported.current &&
      onComplete
    ) {
      onComplete(score, questions.length);
      reported.current = true;
    }
  }, [answeredCount, questions.length, onComplete, score]);

  return (
    <div className="quiz-view">
      <div className="difficulty-control" aria-label="Quiz difficulty">
        <span className="field-label">Difficulty</span>
        <div className="difficulty-options">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
            <button key={level} type="button" className={`difficulty-option ${difficulty === level ? 'active' : ''}`} onClick={() => setDifficulty(level)} aria-pressed={difficulty === level}>{level}</button>
          ))}
        </div>
      </div>
      <button
        onClick={generateQuiz}
        disabled={loading || !notes.trim()}
        className="primary-button"
      >
        {loading ? 'Writing questions...' : questions.length ? 'Generate a new quiz' : 'Generate quiz from notes'}
      </button>

      {error && <p className="error-message" role="alert">{error}</p>}

      {questions.length > 0 && (
        <div className="quiz-content">
          <div className="quiz-toolbar">
            <span className="quiz-progress-label">{answeredCount} of {questions.length} answered</span>
            <div className="progress-track" style={{ flex: 1, maxWidth: 180 }}><div className="progress-fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
            <span className="quiz-progress-label">{answeredCount === questions.length ? `${score}/${questions.length} correct` : 'Keep going'}</span>
            <button type="button" className="secondary-button export-button" onClick={exportQuiz}>Export</button>
          </div>

          {answeredCount === questions.length && (
            <div className="score-banner"><div><strong>Quiz complete</strong><span>You made it through all five questions.</span></div><div className="score-value">{Math.round((score / questions.length) * 100)}%</div></div>
          )}

          <div>
            {questions.map((q, qIndex) => {
              const selected = answers[qIndex];
              const answered = selected !== undefined;

              return (
                <div key={qIndex} className="quiz-card">
                  <p className="question-heading"><span className="question-number">Q{qIndex + 1}</span><span>{q.question}</span></p>

                  <div className="answer-options">
                    {q.options.map((opt, oIndex) => {
                      let stateClasses = '';
                      if (answered) {
                        if (oIndex === q.correctIndex) {
                          stateClasses = 'correct';
                        } else if (oIndex === selected) {
                          stateClasses = 'incorrect';
                        } else {
                          stateClasses = 'muted';
                        }
                      }
                      return (
                        <button
                          key={oIndex}
                          onClick={() => selectAnswer(qIndex, oIndex)}
                          disabled={answered}
                          className={`answer-option ${stateClasses}`}
                        >
                          <span className="answer-letter">{LETTERS[oIndex]}</span><span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {answered && (
                    <p className="explanation">
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}