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
    <div className="quiz-view min-w-0 w-full">
      <div className="difficulty-control !flex-row !items-center gap-2 sm:gap-3" aria-label="Quiz difficulty">
        <span className="field-label shrink-0 text-sm sm:text-base">Difficulty</span>
        <div className="difficulty-options !flex min-w-0 flex-1 gap-1.5 sm:gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
            <button key={level} type="button" className={`difficulty-option !min-h-11 !min-w-0 !flex-1 !px-2 py-2 text-sm sm:!px-3 sm:text-base ${difficulty === level ? 'active' : ''}`} onClick={() => setDifficulty(level)} aria-pressed={difficulty === level}>{level}</button>
          ))}
        </div>
      </div>
      <button
        onClick={generateQuiz}
        disabled={loading || !notes.trim()}
        className="primary-button min-h-11 w-full px-4 text-sm sm:w-auto"
      >
        {loading ? 'Writing questions...' : questions.length ? 'Generate a new quiz' : 'Generate quiz from notes'}
      </button>

      {error && <p className="error-message" role="alert">{error}</p>}

      {questions.length > 0 && (
        <div className="quiz-content min-w-0">
          <div className="quiz-toolbar flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center justify-between gap-3 sm:contents">
              <span className="quiz-progress-label text-xs sm:text-sm">{answeredCount} of {questions.length} answered</span>
              <span className="quiz-progress-label text-right text-xs sm:text-sm">{answeredCount === questions.length ? `${score}/${questions.length} correct` : 'Keep going'}</span>
            </div>
            <div className="progress-track w-full max-w-none sm:max-w-45" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
            <button type="button" className="secondary-button export-button min-h-11 w-full sm:w-auto" onClick={exportQuiz}>Export</button>
          </div>

          {answeredCount === questions.length && (
            <div className="score-banner flex-col items-start gap-3 sm:flex-row sm:items-center"><div className="min-w-0"><strong className="text-xl sm:text-2xl">Quiz complete</strong><span className="block break-words">You made it through all five questions.</span></div><div className="score-value text-2xl sm:text-3xl">{Math.round((score / questions.length) * 100)}%</div></div>
          )}

          <div>
            {questions.map((q, qIndex) => {
              const selected = answers[qIndex];
              const answered = selected !== undefined;

              return (
                <div key={qIndex} className="quiz-card min-w-0 p-4 sm:p-5">
                  <p className="question-heading min-w-0 text-base sm:text-xl"><span className="question-number shrink-0">Q{qIndex + 1}</span><span className="min-w-0 break-words [overflow-wrap:anywhere]">{q.question}</span></p>

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
                          className={`answer-option min-h-11 w-full px-3 py-3 text-sm sm:text-base ${stateClasses}`}
                        >
                          <span className="answer-letter shrink-0">{LETTERS[oIndex]}</span><span className="min-w-0 break-words [overflow-wrap:anywhere]">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {answered && (
                    <p className="explanation break-words [overflow-wrap:anywhere] text-sm">
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