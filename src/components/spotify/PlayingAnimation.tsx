export default function PlayingAnimation() {
  const delays = ["0s", "-2.2s", "-3.7s"];
  return (
    <div
      className="flex justify-between items-end"
      style={{ width: 13, height: 13 }}
    >
      {delays.map((delay, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 3,
            height: "100%",
            backgroundColor: "#1ED760",
            borderRadius: 3,
            transformOrigin: "bottom",
            animation: "playing-bar 2.2s ease infinite alternate",
            animationDelay: delay,
          }}
        />
      ))}
    </div>
  );
}
