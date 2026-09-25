import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  TrendingUp,
  Clock3,
  Target,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  Sparkles,
  Lightbulb,
  AlertCircle,
  LogOut,
} from "lucide-react";

import GlassCard from "../../components/glasscard";

import {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getDailyEntry,
  getLatestDailyEntry,
} from "../../services/api";

function getToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  const local = new Date(
    date.getTime() - offset * 60000
  );

  return local.toISOString().split("T")[0];
}

/* ==================================================
   SAMPLE TIME COACH DATA
   Frontend only - no backend required
================================================== */

const sampleCoachData = {
  digitalTime: 380,
  productiveTime: 225,
  recreationalTime: 155,
  completedTasks: 4,
  totalTasks: 5,
  plannedTime: 300,
  actualTime: 345,
};

/* ==================================================
   INSIGHTS
================================================== */

function Insights() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [today, setToday] = useState(null);
  const [week, setWeek] = useState(null);
  const [tab, setTab] = useState("Today");
  const [recordedDate, setRecordedDate] = useState(null);

  const todayDate = getToday();

  /* ==================================================
     LOAD USER
  ================================================== */

  useEffect(() => {
    const savedUser =
      localStorage.getItem("timelens_user");

    const token =
      localStorage.getItem("timelens_token");

    if (!savedUser || !token) {
      navigate("/auth");
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch {
      navigate("/auth");
    }
  }, [navigate]);

  /* ==================================================
     LOAD INSIGHTS
  ================================================== */

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = async () => {
    try {
      const weekResponse =
        await getWeeklyAnalytics(todayDate);

      setWeek(
        weekResponse?.analytics || null
      );

      let entry = null;

      try {
        const todayEntryResponse =
          await getDailyEntry(todayDate);

        entry =
          todayEntryResponse?.entry || null;
      } catch {
        console.log(
          "No entry for today. Loading latest recorded entry."
        );
      }

      if (!entry) {
        const latestEntryResponse =
          await getLatestDailyEntry();

        entry =
          latestEntryResponse?.entry || null;
      }

      if (entry?.entry_date) {
        const selectedDate =
          String(entry.entry_date).split("T")[0];

        setRecordedDate(selectedDate);

        const analyticsResponse =
          await getDailyAnalytics(selectedDate);

        setToday(
          analyticsResponse?.analytics || null
        );
      } else {
        setRecordedDate(null);
        setToday(null);
      }
    } catch (error) {
      console.log(
        "Insights:",
        error.message
      );

      setToday(null);
      setWeek(null);
      setRecordedDate(null);
    }
  };

  /* ==================================================
     FORMAT TIME
  ================================================== */

  const formatMinutes = (minutes) => {
    const value = Number(minutes || 0);

    if (value < 60) {
      return `${value}m`;
    }

    const hours = Math.floor(value / 60);
    const mins = value % 60;

    return mins
      ? `${hours}h ${mins}m`
      : `${hours}h`;
  };

  /* ==================================================
     PRODUCTIVITY
  ================================================== */

  const productivityPercentage =
    today?.digitalMinutes > 0
      ? Math.round(
          (today.productiveMinutes /
            today.digitalMinutes) *
            100
        )
      : 0;

  /* ==================================================
     LOGOUT
  ================================================== */

  const handleLogout = () => {
    localStorage.removeItem("timelens_token");
    localStorage.removeItem("timelens_user");

    navigate("/auth");
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <main className="timelens-page insights-page">

      <div
        style={{
          position: "relative",
          zIndex: 5,
          minHeight: "100vh",
        }}
      >

        {/* ==================================================
            SAME DASHBOARD HEADER
        ================================================== */}

        <nav className="dashboard-nav">

          {/* LOGO */}

          <button
            type="button"
            className="dashboard-brand"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <div className="brand-mark">
              <Clock3 size={19} />
            </div>

            <span>TimeLens</span>
          </button>


          {/* NAVIGATION */}

          <div className="dashboard-nav-links">

            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Dashboard
            </button>


            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() =>
                navigate("/plan-track")
              }
            >
              Plan & Track
            </button>


            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() =>
                navigate("/calendar")
              }
            >
              Calendar
            </button>


            <button
              type="button"
              className="dashboard-nav-link active"
              onClick={() =>
                navigate("/insights")
              }
            >
              Insights
            </button>


            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() =>
                navigate("/profile")
              }
            >
              Profile
            </button>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </nav>


        {/* ==================================================
            MAIN
        ================================================== */}

        <section className="insights-container">

          <div className="insights-heading">

            <span className="warm-section-label">
              INSIGHTS
            </span>

            <h1>
              See the{" "}
              <span>pattern.</span>
            </h1>

            <p>
              Turn your recorded digital activity
              into useful information about your
              time, tasks and goals.
            </p>

            {recordedDate && (
              <div className="recorded-date">
                Showing recorded data for{" "}
                <strong>{recordedDate}</strong>
              </div>
            )}

          </div>


          {/* ==================================================
              TABS
          ================================================== */}

          <div className="insight-tabs">

            {[
              "Today",
              "This Week",
              "Time Coach",
            ].map((item) => (

              <button
                key={item}
                className={
                  tab === item
                    ? "insight-tab active"
                    : "insight-tab"
                }
                onClick={() =>
                  setTab(item)
                }
              >

                {item === "Time Coach" && (
                  <Sparkles size={15} />
                )}

                {item}

              </button>

            ))}

          </div>


          {/* ==================================================
              TODAY
          ================================================== */}

          {tab === "Today" && (
            <TodayView
              today={today}
              productivityPercentage={
                productivityPercentage
              }
              formatMinutes={formatMinutes}
            />
          )}


          {/* ==================================================
              THIS WEEK
          ================================================== */}

          {tab === "This Week" && (
            <WeekView
              week={week}
              formatMinutes={formatMinutes}
            />
          )}


          {/* ==================================================
              TIME COACH
          ================================================== */}

          {tab === "Time Coach" && (
            <TimeCoachView
              formatMinutes={formatMinutes}
            />
          )}

        </section>

      </div>

    </main>
  );
}


