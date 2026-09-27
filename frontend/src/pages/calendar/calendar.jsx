import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Flame,
  CheckCircle2,
  Clock3,
  Sparkles,
  Target,
  ArrowUpRight,
  LogOut,
} from "lucide-react";

import {
  getMonthlyAnalytics,
  getWeeklyAnalytics,
} from "../../services/api";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

function getIntensity(value) {
  if (!value) return "empty";
  if (value >= 90) return "excellent";
  if (value >= 75) return "good";
  if (value >= 60) return "medium";
  return "low";
}

function formatHours(minutes) {
  const safeMinutes = Math.max(0, Number(minutes || 0));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}m`;
}

function hasDayActivity(dayData) {
  if (!dayData) return false;
  return (
    Number(dayData.tasks || 0) > 0 ||
    Number(dayData.completed || 0) > 0 ||
    Number(dayData.productiveMinutes || 0) > 0 ||
    Number(dayData.digitalMinutes || 0) > 0 ||
    Number(dayData.productivity || 0) > 0
  );
}

export default function Calendar() {
  const navigate = useNavigate();

  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    getDateKey(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  );

  const [calendarData, setCalendarData] = useState({});
  const [weeklyScores, setWeeklyScores] = useState([0, 0, 0, 0, 0, 0, 0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const token = localStorage.getItem("timelens_token");
    if (!token) {
      navigate("/auth");
      return;
    }

    let isMounted = true;

    async function loadMonthAndWeek() {
      try {
        const [monthRes, weekRes] = await Promise.all([
          getMonthlyAnalytics(year, month + 1).catch(() => null),
          getWeeklyAnalytics(selectedDate).catch(() => null),
        ]);

        if (!isMounted) return;

        const daysMap = monthRes?.analytics?.days || {};
        setCalendarData(daysMap);

        const weekDays = weekRes?.analytics?.days || [];
        if (weekDays.length > 0) {
          const scores = [0, 1, 2, 3, 4, 5, 6].map((idx) => {
            const d = weekDays[idx];
            if (!d) return 0;
            const prodMins = Number(d.productiveMinutes || 0);
            const digMins = Number(d.digitalMinutes || 0);
            const compRate = Number(d.completionRate || 0);
            if (digMins > 0 && compRate > 0) {
              return Math.min(100, Math.round((prodMins / digMins) * 50 + compRate * 0.5));
            }
            if (digMins > 0) {
              return Math.min(100, Math.round((prodMins / digMins) * 100));
            }
            return Math.min(100, compRate);
          });
          setWeeklyScores(scores);
        }
      } catch (error) {
        console.error("Failed to load calendar analytics:", error);
      }
    }

    loadMonthAndWeek();

    return () => {
      isMounted = false;
    };
  }, [year, month, selectedDate, navigate]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: previousMonthDays - i,
        currentMonth: false,
        key: `previous-${i}`,
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push({
        day,
        currentMonth: true,
        key: getDateKey(year, month, day),
      });
    }

    let nextDay = 1;

    while (days.length < 42) {
      days.push({
        day: nextDay,
        currentMonth: false,
        key: `next-${nextDay}`,
      });

      nextDay++;
    }

    return days;
  }, [year, month]);

  const rawSelectedData = calendarData[selectedDate];
  const selectedData = hasDayActivity(rawSelectedData) ? rawSelectedData : null;

  const monthData = Object.entries(calendarData).filter(([date, data]) => {
    const [dataYear, dataMonth] = date.split("-").map(Number);
    return (
      dataYear === year &&
      dataMonth === month + 1 &&
      hasDayActivity(data)
    );
  });

  const averageProductivity =
    monthData.length > 0
      ? Math.round(
          monthData.reduce(
            (total, [, data]) =>
              total + Number(data.productivity || 0),
            0
          ) / monthData.length
        )
      : 0;

  const totalProductiveMinutes =
    monthData.reduce(
      (total, [, data]) =>
        total + Number(data.productiveMinutes || 0),
      0
    );

  const totalCompletedTasks =
    monthData.reduce(
      (total, [, data]) =>
        total + Number(data.completed || 0),
      0
    );

  const currentEnergyLabel =
    averageProductivity >= 80
      ? "High"
      : averageProductivity >= 55
      ? "Good"
      : monthData.length > 0
      ? "Steady"
      : "Ready";

  const goPreviousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const goNextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const goToday = () => {
    const now = new Date();

    setCurrentDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );

    setSelectedDate(
      getDateKey(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("timelens_token");
    localStorage.removeItem("timelens_user");

    navigate("/auth");
  };

  return (
    <div className="timelens-page calendar-page">

      <div className="calendar-orbit calendar-orbit-one" />

      <div className="calendar-orbit calendar-orbit-two" />


      {/* ==================================================
          DASHBOARD HEADER
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
            className="dashboard-nav-link active"
            onClick={() =>
              navigate("/calendar")
            }
          >
            Calendar
          </button>


          <button
            type="button"
            className="dashboard-nav-link"
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

      <main className="calendar-container">

        {/* HERO */}

        <section className="calendar-hero">

          <div>

            <div className="calendar-eyebrow">
              <Sparkles size={15} />
              YOUR PRODUCTIVITY JOURNEY
            </div>

            <h1>
              See your time
              <br />
              <span>in motion.</span>
            </h1>

            <p>
              Every productive day leaves a mark.
              Explore your progress, consistency
              and completed work.
            </p>

          </div>


          <div className="calendar-hero-orb">

            <div className="orb-ring orb-ring-one" />

            <div className="orb-ring orb-ring-two" />

            <div className="orb-core">
              <CalendarDays size={38} />
            </div>

          </div>

        </section>


        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <section className="calendar-stat-grid">

          <div className="calendar-stat-card">

            <div className="stat-icon productivity">
              <Target size={20} />
            </div>

            <div>
              <span>Monthly Focus</span>

              <strong>
                {averageProductivity}%
              </strong>
            </div>

            <div className="stat-mini-ring">

              <svg viewBox="0 0 40 40">

                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="ring-track"
                />

                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="ring-progress"
                  pathLength="100"
                  strokeDasharray={`${averageProductivity} 100`}
                />

              </svg>

            </div>

          </div>


          <div className="calendar-stat-card">

            <div className="stat-icon time">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Productive Time</span>

              <strong>
                {formatHours(
                  totalProductiveMinutes
                )}
              </strong>
            </div>

          </div>


          <div className="calendar-stat-card">

            <div className="stat-icon tasks">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Tasks Completed</span>

              <strong>
                {totalCompletedTasks}
              </strong>
            </div>

          </div>


          <div className="calendar-stat-card">

            <div className="stat-icon streak">
              <Flame size={20} />
            </div>

            <div>
              <span>Current Energy</span>

              <strong>{currentEnergyLabel}</strong>
            </div>

          </div>

        </section>


        {/* ==================================================
            CALENDAR + DAY DETAILS
        ================================================== */}

        <section className="calendar-main-grid">

          {/* CALENDAR */}

          <div className="calendar-card">

            <div className="calendar-card-header">

              <div>

                <span className="calendar-section-label">
                  PRODUCTIVITY CALENDAR
                </span>

                <h2>
                  {MONTH_NAMES[month]} {year}
                </h2>

              </div>


              <div className="calendar-controls">

                <button
                  className="today-button"
                  onClick={goToday}
                >
                  Today
                </button>


                <button
                  className="month-button"
                  onClick={goPreviousMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={19} />
                </button>


                <button
                  className="month-button"
                  onClick={goNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight size={19} />
                </button>

              </div>

            </div>


            <div className="weekday-row">

              {[
                "SUN",
                "MON",
                "TUE",
                "WED",
                "THU",
                "FRI",
                "SAT",
              ].map((day) => (
                <div key={day}>
                  {day}
                </div>
              ))}

            </div>


            <div className="calendar-grid">

              {calendarDays.map((item) => {

                const rawData = item.currentMonth
                  ? calendarData[
                      getDateKey(
                        year,
                        month,
                        item.day
                      )
                    ]
                  : null;

                const data = hasDayActivity(rawData) ? rawData : null;

                const dateKey = item.currentMonth
                  ? getDateKey(
                      year,
                      month,
                      item.day
                    )
                  : item.key;

                const isSelected =
                  selectedDate === dateKey;

                const isToday =
                  item.currentMonth &&
                  year ===
                    today.getFullYear() &&
                  month ===
                    today.getMonth() &&
                  item.day ===
                    today.getDate();

                return (

                  <button
                    key={item.key}
                    className={[
                      "calendar-day",

                      !item.currentMonth
                        ? "outside-month"
                        : "",

                      isSelected
                        ? "selected-day"
                        : "",

                      isToday
                        ? "today-day"
                        : "",

                      data
                        ? `intensity-${getIntensity(
                            data.productivity
                          )}`
                        : "",
                    ].join(" ")}
                    onClick={() => {
                      if (
                        item.currentMonth
                      ) {
                        setSelectedDate(
                          dateKey
                        );
                      }
                    }}
                    disabled={
                      !item.currentMonth
                    }
                  >

                    <span className="day-number">
                      {item.day}
                    </span>


                    {data && (
                      <>
                        <span className="day-score">
                          {data.productivity}
                        </span>

                        <span className="day-bottom">

                          <span className="day-task-dot" />

                          {data.completed}/
                          {data.tasks}

                        </span>
                      </>
                    )}


                    {isToday && (
                      <span className="today-label">
                        TODAY
                      </span>
                    )}

                  </button>

                );
              })}

            </div>


            <div className="calendar-legend">

              <span>Less</span>

              <i className="legend-box low" />

              <i className="legend-box medium" />

              <i className="legend-box good" />

              <i className="legend-box excellent" />

              <span>
                More productive
              </span>

            </div>

          </div>


          {/* ==================================================
              SELECTED DAY
          ================================================== */}

          <aside className="selected-day-panel">

            <div className="selected-panel-top">

              <span>
                DAY SNAPSHOT
              </span>

              <ArrowUpRight size={19} />

            </div>


            <div className="selected-date">

              <div className="selected-date-number">

                {selectedDate
                  ? Number(
                      selectedDate.split("-")[2]
                    )
                  : "--"}

              </div>


              <div>

                <strong>

                  {selectedDate
                    ? new Date(
                        `${selectedDate}T12:00:00`
                      ).toLocaleDateString(
                        "en-US",
                        {
                          weekday:
                            "long",
                        }
                      )
                    : "Select a day"}

                </strong>

                <span>

                  {selectedDate
                    ? new Date(
                        `${selectedDate}T12:00:00`
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month:
                            "long",
                          year:
                            "numeric",
                        }
                      )
                    : ""}

                </span>

              </div>

            </div>


            {selectedData ? (

              <>

                <div className="big-productivity">

                  <div className="big-score-ring">

                    <svg viewBox="0 0 120 120">

                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        className="big-ring-track"
                      />

                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        className="big-ring-progress"
                        pathLength="100"
                        strokeDasharray={`${selectedData.productivity} 100`}
                      />

                    </svg>


                    <div>

                      <strong>
                        {selectedData.productivity}%
                      </strong>

                      <span>
                        focus
                      </span>

                    </div>

                  </div>

                </div>


                <div className="day-detail-grid">

                  <div>

                    <CheckCircle2 size={18} />

                    <span>
                      Completed
                    </span>

                    <strong>
                      {selectedData.completed}
                    </strong>

                  </div>


                  <div>

                    <Target size={18} />

                    <span>
                      Total Tasks
                    </span>

                    <strong>
                      {selectedData.tasks}
                    </strong>

                  </div>


                  <div>

                    <Clock3 size={18} />

                    <span>
                      Productive
                    </span>

                    <strong>
                      {formatHours(
                        selectedData.productiveMinutes
                      )}
                    </strong>

                  </div>


                  <div>

                    <Flame size={18} />

                    <span>
                      Energy
                    </span>

                    <strong>

                      {selectedData.productivity >=
                      85
                        ? "High"
                        : selectedData.productivity >=
                          70
                        ? "Good"
                        : "Low"}

                    </strong>

                  </div>

                </div>


                <div className="day-message">

                  <Sparkles size={18} />

                  <div>

                    <strong>

                      {selectedData.productivity >=
                      85
                        ? "You were in the zone."
                        : selectedData.productivity >=
                          70
                        ? "A solid productive day."
                        : "Room to improve tomorrow."}

                    </strong>

                    <p>

                      {selectedData.completed} of{" "}
                      {selectedData.tasks} planned
                      tasks were completed.

                    </p>

                  </div>

                </div>

              </>

            ) : (

              <div className="empty-day">

                <CalendarDays size={34} />

                <strong>
                  No activity recorded
                </strong>

                <p>
                  Plan your day and come back
                  here to see your productivity
                  pattern.
                </p>

              </div>

            )}

          </aside>

        </section>


        {/* ==================================================
            WEEKLY RHYTHM
        ================================================== */}

        <section className="weekly-strip">

          <div className="weekly-title">

            <span>
              WEEKLY RHYTHM
            </span>

            <strong>
              Your productive momentum
            </strong>

          </div>


          <div className="weekly-bars">

            {weeklyScores.map(
              (value, index) => (

                <div
                  className="weekly-bar-item"
                  key={index}
                >

                  <div className="weekly-bar">

                    <div
                      style={{
                        height: `${Math.max(14, value)}%`,
                      }}
                    >
                      <span>
                        {value}
                      </span>
                    </div>

                  </div>

                  <small>
                    {
                      [
                        "M",
                        "T",
                        "W",
                        "T",
                        "F",
                        "S",
                        "S",
                      ][index]
                    }
                  </small>

                </div>

              )
            )}

          </div>

        </section>

      </main>


      {/* ==================================================
          STYLES
      ================================================== */}

      <style>{`

        /* ==================================================
           SAME DASHBOARD HEADER
        ================================================== */

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
          background: linear-gradient(
            135deg,
            #d7794d,
            #a94e38
          );
          box-shadow:
            0 8px 24px rgba(
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


        /* ==================================================
           CALENDAR PAGE
        ================================================== */

        .calendar-page {
          min-height: 100vh;
          padding-bottom: 70px;
          overflow-x: hidden;
          position: relative;
        }


        /* ==================================================
           MAIN
        ================================================== */

        .calendar-container {
          width:
            min(
              1180px,
              calc(100% - 40px)
            );
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }


        /* ==================================================
           HERO
        ================================================== */

        .calendar-hero {
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          padding: 40px 15px 25px;
        }

        .calendar-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a9583e;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 1.8px;
          animation:
            calendarFade
            0.8s ease both;
        }

        .calendar-hero h1 {
          margin: 13px 0 0;
          color: #453126;
          font-size:
            clamp(
              42px,
              5vw,
              66px
            );
          line-height: 1;
          letter-spacing: -2.8px;
          animation:
            calendarHeroIn
            0.9s ease both;
        }

        .calendar-hero h1 span {
          color: #b86245;
          position: relative;
        }

        .calendar-hero p {
          max-width: 580px;
          margin: 18px 0 0;
          color: #795f4e;
          font-size: 15px;
          line-height: 1.65;
          animation:
            calendarFade
            1s ease both;
        }


        /* ==================================================
           ORB
        ================================================== */

        .calendar-hero-orb {
          width: 175px;
          height: 175px;
          position: relative;
          flex-shrink: 0;
          animation:
            orbFloat
            4s ease-in-out infinite;
        }

        .orb-core {
          position: absolute;
          inset: 45px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #a9583e;
          background:
            rgba(
              255,
              247,
              239,
              0.82
            );
          border:
            1px solid
            rgba(
              180,
              94,
              63,
              0.28
            );
          box-shadow:
            0 15px 40px
            rgba(
              133,
              76,
              49,
              0.18
            ),
            inset 0 0 25px
            rgba(
              224,
              137,
              100,
              0.12
            );
          z-index: 2;
        }

        .orb-ring {
          position: absolute;
          border:
            1px solid
            rgba(
              181,
              96,
              64,
              0.25
            );
          border-radius: 50%;
        }

        .orb-ring-one {
          inset: 15px;
          animation:
            orbRotate
            9s linear infinite;
        }

        .orb-ring-two {
          inset: 30px;
          border-style: dashed;
          animation:
            orbRotateReverse
            12s linear infinite;
        }


        /* ==================================================
           STAT CARDS
        ================================================== */

        .calendar-stat-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }

        .calendar-stat-card {
          min-height: 92px;
          padding: 17px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          gap: 13px;
          position: relative;
          overflow: hidden;
          background:
            rgba(
              255,
              249,
              243,
              0.73
            );
          border:
            1px solid
            rgba(
              145,
              87,
              58,
              0.13
            );
          box-shadow:
            0 12px 30px
            rgba(
              119,
              71,
              47,
              0.08
            );
          backdrop-filter: blur(15px);
          animation:
            statIn
            0.7s ease both;
          transition: 0.3s ease;
        }

        .calendar-stat-card:hover {
          transform:
            translateY(-5px);
          border-color:
            rgba(
              188,
              94,
              61,
              0.32
            );
          box-shadow:
            0 17px 38px
            rgba(
              119,
              71,
              47,
              0.12
            ),
            0 0 25px
            rgba(
              207,
              112,
              77,
              0.09
            );
        }

        .calendar-stat-card::after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          right: -45px;
          top: -45px;
          border-radius: 50%;
          background:
            rgba(
              210,
              120,
              83,
              0.1
            );
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 14px;
          display: grid;
          place-items: center;
        }

        .stat-icon.productivity {
          color: #a9583e;
          background: #fae5da;
        }

        .stat-icon.time {
          color: #8c633d;
          background: #f3e8d3;
        }

        .stat-icon.tasks {
          color: #a56d3d;
          background: #f7ead9;
        }

        .stat-icon.streak {
          color: #b75d3f;
          background: #fae0d8;
        }

        .calendar-stat-card span {
          display: block;
          color: #8d7160;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.1px;
          font-weight: 750;
        }

        .calendar-stat-card strong {
          display: block;
          margin-top: 4px;
          color: #453126;
          font-size: 21px;
        }

        .stat-mini-ring {
          width: 38px;
          height: 38px;
          margin-left: auto;
        }

        .stat-mini-ring svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .ring-track {
          fill: none;
          stroke:
            rgba(
              145,
              87,
              58,
              0.12
            );
          stroke-width: 3;
        }

        .ring-progress {
          fill: none;
          stroke: #c56c4b;
          stroke-width: 3;
          stroke-linecap: round;
        }


        /* ==================================================
           MAIN GRID
        ================================================== */

        .calendar-main-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.65fr)
            minmax(310px, 0.75fr);
          gap: 18px;
        }

        .calendar-card,
        .selected-day-panel,
        .weekly-strip {
          background:
            rgba(
              255,
              249,
              243,
              0.75
            );
          border:
            1px solid
            rgba(
              145,
              87,
              58,
              0.13
            );
          box-shadow:
            0 15px 38px
            rgba(
              119,
              71,
              47,
              0.08
            );
          backdrop-filter: blur(16px);
          border-radius: 27px;
        }


        /* ==================================================
           CALENDAR
        ================================================== */

        .calendar-card {
          padding: 23px;
        }

        .calendar-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
        }

        .calendar-section-label,
        .selected-panel-top span {
          color: #a9583e;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 850;
        }

        .calendar-card-header h2 {
          color: #453126;
          font-size: 26px;
          margin: 5px 0 0;
        }

        .calendar-controls {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .today-button,
        .month-button {
          border:
            1px solid
            rgba(
              145,
              87,
              58,
              0.13
            );
          background:
            rgba(
              255,
              255,
              255,
              0.6
            );
          color: #735846;
          border-radius: 11px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .today-button {
          padding: 9px 12px;
          font-size: 11px;
          font-weight: 800;
        }

        .month-button {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
        }

        .today-button:hover,
        .month-button:hover {
          color: #a9583e;
          border-color:
            rgba(
              185,
              95,
              63,
              0.35
            );
          transform:
            translateY(-2px);
          box-shadow:
            0 0 18px
            rgba(
              205,
              106,
              71,
              0.13
            );
        }

        .weekday-row,
        .calendar-grid {
          display: grid;
          grid-template-columns:
            repeat(7, 1fr);
          gap: 7px;
        }

        .weekday-row {
          margin-bottom: 7px;
        }

        .weekday-row div {
          text-align: center;
          color: #a28572;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1px;
          padding: 7px 0;
        }

        .calendar-day {
          min-height: 76px;
          border:
            1px solid
            rgba(
              145,
              87,
              58,
              0.09
            );
          border-radius: 15px;
          background:
            rgba(
              255,
              252,
              248,
              0.64
            );
          cursor: pointer;
          position: relative;
          overflow: hidden;
          text-align: left;
          padding: 9px;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .calendar-day:hover:not(:disabled) {
          transform:
            translateY(-4px)
            scale(1.015);
          border-color:
            rgba(
              185,
              95,
              63,
              0.35
            );
          box-shadow:
            0 10px 24px
            rgba(
              119,
              71,
              47,
              0.12
            ),
            0 0 18px
            rgba(
              211,
              112,
              76,
              0.1
            );
          z-index: 3;
        }

        .calendar-day.selected-day {
          border: 2px solid #bc6849;
          box-shadow:
            0 10px 28px
            rgba(
              167,
              81,
              52,
              0.15
            ),
            0 0 25px
            rgba(
              204,
              103,
              68,
              0.13
            );
          animation:
            selectedPulse
            2s ease-in-out infinite;
        }

        .calendar-day.outside-month {
          opacity: 0.3;
          cursor: default;
          background: transparent;
        }

        .calendar-day.today-day::before {
          content: "";
          position: absolute;
          inset: 4px;
          border-radius: 11px;
          border:
            1px dashed
            rgba(
              183,
              87,
              57,
              0.45
            );
          pointer-events: none;
        }

        .day-number {
          color: #5d4638;
          font-size: 13px;
          font-weight: 800;
        }

        .day-score {
          position: absolute;
          right: 8px;
          top: 8px;
          color: #a9583e;
          font-size: 10px;
          font-weight: 850;
        }

        .day-bottom {
          position: absolute;
          bottom: 9px;
          left: 9px;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #856b59;
          font-size: 9px;
          font-weight: 750;
        }

        .day-task-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #bc6849;
        }

        .today-label {
          position: absolute;
          bottom: 7px;
          right: 7px;
          color: #b55e40;
          font-size: 7px;
          letter-spacing: 0.8px;
          font-weight: 900;
        }


        /* ==================================================
           PRODUCTIVITY INTENSITY
        ================================================== */

        .intensity-low {
          background:
            rgba(
              245,
              226,
              213,
              0.55
            );
        }

        .intensity-medium {
          background:
            rgba(
              249,
              218,
              194,
              0.7
            );
        }

        .intensity-good {
          background:
            rgba(
              246,
              201,
              170,
              0.72
            );
        }

        .intensity-excellent {
          background:
            rgba(
              238,
              179,
              145,
              0.78
            );
        }

        .calendar-legend {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 5px;
          margin-top: 17px;
          color: #967b68;
          font-size: 9px;
        }

        .legend-box {
          width: 13px;
          height: 13px;
          border-radius: 4px;
          display: inline-block;
        }

        .legend-box.low {
          background: #f5e2d5;
        }

        .legend-box.medium {
          background: #f9dac2;
        }

        .legend-box.good {
          background: #f6c9aa;
        }

        .legend-box.excellent {
          background: #eeb391;
        }


        /* ==================================================
           SELECTED DAY
        ================================================== */

        .selected-day-panel {
          padding: 23px;
          min-height: 100%;
          overflow: hidden;
          position: relative;
        }

        .selected-day-panel::before {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          border-radius: 50%;
          right: -100px;
          top: -100px;
          background:
            radial-gradient(
              circle,
              rgba(
                211,
                117,
                78,
                0.13
              ),
              transparent 68%
            );
          animation:
            panelGlow
            5s ease-in-out infinite;
        }

        .selected-panel-top {
          display: flex;
          justify-content: space-between;
          color: #a9583e;
          position: relative;
        }

        .selected-date {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 20px;
          position: relative;
        }

        .selected-date-number {
          width: 55px;
          height: 55px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              #f6c5ad,
              #edaa8a
            );
          color: #633a2b;
          font-size: 23px;
          font-weight: 900;
          box-shadow:
            0 10px 25px
            rgba(
              178,
              85,
              53,
              0.16
            );
        }

        .selected-date strong {
          display: block;
          color: #4d3629;
          font-size: 15px;
        }

        .selected-date span {
          display: block;
          color: #957766;
          font-size: 11px;
          margin-top: 4px;
        }


        /* ==================================================
           SCORE RING
        ================================================== */

        .big-productivity {
          display: grid;
          place-items: center;
          margin: 24px 0;
        }

        .big-score-ring {
          width: 170px;
          height: 170px;
          position: relative;
          display: grid;
          place-items: center;
        }

        .big-score-ring svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .big-ring-track,
        .big-ring-progress {
          fill: none;
          stroke-width: 8;
        }

        .big-ring-track {
          stroke:
            rgba(
              166,
              91,
              61,
              0.1
            );
        }

        .big-ring-progress {
          stroke: #bb6849;
          stroke-linecap: round;
          transition:
            stroke-dasharray
            0.8s ease;
          animation:
            ringGrow
            1.2s ease both;
        }

        .big-score-ring > div {
          position: absolute;
          text-align: center;
        }

        .big-score-ring strong {
          display: block;
          color: #4b3428;
          font-size: 31px;
          letter-spacing: -1px;
        }

        .big-score-ring span {
          color: #967967;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }


        /* ==================================================
           DETAILS
        ================================================== */

        .day-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .day-detail-grid > div {
          padding: 13px;
          border-radius: 16px;
          background:
            rgba(
              255,
              255,
              255,
              0.47
            );
          border:
            1px solid
            rgba(
              145,
              87,
              58,
              0.08
            );
          transition: 0.25s ease;
        }

        .day-detail-grid > div:hover {
          transform:
            translateY(-3px);
          background:
            rgba(
              255,
              255,
              255,
              0.7
            );
        }

        .day-detail-grid svg {
          color: #b76243;
          width: 17px;
        }

        .day-detail-grid span {
          display: block;
          margin-top: 7px;
          color: #987c69;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .day-detail-grid strong {
          display: block;
          color: #4e372a;
          margin-top: 3px;
          font-size: 15px;
        }


        /* ==================================================
           DAY MESSAGE
        ================================================== */

        .day-message {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          padding: 14px;
          border-radius: 17px;
          background:
            linear-gradient(
              135deg,
              rgba(
                248,
                220,
                204,
                0.72
              ),
              rgba(
                255,
                242,
                230,
                0.7
              )
            );
          border:
            1px solid
            rgba(
              184,
              94,
              62,
              0.12
            );
        }

        .day-message svg {
          color: #b35e40;
          flex-shrink: 0;
        }

        .day-message strong {
          color: #603f30;
          font-size: 11px;
        }

        .day-message p {
          color: #8a6e5c;
          font-size: 10px;
          line-height: 1.5;
          margin: 4px 0 0;
        }


        /* ==================================================
           EMPTY
        ================================================== */

        .empty-day {
          min-height: 360px;
          display: grid;
          place-content: center;
          text-align: center;
          color: #a07f69;
          gap: 10px;
        }

        .empty-day svg {
          margin: 0 auto;
          color: #c17a59;
        }

        .empty-day strong {
          color: #654839;
          font-size: 15px;
        }

        .empty-day p {
          max-width: 230px;
          margin: 0 auto;
          font-size: 11px;
          line-height: 1.6;
        }


        /* ==================================================
           WEEKLY RHYTHM
        ================================================== */

        .weekly-strip {
          margin-top: 18px;
          padding: 22px 25px;
          display: flex;
          align-items: center;
          gap: 45px;
        }

        .weekly-title {
          min-width: 170px;
        }

        .weekly-title span {
          display: block;
          color: #a9583e;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 1.4px;
        }

        .weekly-title strong {
          display: block;
          color: #51382a;
          font-size: 13px;
          margin-top: 5px;
        }

        .weekly-bars {
          flex: 1;
          height: 90px;
          display: flex;
          align-items: end;
          justify-content: space-around;
          gap: 15px;
        }

        .weekly-bar-item {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: end;
          gap: 6px;
          flex: 1;
        }

        .weekly-bar {
          height: 68px;
          width: 100%;
          max-width: 55px;
          display: flex;
          align-items: end;
          border-radius:
            9px 9px 5px 5px;
          background:
            rgba(
              180,
              100,
              69,
              0.08
            );
          overflow: hidden;
        }

        .weekly-bar > div {
          width: 100%;
          min-height: 7px;
          display: flex;
          align-items: start;
          justify-content: center;
          padding-top: 4px;
          border-radius:
            9px 9px 4px 4px;
          background:
            linear-gradient(
              to top,
              #b86345,
              #e7a17f
            );
          animation:
            barGrow
            1s ease both;
          transition: 0.3s ease;
        }

        .weekly-bar:hover > div {
          filter: brightness(1.06);
          box-shadow:
            0 0 18px
            rgba(
              190,
              95,
              63,
              0.25
            );
        }

        .weekly-bar span {
          color: #fffaf6;
          font-size: 7px;
          font-weight: 900;
        }

        .weekly-bar-item small {
          color: #9a7d6a;
          font-size: 9px;
          font-weight: 800;
        }


        /* ==================================================
           BACKGROUND ORBITS
        ================================================== */

        .calendar-orbit {
          position: fixed;
          border:
            1px solid
            rgba(
              188,
              102,
              70,
              0.09
            );
          border-radius: 50%;
          pointer-events: none;
        }

        .calendar-orbit-one {
          width: 480px;
          height: 480px;
          right: -280px;
          top: 150px;
          animation:
            orbitSlow
            18s linear infinite;
        }

        .calendar-orbit-two {
          width: 330px;
          height: 330px;
          left: -210px;
          bottom: 100px;
          animation:
            orbitSlowReverse
            14s linear infinite;
        }


        /* ==================================================
           ANIMATIONS
        ================================================== */

        @keyframes calendarHeroIn {
          from {
            opacity: 0;
            transform:
              translateY(24px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        @keyframes calendarFade {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes statIn {
          from {
            opacity: 0;
            transform:
              translateY(18px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        @keyframes orbFloat {
          0%,
          100% {
            transform:
              translateY(0)
              rotate(0deg);
          }

          50% {
            transform:
              translateY(-10px)
              rotate(3deg);
          }
        }

        @keyframes orbRotate {
          to {
            transform:
              rotate(360deg);
          }
        }

        @keyframes orbRotateReverse {
          to {
            transform:
              rotate(-360deg);
          }
        }

        @keyframes selectedPulse {
          0%,
          100% {
            box-shadow:
              0 10px 28px
              rgba(
                167,
                81,
                52,
                0.15
              ),
              0 0 20px
              rgba(
                204,
                103,
                68,
                0.1
              );
          }

          50% {
            box-shadow:
              0 10px 30px
              rgba(
                167,
                81,
                52,
                0.2
              ),
              0 0 28px
              rgba(
                204,
                103,
                68,
                0.17
              );
          }
        }

        @keyframes panelGlow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }

          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes ringGrow {
          from {
            stroke-dasharray:
              0 100;
          }
        }

        @keyframes barGrow {
          from {
            height: 0;
          }
        }

        @keyframes orbitSlow {
          to {
            transform:
              rotate(360deg);
          }
        }

        @keyframes orbitSlowReverse {
          to {
            transform:
              rotate(-360deg);
          }
        }


        /* ==================================================
           RESPONSIVE
        ================================================== */

        @media (max-width: 950px) {

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

          .calendar-stat-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .calendar-main-grid {
            grid-template-columns: 1fr;
          }

          .selected-day-panel {
            min-height: auto;
          }

        }


        @media (max-width: 650px) {

          .dashboard-nav,
          .calendar-container {
            width:
              min(
                calc(100% - 24px),
                1180px
              );
          }

          .dashboard-nav-links {
            gap: 2px;
          }

          .dashboard-nav-link {
            padding:
              9px 9px;
            font-size: 11px;
          }

          .dashboard-logout {
            padding:
              8px 10px;
          }

          .dashboard-logout svg {
            display: none;
          }

          .calendar-hero {
            padding-top: 28px;
          }

          .calendar-hero-orb {
            display: none;
          }

          .calendar-hero h1 {
            font-size: 43px;
          }

          .calendar-stat-grid {
            grid-template-columns: 1fr;
          }

          .calendar-card {
            padding: 15px;
          }

          .calendar-day {
            min-height: 61px;
            padding: 7px;
          }

          .day-score {
            display: none;
          }

          .day-bottom {
            left: 7px;
            bottom: 7px;
          }

          .weekday-row,
          .calendar-grid {
            gap: 4px;
          }

          .calendar-card-header {
            align-items: flex-start;
          }

          .calendar-controls {
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .weekly-strip {
            display: block;
          }

          .weekly-bars {
            margin-top: 20px;
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

          .calendar-page *,
          .calendar-page *::before,
          .calendar-page *::after {
            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              0.01ms !important;
          }

        }

      `}</style>

    </div>
  );
}