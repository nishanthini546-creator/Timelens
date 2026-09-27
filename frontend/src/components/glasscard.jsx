import { useRef } from "react";

function GlassCard({
  children,
  className = "",
  style = {},
  onClick,
  ...rest
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`timelens-glass-card ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

export default GlassCard;