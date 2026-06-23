import "./WhyChooseUs.css";

function WhyChooseUs() {
  const reasons = [
    {
      title: "Doctor-Verified Information",
      desc: "Our AI model is trained on vast amounts of verified medical literature to ensure high accuracy."
    },
    {
      title: "Empathetic Approach",
      desc: "Designed to be comforting and reduce anxiety while delivering factual medical information."
    },
    {
      title: "Seamless Integration",
      desc: "Access your chats and medical summaries across any device, anytime."
    }
  ];

  return (
    <div className="why-container" id="how-it-works">
      <div className="why-header">
        <h2>Why Choose MedAssist AI?</h2>
      </div>
      
      <div className="why-grid">
        {reasons.map((reason, idx) => (
          <div key={idx} className="why-card">
            <h3 className="why-title">{reason.title}</h3>
            <p className="why-desc">{reason.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WhyChooseUs;