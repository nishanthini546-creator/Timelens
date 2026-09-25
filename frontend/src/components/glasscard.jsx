function GlassCard({
  children,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`timelens-glass-card ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default GlassCard;