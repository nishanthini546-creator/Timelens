import { useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import GlassCard from "../../components/glasscard";

function Profile() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("timelens_user");

  const user = savedUser
    ? JSON.parse(savedUser)
    : null;

  const logout = () => {
    localStorage.removeItem("timelens_token");
    localStorage.removeItem("timelens_user");

    navigate("/auth");
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <main className="timelens-page">

      <div className="time-grid" />

      {/* Background atmosphere */}
      <div
        className="glow-lime"
        style={{
          top: "12%",
          right: "-180px",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 5,
          minHeight: "100vh",
        }}
      >

        {/* =====================================================
            EXACT DASHBOARD HEADER
        ===================================================== */}

        <nav className="dashboard-nav">

          {/* Logo */}

          <button
            type="button"
            className="dashboard-brand"
            onClick={() => navigate("/dashboard")}
          >
            <div className="brand-mark">
              <Clock3 size={19} />
            </div>

            <span>TimeLens</span>
          </button>


          {/* Navigation */}

          <div className="dashboard-nav-links">

            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>


            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() => navigate("/plan-track")}
            >
              Plan & Track
            </button>


            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() => navigate("/calendar")}
            >
              Calendar
            </button>


            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() => navigate("/insights")}
            >
              Insights
            </button>


            <button
              type="button"
              className="dashboard-nav-link active"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>

          </div>


          {/* Logout */}

          <button
            type="button"
            className="dashboard-logout"
            onClick={logout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </nav>


        {/* =====================================================
            PROFILE CONTENT
        ===================================================== */}

        <section
          className="profile-page-content"
          style={{
            width:
              "min(1050px, calc(100% - 40px))",
            margin: "0 auto",
            padding: "45px 0 100px",
          }}
        >

          {/* Back */}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="profile-back-button"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>


          {/* Heading */}

          <div
            className="reveal"
            style={{
              marginTop: "35px",
            }}
          >

            <span className="section-label">
              YOUR ACCOUNT
            </span>

            <h1
              style={{
                marginTop: "10px",
                fontSize:
                  "clamp(2.8rem, 7vw, 5rem)",
                letterSpacing: "-0.07em",
                lineHeight: 0.95,
              }}
            >
              Your TimeLens.
            </h1>

            <p
              style={{
                marginTop: "18px",
                maxWidth: "600px",
                fontSize: "1rem",
                lineHeight: 1.7,
              }}
            >
              Your personal space for understanding how you
              spend your time and where your attention goes.
            </p>

          </div>


          {/* =====================================================
              PROFILE HERO
          ===================================================== */}

          <div
            className="profile-hero-card reveal reveal-delay-1"
            style={{
              marginTop: "35px",
            }}
          >

            <div className="profile-avatar">
              <User size={38} />
            </div>


            <div className="profile-hero-info">

              <span className="profile-small-label">
                TIME LENS MEMBER
              </span>

              <h2>
                {user.name || "TimeLens User"}
              </h2>

              <p>
                {user.email || "Your account email"}
              </p>

            </div>


            <div className="profile-hero-badge">
              <Sparkles size={16} />
              Active account
            </div>

          </div>


          {/* =====================================================
              INFORMATION + ACCOUNT
          ===================================================== */}

          <div
            className="profile-grid"
            style={{
              marginTop: "18px",
            }}
          >

            {/* Personal information */}

            <GlassCard>

              <div className="profile-card-content">

                <div className="profile-card-heading">

                  <div className="profile-icon-box">
                    <User size={19} />
                  </div>

                  <div>

                    <span className="profile-small-label">
                      PERSONAL INFORMATION
                    </span>

                    <h3>
                      Account details
                    </h3>

                  </div>

                </div>


                <div className="profile-details">

                  <ProfileRow
                    icon={<User size={18} />}
                    label="Full name"
                    value={
                      user.name ||
                      "Not available"
                    }
                  />


                  <ProfileRow
                    icon={<Mail size={18} />}
                    label="Email address"
                    value={
                      user.email ||
                      "Not available"
                    }
                  />


                  <ProfileRow
                    icon={
                      <ShieldCheck size={18} />
                    }
                    label="Account security"
                    value="Protected with JWT authentication"
                    last
                  />

                </div>

              </div>

            </GlassCard>


            {/* TimeLens information */}

            <GlassCard>

              <div className="profile-card-content">

                <div className="profile-card-heading">

                  <div className="profile-icon-box">
                    <Clock3 size={19} />
                  </div>

                  <div>

                    <span className="profile-small-label">
                      YOUR TIME
                    </span>

                    <h3>
                      TimeLens workspace
                    </h3>

                  </div>

                </div>


                <div className="profile-feature-list">

                  <ProfileFeature
                    icon={<Clock3 size={18} />}
                    title="Plan & Track"
                    description="Plan tasks and track your daily activity."
                    onClick={() =>
                      navigate("/plan-track")
                    }
                  />


                  <ProfileFeature
                    icon={
                      <CalendarDays size={18} />
                    }
                    title="Productivity Calendar"
                    description="See your productivity across different days."
                    onClick={() =>
                      navigate("/calendar")
                    }
                  />


                  <ProfileFeature
                    icon={
                      <ChevronRight size={18} />
                    }
                    title="Insights"
                    description="Understand your productivity patterns."
                    onClick={() =>
                      navigate("/insights")
                    }
                  />

                </div>

              </div>

            </GlassCard>

          </div>


          {/* =====================================================
              ACCOUNT ACTION
          ===================================================== */}

          <GlassCard
            style={{
              marginTop: "18px",
            }}
          >

            <div className="profile-logout-card">

              <div>

                <span className="profile-small-label">
                  ACCOUNT ACTION
                </span>

                <h3>
                  End your current session
                </h3>

                <p>
                  You can safely log out from this device.
                  Your account data will remain protected.
                </p>

              </div>


              <button
                onClick={logout}
                className="profile-logout-button"
              >
                <LogOut size={17} />
                Logout
              </button>

            </div>

          </GlassCard>

        </section>

      </div>


      {/* =====================================================
          PROFILE PAGE STYLES
      ===================================================== */}

      <style>{`

        /* =====================================================
           EXACT DASHBOARD HEADER
        ===================================================== */

        .dashboard-nav {
          width: min(1180px, calc(100% - 40px));
          min-height: 76px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          position: relative;
          z-index: 20;
        }

        .dashboard-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #453126;
          font-size: 20px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: white;
          background:
            linear-gradient(
              135deg,
              #d7794d,
              #a94e38
            );
          box-shadow:
            0 8px 24px
            rgba(
              168,
              79,
              55,
              0.25
            );
          transition: 0.25s ease;
        }

        .dashboard-brand:hover .brand-mark {
          transform:
            rotate(-6deg)
            scale(1.05);
        }

        .dashboard-nav-links {
          display: flex;
          align-items: center;
          gap: 5px;
          flex: 1;
          justify-content: center;
        }

        .dashboard-nav-link {
          position: relative;
          border: 0;
          background: transparent;
          color: #745d4c;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 650;
          transition:
            color 0.25s ease,
            background 0.25s ease,
            transform 0.25s ease;
        }

        .dashboard-nav-link:hover {
          color: #8d402d;
          background:
            rgba(
              255,
              255,
              255,
              0.58
            );
          transform:
            translateY(-1px);
        }

        .dashboard-nav-link.active {
          color: #8d402d;
          background:
            rgba(
              255,
              255,
              255,
              0.72
            );
        }

        .dashboard-nav-link.active::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 4px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #c76b45;
          transform:
            translateX(-50%);
          box-shadow:
            0 0 10px
            rgba(
              199,
              107,
              69,
              0.55
            );
        }

        .dashboard-logout {
          border:
            1px solid
            rgba(
              120,
              78,
              52,
              0.16
            );
          background:
            rgba(
              255,
              250,
              245,
              0.65
            );
          color: #745b4a;
          padding: 9px 13px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.25s ease;
        }

        .dashboard-logout:hover {
          color: #8d402d;
          background:
            rgba(
              255,
              255,
              255,
              0.9
            );
          border-color:
            rgba(
              199,
              107,
              69,
              0.3
            );
          transform:
            translateY(-1px);
          box-shadow:
            0 8px 22px
            rgba(
              168,
              79,
              55,
              0.12
            );
        }


        /* =====================================================
           PROFILE BACK BUTTON
        ===================================================== */

        .profile-back-button {
          display: flex;
          align-items: center;
          gap: 7px;
          border: none;
          background: transparent;
          color: #654838;
          cursor: pointer;
          font: inherit;
          padding: 7px 0;
          transition:
            color 0.25s ease,
            transform 0.25s ease;
        }

        .profile-back-button:hover {
          color: #8f4615;
          transform:
            translateX(-4px);
        }


        /* =====================================================
           PROFILE HERO
        ===================================================== */

        .profile-hero-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 28px;
          border-radius: 26px;

          background:
            linear-gradient(
              135deg,
              rgba(
                255,
                247,
                225,
                0.72
              ),
              rgba(
                244,
                194,
                142,
                0.48
              )
            );

          border:
            1px solid
            rgba(
              255,
              226,
              170,
              0.78
            );

          box-shadow:
            0 18px 50px
              rgba(
                117,
                64,
                22,
                0.13
              ),
            inset 0 1px 0
              rgba(
                255,
                255,
                255,
                0.65
              );

          overflow: hidden;

          animation:
            profileCardIn
            0.75s
            cubic-bezier(
              .2,
              .8,
              .2,
              1
            )
            both;
        }

        .profile-hero-card::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          top: -110px;
          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(
                255,
                218,
                135,
                0.6
              ),
              transparent 70%
            );

          animation:
            profileGlow
            5s
            ease-in-out
            infinite;
        }

        .profile-avatar {
          width: 78px;
          height: 78px;
          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 24px;

          background:
            linear-gradient(
              135deg,
              #ffe5aa,
              #f2b95d,
              #dc7d2e
            );

          color: #633515;

          border:
            1px solid
            rgba(
              255,
              245,
              215,
              0.8
            );

          box-shadow:
            0 0 18px
              rgba(
                255,
                212,
                122,
                0.45
              ),
            0 12px 30px
              rgba(
                130,
                67,
                20,
                0.16
              );

          animation:
            avatarFloat
            4s
            ease-in-out
            infinite;
        }

        .profile-hero-info {
          position: relative;
          z-index: 2;
          flex: 1;
        }

        .profile-small-label {
          display: block;
          color: #9a4d16;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.13em;
        }

        .profile-hero-info h2 {
          margin:
            7px 0 3px;
          font-size: 1.65rem;
          letter-spacing: -0.035em;
        }

        .profile-hero-info p {
          margin: 0;
          color: #654838 !important;
        }

        .profile-hero-badge {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          gap: 7px;

          padding:
            9px 13px;
          border-radius: 999px;

          background:
            rgba(
              255,
              239,
              194,
              0.75
            );

          border:
            1px solid
            rgba(
              210,
              137,
              49,
              0.3
            );

          color: #754016;
          font-size: 0.78rem;
          font-weight: 700;

          white-space: nowrap;
        }


        /* =====================================================
           PROFILE GRID
        ===================================================== */

        .profile-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          gap: 18px;
        }

        .profile-card-content {
          padding: 26px;
        }

        .profile-card-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          padding-bottom: 20px;
          border-bottom:
            1px solid
            rgba(
              120,
              72,
              35,
              0.12
            );
        }

        .profile-card-heading h3 {
          margin:
            5px 0 0;
          font-size: 1.25rem;
          letter-spacing: -0.025em;
        }

        .profile-icon-box {
          width: 42px;
          height: 42px;
          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 13px;

          color: #8f4615;

          background:
            linear-gradient(
              135deg,
              rgba(
                255,
                224,
                154,
                0.72
              ),
              rgba(
                223,
                120,
                48,
                0.18
              )
            );

          border:
            1px solid
            rgba(
              196,
              111,
              40,
              0.2
            );

          box-shadow:
            0 0 18px
            rgba(
              225,
              135,
              51,
              0.12
            );
        }


        /* =====================================================
           PROFILE DETAILS
        ===================================================== */

        .profile-details {
          margin-top: 4px;
        }

        .profile-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px 0;
          border-bottom:
            1px solid
            rgba(
              120,
              72,
              35,
              0.1
            );

          transition:
            padding-left 0.25s ease,
            background 0.25s ease;
        }

        .profile-row:hover {
          padding-left: 7px;
        }

        .profile-row.last {
          border-bottom: none;
        }

        .profile-row-icon {
          width: 35px;
          height: 35px;
          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 10px;

          color: #9a4d16;

          background:
            rgba(
              255,
              224,
              154,
              0.42
            );
        }

        .profile-row-label {
          display: block;
          color: #806352;
          font-size: 0.74rem;
          font-weight: 600;
        }

        .profile-row-value {
          display: block;
          margin-top: 4px;
          color: #2b1a12;
          font-weight: 700;
          line-height: 1.4;
        }


        /* =====================================================
           PROFILE FEATURES
        ===================================================== */

        .profile-feature-list {
          margin-top: 8px;
        }

        .profile-feature {
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          padding: 15px 4px;

          border: none;
          border-bottom:
            1px solid
            rgba(
              120,
              72,
              35,
              0.1
            );

          background: transparent;
          text-align: left;
          cursor: pointer;

          transition:
            transform 0.25s ease,
            padding-left 0.25s ease;
        }

        .profile-feature:last-child {
          border-bottom: none;
        }

        .profile-feature:hover {
          transform:
            translateX(6px);
        }

        .profile-feature-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 11px;

          color: #9a4d16;

          background:
            rgba(
              255,
              224,
              154,
              0.42
            );
        }

        .profile-feature-text {
          flex: 1;
        }

        .profile-feature-title {
          display: block;
          color: #2b1a12;
          font-weight: 800;
        }

        .profile-feature-description {
          display: block;
          margin-top: 3px;
          color: #654838;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .profile-feature-arrow {
          color: #9a4d16;
          transition:
            transform 0.25s ease;
        }

        .profile-feature:hover
        .profile-feature-arrow {
          transform:
            translateX(4px);
        }


        /* =====================================================
           LOGOUT CARD
        ===================================================== */

        .profile-logout-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 25px 27px;
        }

        .profile-logout-card h3 {
          margin:
            6px 0 4px;
          font-size: 1.15rem;
        }

        .profile-logout-card p {
          margin: 0;
          max-width: 600px;
          font-size: 0.88rem;
        }

        .profile-logout-button {
          display: flex;
          align-items: center;
          gap: 8px;

          flex-shrink: 0;

          padding:
            12px 17px;

          border-radius: 12px;

          border:
            1px solid
            rgba(
              176,
              71,
              32,
              0.3
            );

          background:
            rgba(
              255,
              226,
              196,
              0.65
            );

          color: #9a3d20;

          font: inherit;
          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .profile-logout-button:hover {
          transform:
            translateY(-3px);

          background:
            rgba(
              255,
              210,
              175,
              0.85
            );

          box-shadow:
            0 0 18px
            rgba(
              218,
              103,
              54,
              0.2
            );
        }


        /* =====================================================
           ANIMATIONS
        ===================================================== */

        @keyframes profileCardIn {
          from {
            opacity: 0;
            transform:
              translateY(24px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes avatarFloat {
          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-5px);
          }
        }

        @keyframes profileGlow {
          0%,
          100% {
            transform:
              scale(1);
            opacity: 0.7;
          }

          50% {
            transform:
              scale(1.15);
            opacity: 1;
          }
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {

          .dashboard-nav {
            flex-wrap: wrap;
            padding: 15px 0;
          }

          .dashboard-nav-links {
            order: 3;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .profile-hero-badge {
            display: none;
          }

        }


        @media (max-width: 650px) {

          .profile-page-content {
            width:
              calc(100% - 24px) !important;
          }

          .profile-hero-card {
            padding: 20px;
          }

          .profile-avatar {
            width: 60px;
            height: 60px;
            border-radius: 18px;
          }

          .profile-hero-info h2 {
            font-size: 1.3rem;
          }

          .profile-card-content {
            padding: 20px;
          }

          .profile-logout-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .profile-logout-button {
            width: 100%;
            justify-content: center;
          }

        }


        @media (max-width: 430px) {

          .dashboard-nav {
            gap: 10px;
          }

          .dashboard-brand {
            font-size: 17px;
          }

          .brand-mark {
            width: 34px;
            height: 34px;
          }

          .dashboard-nav-links {
            justify-content: flex-start;
            overflow-x: auto;
            flex-wrap: nowrap;
            width: 100%;
            padding-bottom: 4px;
          }

          .dashboard-nav-link {
            flex-shrink: 0;
          }

        }


        @media (prefers-reduced-motion: reduce) {

          .profile-hero-card,
          .profile-avatar,
          .profile-hero-card::before {
            animation: none;
          }

          .profile-feature,
          .profile-row,
          .profile-logout-button,
          .profile-back-button {
            transition: none;
          }

        }

      `}</style>

    </main>
  );
}


/* =========================================================
   PROFILE ROW
========================================================= */

function ProfileRow({
  icon,
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`profile-row ${
        last ? "last" : ""
      }`}
    >

      <div className="profile-row-icon">
        {icon}
      </div>

      <div>

        <span className="profile-row-label">
          {label}
        </span>

        <strong className="profile-row-value">
          {value}
        </strong>

      </div>

    </div>
  );
}


/* =========================================================
   PROFILE FEATURE
========================================================= */

function ProfileFeature({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      className="profile-feature"
      onClick={onClick}
    >

      <div className="profile-feature-icon">
        {icon}
      </div>

      <div className="profile-feature-text">

        <span className="profile-feature-title">
          {title}
        </span>

        <span className="profile-feature-description">
          {description}
        </span>

      </div>

      <div className="profile-feature-arrow">
        <ChevronRight size={18} />
      </div>

    </button>
  );
}

export default Profile;