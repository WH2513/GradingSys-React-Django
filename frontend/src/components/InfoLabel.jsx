import '../styles/InfoLabel.css';

export default function InfoLabel({ text, hint, htmlFor }) {
  return (
    <label className="info-label" htmlFor={htmlFor}>
      {text}
      <span className="info-icon">!</span>
      <span className="tooltip">{hint}</span>
    </label>
  );
}