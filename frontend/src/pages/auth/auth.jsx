import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../../services/api";

function Auth() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  };

  /* ==================================================
     REGISTER
     ================================================== */

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name,
        email,
        password,
      });

      if (data.token && data.user) {
        localStorage.setItem("timelens_token", data.token);
        localStorage.setItem("timelens_user", JSON.stringify(data.user));
        setMessage("Account created successfully. Entering TimeLens...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 600);
        return;
      }

      setMessage("Account created successfully. Please log in.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setIsRegister(false);
      }, 800);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.message || "Unable to connect to the TimeLens server."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     LOGIN
     ================================================== */

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const data = await loginUser({
        email,
        password,
      });

      /* Store JWT */
      localStorage.setItem("timelens_token", data.token);

      /* Store logged-in user */
      localStorage.setItem("timelens_user", JSON.stringify(data.user));

      setMessage("Login successful.");

      /* Go directly to Dashboard */
      setTimeout(() => {
        navigate("/dashboard");
      }, 400);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message || "Unable to connect to the TimeLens server."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     SWITCH TO LOGIN
     ================================================== */

  const showLogin = () => {
    clearForm();
    setIsRegister(false);
  };

  /* ==================================================
     SWITCH TO REGISTER
     ================================================== */

  const showRegister = () => {
    clearForm();
    setIsRegister(true);
  };

  /* ==================================================
     PAGE
     ================================================== */

  return (
    <main className="timelens-auth-page">

      {/* Background atmosphere */}

      <div className="auth-sky" />
      <div className="auth-sun" />

      <div className="auth-cloud auth-cloud-one">
        <span />
        <span />
        <span />
      </div>

      <div className="auth-cloud auth-cloud-two">
        <span />
        <span />
        <span />
      </div>

      <div className="auth-horizon" />

      {/* ==================================================
          TOP LOGO
          ================================================== */}

      <header className="auth-header">

        <button
          type="button"
          className="auth-brand"
          onClick={() => navigate("/auth")}
        >
          <span className="auth-brand-symbol">
            T
          </span>

          <span className="auth-brand-name">
            TimeLens
          </span>
        </button>

        <span className="auth-header-text">
          PERSONAL DIGITAL TIME ANALYZER
        </span>

      </header>

      {/* ==================================================
          MAIN AUTH AREA
          ================================================== */}

      <section className="auth-main">

        {/* LEFT SIDE */}

        <div className="auth-story">

          <span className="auth-eyebrow">
            UNDERSTAND YOUR TIME
          </span>

          <h1>
            See your time
            <br />
            <span>differently.</span>
          </h1>

          <p>
            TimeLens connects your activities,
            tasks and goals to help you understand
            where your digital time actually goes.
          </p>

          <div className="auth-mini-stats">

            <div>
              <strong>TIME</strong>
              <span>Track</span>
            </div>

            <div>
              <strong>PLAN</strong>
              <span>Organize</span>
            </div>

            <div>
              <strong>INSIGHT</strong>
              <span>Improve</span>
            </div>

          </div>

        </div>

        {/* ==================================================
            AUTH CARD
            ================================================== */}

        <div
          className={`auth-panel ${
            isRegister ? "register-mode" : ""
          }`}
        >

          <div className="auth-panel-glow" />

          <div className="auth-panel-content">

            {/* Heading */}

            <div className="auth-heading">

              <span>
                {isRegister
                  ? "NEW ACCOUNT"
                  : "WELCOME BACK"}
              </span>

              <h2>
                {isRegister
                  ? "Create your account"
                  : "Sign in to TimeLens"}
              </h2>

              <p>
                {isRegister
                  ? "Start understanding your digital time."
                  : "Continue exploring your time patterns."}
              </p>

            </div>

            {/* Login/Register switch */}

            <div className="auth-mode-switch">

              <button
                type="button"
                className={!isRegister ? "active" : ""}
                onClick={showLogin}
              >
                Login
              </button>

              <button
                type="button"
                className={isRegister ? "active" : ""}
                onClick={showRegister}
              >
                Create Account
              </button>

            </div>

            {/* Form */}

            <form
              className="auth-form-new"
              onSubmit={
                isRegister
                  ? handleRegister
                  : handleLogin
              }
            >

              {isRegister && (
                <div className="auth-input-group">

                  <label htmlFor="auth-name">
                    Full name
                  </label>

                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    autoComplete="name"
                    required
                  />

                </div>
              )}

              <div className="auth-input-group">

                <label htmlFor="auth-email">
                  Email address
                </label>

                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />

              </div>

              <div className="auth-input-group">

                <label htmlFor="auth-password">
                  Password
                </label>

                <input
                  id="auth-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete={
                    isRegister
                      ? "new-password"
                      : "current-password"
                  }
                  required
                />

              </div>

              {isRegister && (
                <div className="auth-input-group">

                  <label htmlFor="auth-confirm-password">
                    Confirm password
                  </label>

                  <input
                    id="auth-confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    required
                  />

                </div>
              )}

              {!isRegister && (
                <div className="auth-forgot">

                  <button
                    type="button"
                    onClick={() => {
                      setMessage(
                        "Password recovery will be added later."
                      );
                      setError("");
                    }}
                  >
                    Forgot password?
                  </button>

                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Please wait..."
                    : isRegister
                    ? "Create account"
                    : "Enter TimeLens"}
                </span>

                {!loading && (
                  <span className="auth-arrow">
                    →
                  </span>
                )}
              </button>

            </form>

            {/* Messages */}

            {message && (
              <div className="auth-result success">
                <span>✓</span>
                {message}
              </div>
            )}

            {error && (
              <div className="auth-result error">
                <span>!</span>
                {error}
              </div>
            )}

            <div className="auth-security">
              Your TimeLens data is connected
              to your personal account.
            </div>

          </div>

        </div>

      </section>

      <div className="auth-bottom-text">
        TIME • PLAN • TRACK • UNDERSTAND
      </div>

    </main>
  );
}

export default Auth;