/* ==================================================
   TODAY
================================================== */

function TodayView({
  today,
  productivityPercentage,
  formatMinutes,
}) {

  return (
    <div className="insight-content">

      {/* METRICS */}

      <div className="insight-metric-grid">

        <InsightCard
          icon={<Clock3 />}
          title="Digital time"
          value={formatMinutes(
            today?.digitalMinutes
          )}
        />

        <InsightCard
          icon={<TrendingUp />}
          title="Productive / necessary"
          value={formatMinutes(
            today?.productiveMinutes
          )}
          accent="orange"
        />

        <InsightCard
          icon={<Target />}
          title="Recreational"
          value={formatMinutes(
            today?.recreationalMinutes
          )}
          accent="gold"
        />

        <InsightCard
          icon={<CheckCircle2 />}
          title="Task completion"
          value={`${today?.completionRate || 0}%`}
          accent="brown"
        />

      </div>


      {/* TIME BALANCE */}

      <GlassCard className="insight-wide-card">

        <div className="insight-card-inner">

          <div className="insight-card-heading">

            <div>

              <span className="warm-section-label">
                TIME BALANCE
              </span>

              <h2>
                Where your digital time went.
              </h2>

            </div>

            <BarChart3 size={25} />

          </div>


          <div className="balance-number">
            {productivityPercentage}%
          </div>

          <p className="insight-description">
            of recorded digital time was productive
            or necessary.
          </p>


          <div className="balance-track">

            <div
              style={{
                width: `${productivityPercentage}%`,
              }}
            />

          </div>


          <div className="balance-labels">

            <span>
              Productive / Necessary
            </span>

            <strong>
              {formatMinutes(
                today?.productiveMinutes
              )}
            </strong>

            <span>
              Recreational
            </span>

            <strong>
              {formatMinutes(
                today?.recreationalMinutes
              )}
            </strong>

          </div>

        </div>

      </GlassCard>


      {/* PLANNED VS ACTUAL */}

      <GlassCard className="insight-wide-card">

        <div className="insight-card-inner">

          <div className="insight-card-heading">

            <div>

              <span className="warm-section-label">
                PLANNED VS ACTUAL
              </span>

              <h2>
                Did your day follow the plan?
              </h2>

            </div>

            <Target size={25} />

          </div>


          <div className="planned-grid">

            <div className="planned-box">

              <span>PLANNED</span>

              <strong>
                {formatMinutes(
                  today?.plannedMinutes
                )}
              </strong>

            </div>


            <div className="planned-box actual">

              <span>ACTUAL</span>

              <strong>
                {formatMinutes(
                  today?.actualMinutes
                )}
              </strong>

            </div>

          </div>

        </div>

      </GlassCard>

    </div>
  );
}


