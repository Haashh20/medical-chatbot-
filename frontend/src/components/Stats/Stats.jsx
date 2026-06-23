import "./Stats.css";

function Stats() {
  const stats = [
    { value: "99.9%", label: "Uptime Reliability" },
    { value: "24/7", label: "Instant Availability" },
    { value: "100k+", label: "Medical Queries Resolved" }
  ];

  return (
    <div className="stats-container">
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <h2 className="stat-value">{stat.value}</h2>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stats;