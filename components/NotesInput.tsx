'use client';

type NotesInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function NotesInput({ value, onChange }: NotesInputProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="notes-editor min-w-0 w-full">
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
        className="notes-textarea !min-h-[150px] w-full !resize-none !p-4 text-sm sm:!min-h-[190px] sm:text-base"
      />
      <p className="notes-hint">More context helps your tutor create more useful practice.</p>
    </div>
  );
}