/* ==================================================
   WEEK
================================================== */

function WeekView({
  week,
  formatMinutes,
}) {

  const days = week?.days || [];

  return (
    <div className="insight-content">

      <GlassCard className="insight-wide-card">

        <div className="insight-card-inner">

          <div className="insight-card-heading">

            <div>

              <span className="warm-section-label">
                WEEKLY OVERVIEW
              </span>

              <h2>
                Your recent time pattern.
              </h2>

            </div>

            <CalendarDays size={25} />

          </div>


          {week && (

            <div className="week-total-grid">

              <WeekMetric
                title="Digital time"
                value={formatMinutes(
                  week.digitalMinutes
                )}
              />

              <WeekMetric
                title="Productive"
                value={formatMinutes(
                  week.productiveMinutes
                )}
                accent="orange"
              />

              <WeekMetric
                title="Recreational"
                value={formatMinutes(
                  week.recreationalMinutes
                )}
                accent="gold"
              />

              <WeekMetric
                title="Task completion"
                value={`${week.completionRate || 0}%`}
                accent="brown"
              />

            </div>

          )}


          <div className="weekly-history">

            <div className="history-heading">

              <span>DATE</span>

              <span>DIGITAL TIME</span>

            </div>


            {days.length === 0 ? (

              <div className="empty-history">
                Record more days to build your
                weekly history.
              </div>

            ) : (

              days.map((day) => {

                const digital =
                  Number(
                    day.digitalMinutes || 0
                  );

                const width = Math.min(
                  digital / 6,
                  100
                );

                return (

                  <div
                    className="history-row"
                    key={day.date}
                  >

                    <span className="history-date">
                      {day.date}
                    </span>

                    <div className="history-bar">

                      <div
                        style={{
                          width: `${width}%`,
                        }}
                      />

                    </div>

                    <strong>
                      {formatMinutes(digital)}
                    </strong>

                  </div>

                );

              })

            )}

          </div>

        </div>

      </GlassCard>

    </div>
  );
}


/* ==================================================
   TIME COACH
================================================== */

