'use client';

type NotesInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function NotesInput({ value, onChange }: NotesInputProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="notes-editor">
      <div className="notes-label-row">
        <label className="field-label" htmlFor="study-notes">Your study notes</label>
        <span className="field-meta" aria-live="polite">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
      </div>
      <textarea
        id="study-notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a lecture, chapter summary, or your own notes here..."
        rows={8}
        className="notes-textarea"
      />
      <p className="notes-hint">More context helps your tutor create more useful practice.</p>
    </div>
  );
}