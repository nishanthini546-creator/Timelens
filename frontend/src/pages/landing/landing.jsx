import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Button from "../../components/button";
import GlassCard from "../../components/glasscard";
import SectionTitle from "../../components/sectiontitle";
import ActivityTag from "../../components/activitytag";

function Landing() {
  const navigate = useNavigate();

  return (
    <main className="timelens-page">
      <div className="time-grid"></div>

      <div
        className="glow-lime"
        style={{ top: "8%", left: "-120px" }}
      ></div>

      <div
        className="glow-coral"
        style={{ top: "35%", right: "-100px" }}
      ></div>

      {/* Navigation */}
      <nav className="time-nav">
        <a href="/" className="logo-mark">
          <span className="logo-symbol">T</span>
          <span>TimeLens</span>
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#insights">Insights</a>
        </div>

        <Button onClick={() => navigate("/auth")}>
          Get Started
        </Button>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-copy">
          <motion.div
            className="hero-label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>●</span>
            Personal digital time analyzer
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Your time
            <br />
            tells a <span className="accent">story.</span>
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            TimeLens helps you understand where your digital time
            goes, what you actually accomplished, and whether your
            day supported the goals you planned.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Button onClick={() => navigate("/auth")}>
              Start tracking →
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              See how it works
            </Button>
          </motion.div>
        </div>

        {/* Time Orbit */}
        <motion.div
          className="time-orbit"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="orbit-ring"></div>
          <div className="orbit-ring"></div>
          <div className="orbit-ring"></div>

          <div className="orbit-dot one"></div>
          <div className="orbit-dot two"></div>
          <div className="orbit-dot three"></div>

          <div className="time-core">
            <span className="time-core-label">
              Digital time
            </span>

            <strong className="time-core-number">
              07:24
            </strong>

            <span className="time-core-label">
              today
            </span>
          </div>

          <ActivityTag
            name="Coding"
            duration="1h 36m"
            className="activity-one"
          />

          <ActivityTag
            name="Social"
            duration="42 min"
            type="recreational"
            className="activity-two"
          />

          <ActivityTag
            name="Study"
            duration="2h 18m"
            className="activity-three"
          />
        </motion.div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          position: "relative",
          zIndex: 5,
          width: "min(1180px, calc(100% - 40px))",
          margin: "0 auto",
          paddingBottom: "120px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 0.6fr",
            gap: "16px",
          }}
        >
          <GlassCard>
            <SectionTitle
              label="Your day, visualized"
              title={
                <>
                  See the difference between{" "}
                  <span style={{ color: "#c2ff4b" }}>
                    planned
                  </span>{" "}
                  and{" "}
                  <span style={{ color: "#ff6f61" }}>
                    actual.
                  </span>
                </>
              }
            />
          </GlassCard>

          <div
            style={{
              padding: "32px",
              borderRadius: "24px",
              background: "#c2ff4b",
              color: "#11110f",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Goal alignment
            </span>

            <div
              style={{
                marginTop: "35px",
                fontSize: "4rem",
                fontWeight: 850,
                letterSpacing: "-0.07em",
              }}
            >
              82%
            </div>

            <p>
              of your planned activities were completed today.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;