export default function StatusChip({ status }) {
  return (
    <span className={`status-chip status-chip--${status}`}>
      <span className="status-chip-dot" />
      {status}
    </span>
  );
}
