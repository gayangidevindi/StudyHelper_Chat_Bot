'use client';

export type ProgressStats = {
  quizzesTaken: number;
  questionsAnswered: number;
  correctAnswers: number;
};

export default function ProgressTracker({ stats }: { stats: ProgressStats }) {
  const accuracy =
    stats.questionsAnswered > 0
      ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
      : null;

  return (
    <section className="progress" aria-label="Session progress">
      <div className="stat-card"><span className="stat-label">Quizzes taken</span><div className="stat-value">{stats.quizzesTaken}</div><div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(stats.quizzesTaken * 20, 100)}%` }} /></div></div>
      <div className="stat-card"><span className="stat-label">Questions answered</span><div className="stat-value">{stats.questionsAnswered}</div><div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(stats.questionsAnswered * 4, 100)}%` }} /></div></div>
      <div className="stat-card"><span className="stat-label">Session accuracy</span><div className="stat-value accent">{accuracy !== null ? `${accuracy}%` : '—'}</div><div className="progress-track"><div className="progress-fill" style={{ width: `${accuracy ?? 0}%` }} /></div></div>
    </section>
  );
}