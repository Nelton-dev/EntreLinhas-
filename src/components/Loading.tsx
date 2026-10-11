export function Loading({ label = 'A preparar a história…' }: { label?: string }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__line" />
      <p>{label}</p>
    </div>
  );
}
