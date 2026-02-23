function LoadingButton({ loading, children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="ai-grade-button"
    >
      {loading && <span className="btn-spinner" />}
      {loading ? "Generating…" : children}
    </button>
  );
}

export default LoadingButton;