function TimeCoachView({
  formatMinutes,
}) {

  const data = sampleCoachData;

  const productivity =
    Math.round(
      (data.productiveTime /
        data.digitalTime) *
        100
    );

  const extraTime =
    data.actualTime -
    data.plannedTime;

  const redirectedTime =
    Math.round(
      data.recreationalTime * 0.25
    );

  return (
    <div className="insight-content">

      {/* INTRO */}

      <GlassCard className="time-coach-hero">

        <div className="time-coach-inner">

          <div className="time-coach-icon">
            <Sparkles size={28} />
          </div>

          <span className="warm-section-label">
            TIME COACH
          </span>

          <h2>
            Turn your time data into
            your next move.
          </h2>

          <p>
            TimeLens looks at your recorded
            activity and turns it into a
            simple action you can take today.
          </p>

        </div>

      </GlassCard>


      {/* SUMMARY */}

      <div className="coach-summary-grid">

        <GlassCard className="coach-summary-card">

          <div className="coach-summary-icon">
            <Clock3 size={21} />
          </div>

          <span>DIGITAL TIME</span>

          <strong>
            {formatMinutes(
              data.digitalTime
            )}
          </strong>

        </GlassCard>


        <GlassCard className="coach-summary-card">

          <div className="coach-summary-icon orange">
            <TrendingUp size={21} />
          </div>

          <span>PRODUCTIVE</span>

          <strong>
            {productivity}%
          </strong>

        </GlassCard>


        <GlassCard className="coach-summary-card">

          <div className="coach-summary-icon gold">
            <CheckCircle2 size={21} />
          </div>

          <span>TASKS DONE</span>

          <strong>
            {data.completedTasks}/
            {data.totalTasks}
          </strong>

        </GlassCard>

      </div>


      {/* COACH ANALYSIS */}

      <GlassCard className="coach-analysis-card">

        <div className="insight-card-inner">

          <div className="insight-card-heading">

            <div>

              <span className="warm-section-label">
                YOUR TIME COACH
              </span>

              <h2>
                Here's what your day is saying.
              </h2>

            </div>

            <Lightbulb size={25} />

          </div>


          <div className="coach-insight-list">

            <div className="coach-insight">

              <div className="coach-insight-icon positive">
                <CheckCircle2 size={20} />
              </div>

              <div>

                <strong>
                  Strong task progress
                </strong>

                <p>
                  You completed{" "}
                  {data.completedTasks} of{" "}
                  {data.totalTasks} planned
                  tasks today.
                </p>

              </div>

            </div>


            <div className="coach-insight">

              <div className="coach-insight-icon warning">
                <AlertCircle size={20} />
              </div>

              <div>

                <strong>
                  Watch recreational time
                </strong>

                <p>
                  You spent{" "}
                  {formatMinutes(
                    data.recreationalTime
                  )}{" "}
                  on recreational activity.
                </p>

              </div>

            </div>


            <div className="coach-insight">

              <div className="coach-insight-icon focus">
                <Target size={20} />
              </div>

              <div>

                <strong>
                  Protect your next focus block
                </strong>

                <p>
                  Redirecting just 25% of
                  recreational time could give
                  you{" "}
                  <strong>
                    {formatMinutes(
                      redirectedTime
                    )}
                  </strong>{" "}
                  of additional goal-focused
                  time.
                </p>

              </div>

            </div>

          </div>

        </div>

      </GlassCard>


      {/* PLANNED VS ACTUAL */}

      <GlassCard className="coach-plan-card">

        <div className="insight-card-inner">

          <div className="insight-card-heading">

            <div>

              <span className="warm-section-label">
                PLAN CHECK
              </span>

              <h2>
                How closely did you follow
                your plan?
              </h2>

            </div>

            <Target size={25} />

          </div>


          <div className="coach-plan-grid">

            <div>

              <span>PLANNED</span>

              <strong>
                {formatMinutes(
                  data.plannedTime
                )}
              </strong>

            </div>


            <div>

              <span>ACTUAL</span>

              <strong>
                {formatMinutes(
                  data.actualTime
                )}
              </strong>

            </div>


            <div>

              <span>DIFFERENCE</span>

              <strong>
                +{formatMinutes(extraTime)}
              </strong>

            </div>

          </div>

        </div>

      </GlassCard>


      {/* NEXT MOVE */}

      <GlassCard className="coach-next-card">

        <div className="coach-next-inner">

          <div>

            <span className="warm-section-label">
              YOUR NEXT MOVE
            </span>

            <h2>
              Protect your next 30 minutes.
            </h2>

            <p>
              Finish one remaining priority
              task before switching to another
              recreational activity.
            </p>

          </div>


          <div className="coach-next-action">

            <span>FOCUS TARGET</span>

            <strong>
              30 minutes
            </strong>

          </div>

        </div>

      </GlassCard>


      {/* SAMPLE DATA NOTE */}

      <div className="coach-demo-note">

        <Sparkles size={16} />

        <span>
          Time Coach is currently running on
          sample data for demonstration.
        </span>

      </div>

    </div>
  );
}


/* ==================================================
   INSIGHT CARD
================================================== */

function InsightCard({
  icon,
  title,
  value,
  accent = "default",
}) {

  return (
    <GlassCard className="insight-metric-card">

      <div className="insight-metric-inner">

        <div
          className={`metric-icon ${accent}`}
        >
          {icon}
        </div>

        <span>
          {title}
        </span>

        <strong className={accent}>
          {value}
        </strong>

      </div>

    </GlassCard>
  );
}


/* ==================================================
   WEEK METRIC
================================================== */

function WeekMetric({
  title,
  value,
  accent = "default",
}) {

  return (
    <div
      className={`week-metric ${accent}`}
    >

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


export default Insights;