function ActivityTag({
  name,
  duration,
  type = "productive",
  className = "",
}) {
  return (
    <div
      className={`activity-tag ${
        type === "recreational"
          ? "activity-recreational"
          : "activity-productive"
      } ${className}`}
    >
      <span className="activity-dot" />

      <div className="activity-info">
        <strong>{name}</strong>
        <span>{duration}</span>
      </div>
    </div>
  );
}

export default ActivityTag;