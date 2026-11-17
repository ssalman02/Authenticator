
export default function OTPTimer({ remaining, period = 30 }) {
  const percentage = Math.max(
    0,
    Math.min(1, remaining / period)
  );

  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);

  const color =
    remaining <= 5
      ? "#ef4444"
      : remaining <= 10
      ? "#f59e0b"
      : "#22c55e";

  return (
    <div className="timer-container">
      <svg
        className="timer-svg"
        viewBox="0 0 60 60"
      >
        <circle
          cx="30"
          cy="30"
          r={radius}
          className="timer-track"
        />

        <circle
          cx="30"
          cy="30"
          r={radius}
          className="timer-progress"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="timer-content">
        <strong>{remaining}</strong>
        <span>SEC</span>
      </div>
    </div>
  );
}
