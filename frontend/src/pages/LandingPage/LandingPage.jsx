import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import ChatPreview from "../../components/ChatPreview/ChatPreview";
import Features from "../../components/Features/Features";
import Stats from "../../components/Stats/Stats";
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-wrapper">
      <Navbar />
      
      <main className="landing-main">
        <section className="top-section">
          <Hero />
          <div className="preview-container">
            <ChatPreview />
          </div>
        </section>

        <section className="middle-section">
          <Features />
          <Stats />
        </section>

        <section className="bottom-section">
          <div className="bottom-inner">
             <WhyChooseUs />
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2026 MedAssist AI. All rights reserved.</p>
        <p>Your premium personal nurse assistant.</p>
      </footer>
    </div>
  );
}

export default LandingPage;