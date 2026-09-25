function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}) {
  const className =
    variant === "primary"
      ? "btn-primary"
      : "btn-secondary";

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;