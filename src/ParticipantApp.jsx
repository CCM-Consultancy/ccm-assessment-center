import React, { useState, useEffect, useRef } from "react";
import * as db from "./lib/db";

const CCM_RED = "#CC0000";
const LS_USER  = "ccm_p_user";
const LS_PASS  = "ccm_p_pass";
const HEADER_H = 60; // px

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; overflow: hidden; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
`;

const SANS  = "'Plus Jakarta Sans', Arial, sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";

const INPUT = {
  padding: "12px 14px",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  background: "#fff",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: SANS,
  color: "#111",
};

const TEXTAREA = {
  ...INPUT,
  resize: "vertical",
  lineHeight: 1.75,
  minHeight: 160,
};

function btn(bg, color, extra = {}) {
  return {
    padding: "10px 22px",
    background: bg,
    color,
    border: `1px solid ${bg === "#fff" ? "#ddd" : bg}`,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: SANS,
    transition: "opacity 0.15s",
    flexShrink: 0,
    ...extra,
  };
}

const REFLECTION_QUESTIONS = [
  "What is the core problem you identified?",
  "What data did you use to support your analysis?",
  "What are your top 3 recommendations?",
  "What risks did you consider?",
  "What would success look like in 12 months?",
];

function formatTime(seconds) {
  if (seconds === null) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── CCM Logo ──────────────────────────────────────────────────────────────────
function CCMLogo({ scale = 1 }) {
  return (
    <svg width={88 * scale} height={38 * scale} viewBox="0 0 88 38" fill="none">
      <text x="0" y="27" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="30" fill={CCM_RED} letterSpacing="-1">CCM</text>
      <text x="1" y="36" fontFamily="Arial,sans-serif" fontWeight="400" fontSize="8.5" fill="#111" letterSpacing="2.2">CONSULTANCY</text>
    </svg>
  );
}

// ─── Landing Screen ────────────────────────────────────────────────────────────
function LandingScreen({ isMobile, onBegin }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", fontFamily: SANS, overflow: "auto" }}>
      <style>{`${FONTS} body { overflow: auto !important; }`}</style>

      {isMobile && (
        <div style={{ background: "#fff3cd", borderBottom: "1px solid #ffc107", padding: "12px 20px", fontSize: 13, textAlign: "center", color: "#856404" }}>
          ⚠ This assessment is designed for desktop use. For the best experience, please switch to a laptop or desktop computer.
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
        <CCMLogo scale={1.8} />
        <h1 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 700, margin: "2rem 0 0.5rem", color: "#111", textAlign: "center", lineHeight: 1.2 }}>
          Assessment Center
        </h1>
        <p style={{ fontSize: 16, color: "#666", marginBottom: "3rem", textAlign: "center", maxWidth: 500, lineHeight: 1.7, marginTop: "0.75rem" }}>
          Welcome. Please ensure you are in a quiet, private environment with no interruptions before you begin.
        </p>
        <button onClick={onBegin} style={btn(CCM_RED, "#fff", { fontSize: 16, padding: "16px 48px", borderRadius: 10 })}>
          Begin Assessment
        </button>
      </div>

      <footer style={{ padding: "1.5rem", textAlign: "center", fontSize: 12, color: "#bbb" }}>
        CCM Consultancy · Assessment Center Platform
      </footer>
    </div>
  );
}

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ form, setForm, error, loading, onSubmit }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, overflow: "auto" }}>
      <style>{`${FONTS} body { overflow: auto !important; }`}</style>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,.06)", margin: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <CCMLogo scale={1.2} />
          <h2 style={{ fontFamily: SERIF, fontSize: 22, margin: "1.25rem 0 0.25rem", color: "#111" }}>
            Participant Login
          </h2>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            Enter the credentials provided by your administrator.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Username
            </label>
            <input
              style={INPUT}
              type="text"
              autoComplete="username"
              autoFocus
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Your username"
            />
          </div>

          <div style={{ marginBottom: error ? 12 : 24 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              style={INPUT}
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Your password"
            />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={btn(CCM_RED, "#fff", { width: "100%", opacity: loading ? 0.6 : 1, padding: "12px 22px" })}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const READING_SECONDS = 300; // 5 minutes

const AC_INTRO_DEFAULT = "This Assessment Center has been designed to evaluate key leadership competencies relevant to your role. You will complete two parts: a Behavioral Interview and a Case Study exercise. Your responses will be reviewed by a qualified assessor from CCM Consultancy. Please approach each section honestly and draw on real examples from your professional experience.";

// ─── System Check Screen ───────────────────────────────────────────────────────
function SystemCheckScreen({ onContinue }) {
  const ua = navigator.userAgent;
  const isChrome      = /Chrome/.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || window.innerWidth <= 1024;
  const isOnline      = navigator.onLine;
  const isResOk       = window.screen.width >= 1280;

  const canProceed = !isMobileDevice && isOnline;

  const checks = [
    {
      status: isChrome ? "ok" : "warn",
      label:  isChrome
        ? "You are using Google Chrome - recommended"
        : "You are not using Google Chrome. Please switch to Google Chrome before continuing. Other browsers may not support all assessment features.",
    },
    {
      status: !isMobileDevice ? "ok" : "fail",
      label:  !isMobileDevice
        ? "You are using a desktop or laptop - required"
        : "Mobile and tablet devices are not permitted. Please use a desktop or laptop computer.",
    },
    {
      status: isOnline ? "ok" : "fail",
      label:  isOnline
        ? "Your internet connection is active"
        : "No internet connection detected. Please check your connection before continuing.",
    },
    {
      status: isResOk ? "ok" : "warn",
      label:  isResOk
        ? "Screen resolution is sufficient"
        : "Your screen resolution may be too small. For best results use a screen with at least 1280px width.",
    },
  ];

  const iconFor = (status) =>
    status === "ok"   ? { icon: "✅", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" } :
    status === "warn" ? { icon: "⚠️", color: "#92400e", bg: "#fffbeb", border: "#fde68a" } :
                        { icon: "❌", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, padding: "2rem 1rem", overflow: "auto" }}>
      <style>{`${FONTS} body { overflow: auto !important; }`}</style>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 580, boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <CCMLogo scale={1.1} />
          <h2 style={{ fontFamily: SERIF, fontSize: 24, margin: "1.25rem 0 0.4rem", color: "#111" }}>
            Before You Begin: System Check
          </h2>
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
            Please confirm your setup meets the required standards.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.75rem" }}>
          {checks.map((c, i) => {
            const { icon, color, bg, border } = iconFor(c.status);
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", background: bg, borderRadius: 10, border: `1px solid ${border}` }}>
                <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
                <span style={{ fontSize: 13, color, lineHeight: 1.6, fontWeight: c.status !== "ok" ? 600 : 400 }}>{c.label}</span>
              </div>
            );
          })}
        </div>

        {!canProceed && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#dc2626", fontWeight: 600, marginBottom: "1.25rem", textAlign: "center" }}>
            You cannot proceed until the required checks pass.
          </div>
        )}

        <button
          onClick={onContinue}
          disabled={!canProceed}
          style={btn(canProceed ? CCM_RED : "#ccc", "#fff", { width: "100%", cursor: canProceed ? "pointer" : "not-allowed", fontSize: 15, padding: "13px 22px" })}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Welcome / AC Introduction Screen ─────────────────────────────────────────
function WelcomeScreen({ session, participant, onBegin }) {
  const [agreed, setAgreed] = useState(false);

  const firstModule  = session?.modules?.[0];
  const cohort       = session?.cohort;
  const level        = session?.level;
  const levelName    = (level?.name || "").toLowerCase();
  const isDirector   = levelName.includes("director");
  const isManager    = levelName.includes("manager");

  const qMins        = isDirector ? (firstModule?.dir_q_mins ?? 75)   : isManager ? (firstModule?.mgr_q_mins ?? 60)   : (firstModule?.sup_q_mins ?? 45);
  const taskMins     = isDirector ? (firstModule?.dir_task_mins ?? 60) : isManager ? (firstModule?.mgr_task_mins ?? 45) : (firstModule?.sup_task_mins ?? 30);
  const breakMins    = firstModule?.break_duration_mins ?? 10;
  const numQuestions = (firstModule?.questions || []).length;
  const introText    = firstModule?.ac_intro_text || AC_INTRO_DEFAULT;

  const rules = [
    { icon: "👁", title: "Tab switching is monitored", body: "Every time you switch away from this tab it is recorded and logged. Assessors will be able to see how many times you switched tabs." },
    { icon: "⏱", title: "Your timer starts when you click Begin", body: "Each part has a time limit. Your timer begins the moment you click Begin Assessment below." },
    { icon: "⛔", title: "Copy and paste is disabled", body: "To ensure the integrity of your assessment, pasting text into answer fields is not permitted." },
    { icon: "🎙", title: "Audio recording available (optional)", body: "You may choose to record your answers by voice in Part 1. Microphone access will be requested if you select this option." },
  ];

  const guidelines = [
    "Use Google Chrome on a laptop or desktop only",
    "Do not use a mobile phone or tablet",
    "Tab switching is monitored and logged in both parts",
    "Copy and paste is disabled in answer fields",
    "Audio recording requires microphone permission if selected",
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, padding: "2rem 1rem", overflow: "auto" }}>
      <style>{`${FONTS} body { overflow: auto !important; }`}</style>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 640, boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <CCMLogo scale={1.1} />
        </div>

        {/* Title */}
        <h2 style={{ fontFamily: SERIF, fontSize: 26, margin: "0 0 0.35rem", color: "#111", lineHeight: 1.25 }}>
          Welcome to the CCM Assessment Center
        </h2>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 1.75rem" }}>
          {firstModule?.title || "Assessment Module"}
          {cohort?.name ? ` - ${cohort.name}` : ""}
        </p>

        {/* Section 1 — About This Assessment */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: CCM_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            About This Assessment
          </div>
          <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, margin: 0 }}>{introText}</p>
        </div>

        {/* Section 2 — What to Expect */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: CCM_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            What to Expect
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Part 1: Behavioral Interview", time: qMins, detail: `You will be asked ${numQuestions > 0 ? numQuestions : "a series of"} question${numQuestions !== 1 ? "s" : ""} about your professional experience. Answer by typing your response.` },
              { label: "Break", time: breakMins, detail: "A short break between the two parts." },
              { label: "Part 2: Case Study", time: taskMins, detail: "You will read a business case and complete a series of tasks." },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "12px 16px", background: "#f8f9fb", borderRadius: 10, border: "1px solid #eee" }}>
                <div style={{ minWidth: 52, flexShrink: 0, fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: CCM_RED, paddingTop: 1 }}>
                  {row.time}m
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.55 }}>{row.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 — Assessment Rules */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: CCM_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Assessment Rules
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rules.map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", background: "#f8f9fb", borderRadius: 10, border: "1px solid #eee" }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{rule.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 3 }}>{rule.title}</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{rule.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 — Guidelines */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: CCM_RED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Guidelines
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 1.1rem", display: "flex", flexDirection: "column", gap: 6 }}>
            {guidelines.map((g, i) => (
              <li key={i} style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{g}</li>
            ))}
          </ul>
        </div>

        {/* Checkbox */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: "1.5rem", padding: "14px 16px", background: agreed ? "#fff7f7" : "#f8f9fb", borderRadius: 10, border: `1px solid ${agreed ? CCM_RED + "44" : "#eee"}`, transition: "all 0.2s" }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 1, accentColor: CCM_RED, flexShrink: 0 }}
          />
          <span style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>
            I have read, understood, and agree to all of the above conditions. I am ready to begin my assessment.
          </span>
        </label>

        <button
          onClick={onBegin}
          disabled={!agreed}
          style={btn(agreed ? CCM_RED : "#ccc", "#fff", { width: "100%", cursor: agreed ? "pointer" : "not-allowed", fontSize: 15, padding: "13px 22px" })}
        >
          Begin Assessment →
        </button>
      </div>
    </div>
  );
}

// ─── Done Screen ───────────────────────────────────────────────────────────────
function DoneScreen({ completionTimeSec }) {
  const minutes = Math.floor(completionTimeSec / 60);
  const seconds = completionTimeSec % 60;
  const timeStr = completionTimeSec > 0
    ? `${minutes} minute${minutes !== 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, overflow: "auto" }}>
      <style>{`${FONTS} body { overflow: auto !important; }`}</style>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "3rem 2.5rem", width: "100%", maxWidth: 520, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,.06)", margin: "2rem" }}>
        <div style={{ fontSize: 60, marginBottom: "1rem" }}>✅</div>
        <CCMLogo scale={1.1} />
        <h2 style={{ fontFamily: SERIF, fontSize: 28, margin: "1.5rem 0 0.75rem", color: "#111" }}>
          Assessment Complete
        </h2>
        <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, marginBottom: timeStr ? "1rem" : "2rem" }}>
          Thank you for completing your assessment. Your responses have been saved and will be reviewed by your assessor.
        </p>
        {timeStr && (
          <div style={{ background: "#f8f9fb", border: "1px solid #eee", borderRadius: 10, padding: "14px 20px", marginBottom: "2rem", fontSize: 14, color: "#555" }}>
            Time taken: <strong style={{ color: "#111" }}>{timeStr}</strong>
          </div>
        )}
        <p style={{ fontSize: 13, color: "#aaa" }}>
          You may now close this window. If you have any questions, please contact your assessment administrator.
        </p>
      </div>
    </div>
  );
}

// ─── Break Screen ─────────────────────────────────────────────────────────────
function BreakScreen({ breakDurationSecs, participant, tabSwitches, showTabWarning, setShowTabWarning, onResume, onSkip, onSignOut }) {
  const MIN_RESUME_SECS = 120; // 2-minute minimum lock
  const [timeLeft, setTimeLeft]   = useState(breakDurationSecs);
  const [canResume, setCanResume] = useState(false);
  const [expired, setExpired]     = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const remaining = Math.max(0, breakDurationSecs - elapsed);
      setTimeLeft(remaining);
      if (elapsed >= MIN_RESUME_SECS) setCanResume(true);
      if (remaining === 0) { setExpired(true); clearInterval(interval); }
    }, 1000);
    return () => clearInterval(interval);
  }, [breakDurationSecs]);

  const active = canResume || expired;
  const pct    = Math.round(((breakDurationSecs - timeLeft) / breakDurationSecs) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: SANS, background: "#f7f8fa" }}>
      <style>{FONTS}</style>

      {/* Header */}
      <header style={{ height: HEADER_H, background: "#fff", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", flexShrink: 0, boxShadow: "0 1px 6px rgba(0,0,0,.05)" }}>
        <CCMLogo />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {tabSwitches > 0 && (
            <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "4px 10px", borderRadius: 20, border: "1px solid #fca5a5", fontWeight: 600 }}>
              ⚠ {tabSwitches} tab switch{tabSwitches !== 1 ? "es" : ""}
            </div>
          )}
          <span style={{ fontSize: 13, color: "#666" }}>{participant?.name || participant?.username}</span>
          <button onClick={onSignOut} style={btn("#fff", "#555", { fontSize: 12, padding: "6px 14px" })}>Sign out</button>
        </div>
      </header>

      {/* Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 20, padding: "3rem 2.5rem", maxWidth: 520, width: "100%", boxShadow: "0 4px 32px rgba(0,0,0,.07)", textAlign: "center" }}>
          <CCMLogo scale={1.1} />

          <h2 style={{ fontFamily: SERIF, fontSize: 28, margin: "1.5rem 0 0.5rem", color: "#111" }}>Break Time</h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, margin: "0 0 2rem" }}>
            You have completed Part 1. Take a short break before Part 2 begins.
          </p>

          {/* Countdown */}
          <div style={{ fontFamily: "monospace", fontSize: 72, fontWeight: 700, letterSpacing: "0.04em", color: expired ? "#dc2626" : timeLeft < 60 ? "#f59e0b" : "#111", lineHeight: 1, marginBottom: "1.25rem" }}>
            {formatTime(timeLeft)}
          </div>

          {/* Progress bar */}
          <div style={{ background: "#f0f0f0", borderRadius: 8, height: 6, margin: "0 auto 1.25rem", maxWidth: 320, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: expired ? "#dc2626" : CCM_RED, borderRadius: 8, transition: "width 1s linear" }} />
          </div>

          {/* Progress steps */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.75rem" }}>
            <span style={{ color: "#16a34a" }}>Part 1 Complete</span>
            <span>·</span>
            <span style={{ color: CCM_RED, fontWeight: 700 }}>Break</span>
            <span>·</span>
            <span>Part 2 Upcoming</span>
          </div>

          {/* Status message */}
          {expired ? (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#dc2626", fontWeight: 600, marginBottom: "1.5rem" }}>
              Your break time has ended. Please resume your assessment.
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#888", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              {active
                ? "Your assessment is paused. You may resume when ready."
                : `Your assessment is paused. Please return before the timer ends.`}
            </p>
          )}

          <button
            onClick={onResume}
            disabled={!active}
            style={btn(active ? CCM_RED : "#ccc", "#fff", { width: "100%", cursor: active ? "pointer" : "not-allowed", fontSize: 16, padding: "14px 22px", borderRadius: 10 })}
          >
            {active ? "Resume Assessment →" : `Resume available in ${formatTime(Math.max(0, MIN_RESUME_SECS - (breakDurationSecs - timeLeft)))}…`}
          </button>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button
              onClick={e => { e.stopPropagation(); onSkip(); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#aaa", textDecoration: "underline", fontFamily: SANS, padding: "12px 20px", minHeight: 44, display: "inline-block", lineHeight: 1 }}
            >
              Skip break and proceed to Part 2 →
            </button>
          </div>
        </div>
      </div>

      {/* Tab warning modal */}
      {showTabWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "2.5rem", maxWidth: 440, width: "90%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>
            <div style={{ fontSize: 48, marginBottom: "0.75rem" }}>⚠️</div>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, marginBottom: "0.75rem", color: "#dc2626" }}>Tab Switch Detected</h2>
            <p style={{ fontSize: 14, color: "#555", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              You switched away from this assessment tab during your break. This has been logged.<br />
              <strong style={{ color: "#111" }}>Total switches recorded: {tabSwitches}</strong>
            </p>
            <button onClick={() => setShowTabWarning(false)} style={btn(CCM_RED, "#fff", { width: "100%", padding: "12px 22px" })}>
              Return to Break
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Part 2 Transition Screen ─────────────────────────────────────────────────
function Part2TransitionScreen({ participant, tabSwitches, onBeginPart2, onSignOut }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: SANS }}>
      <style>{FONTS}</style>
      <header style={{ height: HEADER_H, background: "#fff", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", flexShrink: 0, boxShadow: "0 1px 6px rgba(0,0,0,.05)" }}>
        <CCMLogo />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {tabSwitches > 0 && (
            <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "4px 10px", borderRadius: 20, border: "1px solid #fca5a5", fontWeight: 600 }}>
              ⚠ {tabSwitches} tab switch{tabSwitches !== 1 ? "es" : ""}
            </div>
          )}
          <span style={{ fontSize: 13, color: "#666" }}>{participant?.name || participant?.username}</span>
          <button onClick={onSignOut} style={btn("#fff", "#555", { fontSize: 12, padding: "6px 14px" })}>Sign out</button>
        </div>
      </header>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f8fa", padding: "2rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "3rem 2.5rem", maxWidth: 560, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,.06)", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: "1rem" }}>✅</div>
          <h2 style={{ fontFamily: SERIF, fontSize: 28, margin: "0 0 1rem", color: "#111" }}>Part 1 Complete</h2>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: "2rem" }}>
            You have completed the behavioral questions. Part 2 will now begin. In this section you will complete a series of tasks based on the case study. Your timer will start when you click Begin Part 2.
          </p>
          <button onClick={onBeginPart2} style={btn(CCM_RED, "#fff", { fontSize: 16, padding: "14px 36px", borderRadius: 10 })}>
            Begin Part 2 →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Part 1 Screen (full-width, no case study) ───────────────────────────────
function Part1Screen({ moduleTitle, moduleIdx, moduleCount, questions, competencies, currentQIdx, setCurrentQIdx, answers, setAnswers, moduleType, timeLeft, onShowSubmit }) {
  const q = questions[currentQIdx];
  const isLast = currentQIdx === questions.length - 1;
  const timerUrgent = timeLeft !== null && timeLeft < 300;
  const comp = (competencies || []).find(c => c.id === q?.competency_id);

  // ── Recording state ────────────────────────────────────────────────────────
  const [inputMode, setInputMode]             = useState("text");   // "text" | "audio"
  const [recState, setRecState]               = useState("idle");   // "idle" | "requesting" | "recording" | "stopped"
  const [transcript, setTranscript]           = useState("");
  const [interimText, setInterimText]         = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [recSecs, setRecSecs]                 = useState(0);
  const [audioUrl, setAudioUrl]               = useState(null);
  const [micDenied, setMicDenied]             = useState(false);
  const [noSpeechAPI, setNoSpeechAPI]         = useState(false);
  const [unconfirmedWarn, setUnconfirmedWarn] = useState(false);
  const [pendingNav, setPendingNav]           = useState(null);     // number | "submit"

  const mrRef        = useRef(null);  // MediaRecorder
  const chunksRef    = useRef([]);
  const srRef        = useRef(null);  // SpeechRecognition
  const timerRef     = useRef(null);
  const finalTextRef = useRef("");    // accumulated final transcript segments
  const sessionRef   = useRef(0);    // invalidates stale onstop callbacks

  function handlePaste(e) { e.preventDefault(); }

  // Reset recording when navigating to a different question
  useEffect(() => {
    clearInterval(timerRef.current);
    if (srRef.current) { try { srRef.current.stop(); } catch {} srRef.current = null; }
    if (mrRef.current && mrRef.current.state !== "inactive") { try { mrRef.current.stop(); } catch {} }
    sessionRef.current++;
    setInputMode("text");
    setRecState("idle");
    setTranscript("");
    setInterimText("");
    setAdditionalNotes("");
    setRecSecs(0);
    setAudioUrl(null);
    setMicDenied(false);
    setNoSpeechAPI(false);
    setUnconfirmedWarn(false);
    setPendingNav(null);
    finalTextRef.current = "";
  }, [currentQIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      sessionRef.current++;
      if (srRef.current) { try { srRef.current.stop(); } catch {} }
      if (mrRef.current && mrRef.current.state !== "inactive") { try { mrRef.current.stop(); } catch {} }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function doStopRecording() {
    clearInterval(timerRef.current);
    if (srRef.current) { try { srRef.current.stop(); } catch {} srRef.current = null; }
    if (mrRef.current && mrRef.current.state !== "inactive") { try { mrRef.current.stop(); } catch {} }
    setInterimText("");
    setRecState("stopped");
  }

  async function startRecording() {
    setRecState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const session = sessionRef.current;

      // MediaRecorder
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        if (sessionRef.current !== session) { stream.getTracks().forEach(t => t.stop()); return; }
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();

      // SpeechRecognition
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        finalTextRef.current = "";
        rec.onresult = e => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalTextRef.current += e.results[i][0].transcript + " ";
            else interim += e.results[i][0].transcript;
          }
          setTranscript(finalTextRef.current);
          setInterimText(interim);
        };
        rec.onerror = () => {};
        try { rec.start(); srRef.current = rec; } catch {}
      } else {
        setNoSpeechAPI(true);
      }

      // Timer
      const t0 = Date.now();
      timerRef.current = setInterval(() => setRecSecs(Math.floor((Date.now() - t0) / 1000)), 500);

      setRecState("recording");
      setMicDenied(false);
    } catch {
      setMicDenied(true);
      setInputMode("text");
      setRecState("idle");
    }
  }

  function confirmAnswer() {
    const finalTranscript = transcript.trim();
    setAnswers(prev => ({
      ...prev,
      [q.id]: {
        type: "audio",
        text: finalTranscript,
        transcript: finalTranscript,
        additional_notes: additionalNotes.trim(),
        has_audio: true,
      },
    }));
    setRecState("idle");
  }

  function tryNavigate(target) {
    if (recState === "recording") {
      alert("Please stop your recording before proceeding.");
      return;
    }
    if (recState === "stopped") {
      setPendingNav(target);
      setUnconfirmedWarn(true);
      return;
    }
    if (target === "submit") onShowSubmit();
    else setCurrentQIdx(target);
  }

  function discardAndContinue() {
    clearInterval(timerRef.current);
    sessionRef.current++;
    if (srRef.current) { try { srRef.current.stop(); } catch {} srRef.current = null; }
    if (mrRef.current && mrRef.current.state !== "inactive") { try { mrRef.current.stop(); } catch {} }
    setUnconfirmedWarn(false);
    const target = pendingNav;
    if (target === "submit") onShowSubmit();
    else setCurrentQIdx(target);
  }

  // Derived: current question's saved answer
  const curAns     = q ? answers[q.id] : undefined;
  const curAnsText = typeof curAns === "string" ? curAns : (curAns?.text || "");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", background: "#f7f8fa" }}>
      {/* Sub-header: module info + timer + label */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "12px 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Module {moduleIdx + 1} of {moduleCount}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginTop: 2 }}>{moduleTitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {timeLeft !== null && (
            <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: timerUrgent ? "#dc2626" : "#111", background: timerUrgent ? "#fef2f2" : "#f5f5f5", padding: "5px 13px", borderRadius: 8, border: `1px solid ${timerUrgent ? "#fca5a5" : "#e5e5e5"}`, letterSpacing: "0.05em", animation: timerUrgent ? "blink 1.2s step-end infinite" : "none" }}>
              {formatTime(timeLeft)}
            </div>
          )}
          <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Part 1: Behavioral Questions
          </span>
          {isLast && questions.length > 0 && (
            <button onClick={() => tryNavigate("submit")} style={btn(CCM_RED, "#fff", { fontSize: 12, padding: "6px 14px" })}>
              {moduleType === "both" ? "Submit Part 1" : "Submit"}
            </button>
          )}
        </div>
      </div>

      {/* Question body */}
      <div style={{ flex: 1, maxWidth: 860, margin: "0 auto", width: "100%", padding: "2.5rem 2rem 3rem" }}>
        {questions.length === 0 ? (
          <div style={{ color: "#aaa", textAlign: "center", fontSize: 14 }}>No questions found for this module.</div>
        ) : (
          <>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: "1.75rem", flexWrap: "wrap" }}>
              {questions.map((qu, i) => {
                const a = answers[qu.id];
                const answered = a && (typeof a === "string" ? a.trim() : (a.text || a.transcript));
                return (
                  <div key={i} title={`Question ${i + 1}`}
                    style={{ width: 10, height: 10, borderRadius: "50%", cursor: "pointer", background: i === currentQIdx ? CCM_RED : answered ? "#16a34a" : "#ddd", transition: "background 0.2s" }}
                    onClick={() => tryNavigate(i)}
                  />
                );
              })}
            </div>

            {/* Competency tag + question number */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              {comp && (
                <span style={{ fontSize: 11, fontWeight: 700, background: "#fef2f2", color: CCM_RED, borderRadius: 6, padding: "3px 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {comp.name}
                </span>
              )}
              <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Question {currentQIdx + 1} of {questions.length}
              </span>
            </div>

            {q && (
              <>
                <p style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.65, color: "#111", margin: "0 0 1.5rem" }}>
                  {q.text}
                </p>

                {/* Mic denied banner */}
                {micDenied && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: "1rem" }}>
                    Microphone access was denied. Please type your answer below.
                  </div>
                )}

                {/* Mode toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
                  <button
                    onClick={() => setInputMode("text")}
                    style={btn(inputMode === "text" ? CCM_RED : "#fff", inputMode === "text" ? "#fff" : "#555", { fontSize: 13, padding: "8px 18px" })}
                  >
                    ✏️ Type my answer
                  </button>
                  <button
                    onClick={() => setInputMode("audio")}
                    style={btn(inputMode === "audio" ? CCM_RED : "#fff", inputMode === "audio" ? "#fff" : "#555", { fontSize: 13, padding: "8px 18px" })}
                  >
                    🎤 Record my answer
                  </button>
                </div>

                {/* ── TEXT MODE ─────────────────────────────────────────────── */}
                {inputMode === "text" && (
                  <textarea
                    style={{ ...TEXTAREA, minHeight: 220 }}
                    value={curAnsText}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    onPaste={handlePaste}
                    placeholder="Type your response here… (copy and paste is disabled)"
                  />
                )}

                {/* ── AUDIO MODE ────────────────────────────────────────────── */}
                {inputMode === "audio" && (
                  <div style={{ border: "1px solid #e8e8e8", borderRadius: 12, padding: "1.5rem", background: "#fff" }}>

                    {/* IDLE - no confirmed answer yet */}
                    {recState === "idle" && curAns?.type !== "audio" && (
                      <div style={{ textAlign: "center", padding: "1rem 0" }}>
                        <button
                          onClick={startRecording}
                          style={btn(CCM_RED, "#fff", { fontSize: 15, padding: "12px 32px", borderRadius: 10 })}
                        >
                          🎤 Start Recording
                        </button>
                        <p style={{ fontSize: 12, color: "#aaa", marginTop: 10, marginBottom: 0 }}>
                          Your speech will be transcribed automatically as you speak.
                        </p>
                      </div>
                    )}

                    {/* IDLE - confirmed audio answer */}
                    {recState === "idle" && curAns?.type === "audio" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <span style={{ fontSize: 12, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, padding: "2px 10px", fontWeight: 700 }}>
                            Answer recorded
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: "#333", background: "#f8f9fb", border: "1px solid #e8e8e8", borderRadius: 8, padding: "12px 14px", lineHeight: 1.75, marginBottom: 8, whiteSpace: "pre-wrap" }}>
                          {curAns.transcript || curAns.text || <span style={{ color: "#bbb", fontStyle: "italic" }}>No transcript captured.</span>}
                        </div>
                        {curAns.additional_notes && (
                          <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>
                            <strong>Additional notes:</strong> {curAns.additional_notes}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setAnswers(prev => ({ ...prev, [q.id]: undefined }));
                            setTranscript(""); setAudioUrl(null);
                            finalTextRef.current = "";
                          }}
                          style={btn("#fff", "#555", { fontSize: 12 })}
                        >
                          🔄 Re-record
                        </button>
                      </div>
                    )}

                    {/* REQUESTING */}
                    {recState === "requesting" && (
                      <div style={{ textAlign: "center", padding: "1rem 0", color: "#666", fontSize: 13 }}>
                        Requesting microphone access…
                      </div>
                    )}

                    {/* RECORDING */}
                    {recState === "recording" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1rem", padding: "10px 16px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fca5a5" }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#dc2626", animation: "pulse 1.2s ease-in-out infinite", flexShrink: 0 }} />
                          <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#dc2626", letterSpacing: "0.04em" }}>
                            Recording... {formatTime(recSecs)}
                          </span>
                          <button
                            onClick={doStopRecording}
                            style={btn("#dc2626", "#fff", { fontSize: 13, padding: "6px 18px", marginLeft: "auto" })}
                          >
                            ⏹ Stop
                          </button>
                        </div>

                        {noSpeechAPI ? (
                          <>
                            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#92400e", marginBottom: "1rem" }}>
                              Live transcription is not available in this browser. Your audio will be saved but please also type a summary below.
                            </div>
                            <textarea
                              style={{ ...TEXTAREA, minHeight: 100 }}
                              value={transcript}
                              onChange={e => { setTranscript(e.target.value); finalTextRef.current = e.target.value; }}
                              onPaste={handlePaste}
                              placeholder="Type a summary of your spoken answer here…"
                            />
                          </>
                        ) : (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              Live transcript (auto-generated):
                            </div>
                            <div style={{ minHeight: 80, padding: "10px 14px", background: "#f8f9fb", border: "1px solid #e8e8e8", borderRadius: 8, fontSize: 13, lineHeight: 1.75 }}>
                              {transcript
                                ? <><span style={{ color: "#111" }}>{transcript}</span><span style={{ color: "#aaa" }}>{interimText}</span></>
                                : <span style={{ color: "#bbb" }}>Your speech will appear here as you speak…{interimText && <span style={{ color: "#aaa" }}> {interimText}</span>}</span>
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STOPPED */}
                    {recState === "stopped" && (
                      <div>
                        <div style={{ marginBottom: "1rem" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Play back your answer
                          </div>
                          {audioUrl
                            ? <audio src={audioUrl} controls style={{ width: "100%", borderRadius: 8 }} />
                            : <div style={{ fontSize: 12, color: "#aaa" }}>Audio playback unavailable.</div>
                          }
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Your transcript:
                          </div>
                          <div style={{ padding: "10px 14px", background: "#f8f9fb", border: "1px solid #e8e8e8", borderRadius: 8, fontSize: 13, lineHeight: 1.75, color: "#333", whiteSpace: "pre-wrap", minHeight: 60 }}>
                            {transcript || <span style={{ color: "#bbb", fontStyle: "italic" }}>No transcript captured.</span>}
                          </div>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6 }}>
                            Add any additional notes (optional):
                          </div>
                          <textarea
                            style={{ ...TEXTAREA, minHeight: 80 }}
                            value={additionalNotes}
                            onChange={e => setAdditionalNotes(e.target.value)}
                            onPaste={handlePaste}
                            placeholder="Any points you want to add to your recorded response…"
                          />
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button
                            onClick={() => {
                              setRecState("idle");
                              setTranscript(""); setInterimText(""); setAudioUrl(null);
                              setAdditionalNotes(""); finalTextRef.current = "";
                            }}
                            style={btn("#fff", "#555", { fontSize: 13 })}
                          >
                            🔄 Re-record
                          </button>
                          <button onClick={confirmAnswer} style={btn(CCM_RED, "#fff", { fontSize: 13 })}>
                            Use this answer →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", gap: 12 }}>
                  <button
                    onClick={() => tryNavigate(Math.max(0, currentQIdx - 1))}
                    disabled={currentQIdx === 0}
                    style={btn("#fff", "#444", { opacity: currentQIdx === 0 ? 0.35 : 1, cursor: currentQIdx === 0 ? "default" : "pointer" })}
                  >
                    ← Previous
                  </button>
                  <div style={{ display: "flex", gap: 10 }}>
                    {!isLast && (
                      <button onClick={() => tryNavigate(Math.min(questions.length - 1, currentQIdx + 1))} style={btn(CCM_RED, "#fff")}>
                        Next →
                      </button>
                    )}
                    {isLast && (
                      <button onClick={() => tryNavigate("submit")} style={btn(CCM_RED, "#fff")}>
                        {moduleType === "both" ? "Submit Part 1" : "Submit Assessment"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Unconfirmed recording warning */}
      {unconfirmedWarn && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 420, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>
            <h3 style={{ fontFamily: SERIF, margin: "0 0 0.75rem", fontSize: 20 }}>Unconfirmed recording</h3>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              You have an unconfirmed recording. Do you want to discard it and move on?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setUnconfirmedWarn(false)} style={btn("#fff", "#555", { fontSize: 13 })}>
                Stay and confirm
              </button>
              <button onClick={discardAndContinue} style={btn(CCM_RED, "#fff", { fontSize: 13 })}>
                Discard and continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Scenario Panel (left — Part 2 only) ─────────────────────────────────────
function ScenarioPanel({ scenario, moduleTitle, moduleIdx, moduleCount, assessPhase, readingTimeLeft }) {
  const readingDone = readingTimeLeft <= 0;

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to print the case study."); return; }
    function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    const caseHtml   = esc(scenario?.case_study_text || "").replace(/\n/g, "<br>");
    const appendHtml = scenario?.appendix_text
      ? `<div class="section"><h2>Appendix</h2><div class="body-text">${esc(scenario.appendix_text).replace(/\n/g, "<br>")}</div></div>`
      : "";
    const imagesHtml = [1, 2, 3].map(n => {
      const url = scenario?.[`image_${n}_url`];
      const cap = scenario?.[`image_${n}_caption`];
      return url ? `<div class="img-wrap"><img src="${url}" alt="${esc(cap)}"/>${cap ? `<p class="caption">${esc(cap)}</p>` : ""}</div>` : "";
    }).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>${esc(moduleTitle)}: Case Study</title><style>
      body{font-family:Georgia,serif;padding:40px;color:#111;max-width:800px;margin:0 auto;font-size:13px}
      h1{font-size:22px;margin-bottom:4px}h2{font-size:16px;color:#444;margin:24px 0 10px;border-bottom:1px solid #eee;padding-bottom:6px}
      .body-text{line-height:1.85;white-space:pre-wrap}.section{margin-top:24px}
      .img-wrap{margin:16px 0}img{max-width:100%;border:1px solid #ddd;border-radius:4px}
      .caption{font-size:11px;color:#888;text-align:center;font-style:italic;margin-top:6px}
      .footer{margin-top:40px;padding-top:10px;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:right}
      @page{margin:2cm;size:A4 portrait}
    </style></head><body>
      <h1>${esc(moduleTitle)}</h1><h2>Case Study</h2>
      <div class="body-text">${caseHtml}</div>
      ${appendHtml}${imagesHtml}
      <div class="footer">CCM Confidential</div>
      <script>window.onload=function(){window.print()};window.onafterprint=function(){window.close()}</script>
    </body></html>`);
    win.document.close();
  }

  if (!scenario?.case_study_text && assessPhase !== "presentation") {
    return (
      <div style={{ padding: "3rem 2rem", color: "#bbb", fontSize: 14, textAlign: "center" }}>
        No case study text for this module.
      </div>
    );
  }

  return (
    <div>
      {/* Reading timer banner + print button — sticky at the top of the left panel */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        padding: "10px 1.5rem",
        background: readingDone ? "#f0fdf4" : "#fffbeb",
        borderBottom: `1px solid ${readingDone ? "#86efac" : "#fde68a"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {readingDone ? (
            <>
              <span style={{ fontSize: 15 }}>✓</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                Reading time complete. You may now answer.
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 15 }}>📖</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
                Please read the case study. Time remaining:{" "}
                <span style={{ fontFamily: "monospace", fontSize: 14 }}>{formatTime(readingTimeLeft)}</span>
              </span>
            </>
          )}
        </div>
        <button
          onClick={handlePrint}
          style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS, color: "#555", flexShrink: 0 }}
        >
          🖨 Print Case Study
        </button>
      </div>

      <div style={{ padding: "2rem" }}>
      <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 6 }}>
        Module {moduleIdx + 1} of {moduleCount}{assessPhase === "presentation" ? " · Presentation" : ""}
      </div>
      <h2 style={{ fontFamily: SERIF, fontSize: 22, margin: "0 0 1.5rem", color: "#111", lineHeight: 1.3 }}>
        {moduleTitle}
      </h2>

      {scenario?.case_study_text && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Case Study
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", color: "#222" }}>
            {scenario.case_study_text}
          </div>

          {scenario.appendix_text && (
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                Appendix
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.85, whiteSpace: "pre-wrap", color: "#444" }}>
                {scenario.appendix_text}
              </div>
            </div>
          )}

          {[1, 2, 3].map(n => {
            const url = scenario[`image_${n}_url`];
            const cap = scenario[`image_${n}_caption`];
            if (!url) return null;
            return (
              <div key={n} style={{ marginTop: "1.5rem" }}>
                <img src={url} alt={cap || `Figure ${n}`} style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #eee" }} />
                {cap && <p style={{ fontSize: 12, color: "#888", marginTop: 6, textAlign: "center", fontStyle: "italic" }}>{cap}</p>}
              </div>
            );
          })}

          {scenario.file_url && (
            <div style={{ marginTop: "1.5rem", padding: "12px 16px", background: "#f8f9fb", borderRadius: 8, border: "1px solid #e8e8e8" }}>
              <a href={scenario.file_url} target="_blank" rel="noopener noreferrer" style={{ color: CCM_RED, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                📄 {scenario.file_name || "View attached document"}
              </a>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

// ─── Question Panel (right) ───────────────────────────────────────────────────
function QuestionPanel({ questions, currentQIdx, setCurrentQIdx, answers, setAnswers, moduleType, onSubmit, readingLocked }) {
  const q = questions[currentQIdx];
  const isLast = currentQIdx === questions.length - 1;

  function handlePaste(e) { e.preventDefault(); }

  if (questions.length === 0) {
    return (
      <div style={{ padding: "3rem 2rem", color: "#aaa", textAlign: "center", fontSize: 14 }}>
        No questions found for this module.
      </div>
    );
  }

  return (
    <div style={{ padding: "1.75rem 2rem 2.5rem" }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {questions.map((qu, i) => (
          <div
            key={i}
            title={`Question ${i + 1}`}
            style={{
              width: 10, height: 10, borderRadius: "50%", cursor: "pointer",
              background: i === currentQIdx ? CCM_RED : answers[questions[i]?.id] ? "#16a34a" : "#ddd",
              transition: "background 0.2s",
            }}
            onClick={() => setCurrentQIdx(i)}
          />
        ))}
      </div>

      {/* Question label */}
      <div style={{ fontSize: 11, fontWeight: 700, color: CCM_RED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        Question {currentQIdx + 1} of {questions.length}
      </div>

      {/* Question text */}
      {q && (
        <>
          <p style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: "#111", margin: "0 0 1.25rem" }}>
            {q.text}
          </p>

          <textarea
            style={{ ...TEXTAREA, minHeight: 200, opacity: readingLocked ? 0.45 : 1, cursor: readingLocked ? "not-allowed" : "text" }}
            value={answers[q.id] || ""}
            onChange={e => !readingLocked && setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
            onPaste={handlePaste}
            disabled={readingLocked}
            placeholder={readingLocked ? "Answer unlocks after reading time ends" : "Type your answer here… (copy and paste is disabled)"}
          />

          {readingLocked && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#b45309", fontWeight: 600, textAlign: "center" }}>
              Answer unlocks after reading time ends
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem", gap: 12 }}>
            <button
              onClick={() => setCurrentQIdx(i => Math.max(0, i - 1))}
              disabled={currentQIdx === 0}
              style={btn("#fff", "#444", { opacity: currentQIdx === 0 ? 0.35 : 1, cursor: currentQIdx === 0 ? "default" : "pointer" })}
            >
              ← Previous
            </button>

            <div style={{ display: "flex", gap: 10 }}>
              {!isLast && (
                <button
                  onClick={() => !readingLocked && setCurrentQIdx(i => Math.min(questions.length - 1, i + 1))}
                  disabled={readingLocked}
                  style={btn(readingLocked ? "#ccc" : CCM_RED, "#fff", { cursor: readingLocked ? "not-allowed" : "pointer" })}
                >
                  Next →
                </button>
              )}
              {isLast && (
                <button onClick={onSubmit} style={btn(readingLocked ? "#ccc" : CCM_RED, "#fff", { cursor: readingLocked ? "not-allowed" : "pointer" })} disabled={readingLocked}>
                  {moduleType === "both" ? "Submit Part 1" : "Submit Assessment"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Presentation Panel (right) ───────────────────────────────────────────────
function PresentationPanel({ presentationAnswers, setPresentationAnswers, uploadedFileUrl, uploading, onUpload, onSubmit }) {
  const fileInputRef = useRef(null);

  function handlePaste(e) { e.preventDefault(); }

  return (
    <div style={{ padding: "1.75rem 2rem 2.5rem" }}>
      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 1.75rem", padding: "14px 16px", background: "#f8f9fb", borderRadius: 10, border: "1px solid #eee" }}>
        Using the provided PowerPoint template, prepare a short presentation based on your analysis of the case study. Download the template, complete your slides, then upload your finished file and answer the reflection questions.
      </p>

      {/* Download template */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Step 1: Download Template
        </div>
        <a
          href="#ppt-template"
          onClick={e => { e.preventDefault(); alert("Template download will be configured by your administrator."); }}
          style={btn("#fff", CCM_RED, { textDecoration: "none", display: "inline-block", borderColor: CCM_RED })}
        >
          📥 Download PPT Template
        </a>
      </div>

      {/* Reflection questions */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
          Step 2: Reflection Questions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {REFLECTION_QUESTIONS.map((question, i) => (
            <div key={i}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#333", display: "block", marginBottom: 6, lineHeight: 1.5 }}>
                {i + 1}. {question}
              </label>
              <input
                style={INPUT}
                value={presentationAnswers[i] || ""}
                onChange={e => setPresentationAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                onPaste={handlePaste}
                placeholder="Your answer…"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Step 3: Upload Presentation
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx,.ppt,.pdf"
          style={{ display: "none" }}
          onChange={e => e.target.files[0] && onUpload(e.target.files[0])}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={btn("#fff", "#333", { opacity: uploading ? 0.6 : 1 })}
          >
            {uploading ? "Uploading…" : "📎 Choose File"}
          </button>
          {uploadedFileUrl
            ? <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✓ File uploaded successfully</span>
            : <span style={{ fontSize: 13, color: "#bbb" }}>No file uploaded yet</span>
          }
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem", borderTop: "1px solid #f0f0f0" }}>
        <button onClick={onSubmit} style={btn(CCM_RED, "#fff", { fontSize: 15 })}>
          Submit Assessment
        </button>
      </div>
    </div>
  );
}

// ─── Part 2 Panel (right) ─────────────────────────────────────────────────────
function Part2Panel({ answer, setAnswer, fileUrl, uploading, onUpload, onSubmit, taskBrief, readingLocked }) {
  const fileInputRef = useRef(null);
  function handlePaste(e) { e.preventDefault(); }

  return (
    <div style={{ padding: "1.75rem 2rem 2.5rem" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: CCM_RED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
        Case Study Tasks
      </div>
      <div style={{ fontSize: 14, color: "#333", lineHeight: 1.8, margin: "0 0 1.5rem", padding: "14px 16px", background: "#f8f9fb", borderRadius: 10, border: "1px solid #e8e8e8", whiteSpace: "pre-wrap" }}>
        {taskBrief || "Complete the tasks outlined in the case study on the left."}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        Your Response
      </div>

      <textarea
        style={{ ...TEXTAREA, minHeight: 280, opacity: readingLocked ? 0.45 : 1, cursor: readingLocked ? "not-allowed" : "text" }}
        value={answer}
        onChange={e => !readingLocked && setAnswer(e.target.value)}
        onPaste={handlePaste}
        disabled={readingLocked}
        placeholder={readingLocked ? "Answer unlocks after reading time ends" : "Type your response here… (copy and paste is disabled)"}
      />
      {readingLocked && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#b45309", fontWeight: 600, textAlign: "center" }}>
          Answer unlocks after reading time ends
        </div>
      )}

      <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Upload Supporting Document
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.pptx,.ppt,.docx,.doc"
          style={{ display: "none" }}
          onChange={e => e.target.files[0] && onUpload(e.target.files[0])}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={btn("#fff", "#333", { opacity: uploading ? 0.6 : 1 })}
          >
            {uploading ? "Uploading…" : "📎 Upload your presentation or supporting document (PDF, PPT, DOCX)"}
          </button>
          {fileUrl
            ? <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✓ File uploaded successfully</span>
            : <span style={{ fontSize: 13, color: "#bbb" }}>No file uploaded yet</span>
          }
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem", borderTop: "1px solid #f0f0f0" }}>
        <button onClick={onSubmit} style={btn(CCM_RED, "#fff", { fontSize: 15 })}>
          Submit Assessment
        </button>
      </div>
    </div>
  );
}

// ─── Presentation Prep Panel (right panel — preparation phase) ───────────────
function PresentationPrepPanel({ taskBrief, timeLeft, totalPrepSecs, onReadyToPresent }) {
  const timerUrgent = timeLeft !== null && timeLeft < 300;
  const prepElapsed = Math.max(0, totalPrepSecs - (timeLeft || 0));
  const canPresent  = prepElapsed >= totalPrepSecs * 0.5;
  const halfMins    = Math.ceil((totalPrepSecs * 0.5) / 60);

  return (
    <div style={{ padding: "1.75rem 2rem 2.5rem" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: CCM_RED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
        Preparation Time
      </div>

      {taskBrief && (
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Your Tasks
          </div>
          <div style={{ fontSize: 14, color: "#333", lineHeight: 1.8, whiteSpace: "pre-wrap", padding: "14px 16px", background: "#f8f9fb", borderRadius: 10, border: "1px solid #e8e8e8" }}>
            {taskBrief}
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", margin: "1.5rem 0 1.75rem" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Time Remaining
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 64, fontWeight: 700, letterSpacing: "0.04em", color: timerUrgent ? "#dc2626" : "#111", lineHeight: 1 }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ background: "#f8f9fb", borderRadius: 10, border: "1px solid #e8e8e8", padding: "14px 16px", marginBottom: "1.75rem" }}>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "#333", lineHeight: 1.75 }}>
          Work on your presentation using PowerPoint, Word, or any tool you prefer. You may minimize this window while you work. Return here when you are ready to present or when time runs out.
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
          Tab switching monitoring is paused during preparation time.
        </p>
      </div>

      <button
        onClick={onReadyToPresent}
        disabled={!canPresent}
        style={btn(canPresent ? CCM_RED : "#ccc", "#fff", { width: "100%", cursor: canPresent ? "pointer" : "not-allowed", fontSize: 15, padding: "13px 22px" })}
      >
        I'm Ready to Present →
      </button>
      {!canPresent && (
        <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8, marginBottom: 0 }}>
          Available after {halfMins} minute{halfMins !== 1 ? "s" : ""} of preparation
        </p>
      )}
    </div>
  );
}

// ─── Presentation Declaration Screen ─────────────────────────────────────────
function PresentationDeclarationScreen({ participant, confirmed, setConfirmed, onConfirm, submitting, onSignOut }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: SANS, background: "#f7f8fa" }}>
      <style>{FONTS}</style>
      <header style={{ height: HEADER_H, background: "#fff", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", flexShrink: 0, boxShadow: "0 1px 6px rgba(0,0,0,.05)" }}>
        <CCMLogo />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#666" }}>{participant?.name || participant?.username}</span>
          <button onClick={onSignOut} style={btn("#fff", "#555", { fontSize: 12, padding: "6px 14px" })}>Sign out</button>
        </div>
      </header>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "2.5rem", maxWidth: 540, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,.06)", textAlign: "center" }}>
          <CCMLogo scale={1.1} />
          <h2 style={{ fontFamily: SERIF, fontSize: 26, margin: "1.5rem 0 0.75rem", color: "#111" }}>Preparation Complete</h2>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, margin: "0 0 2rem" }}>
            Your preparation time for the Case Study exercise is now complete.
          </p>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: "1.75rem", padding: "14px 16px", background: confirmed ? "#fff7f7" : "#f8f9fb", borderRadius: 10, border: `1px solid ${confirmed ? CCM_RED + "44" : "#eee"}`, transition: "all 0.2s", textAlign: "left" }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 1, accentColor: CCM_RED, flexShrink: 0 }}
            />
            <span style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>
              I confirm that I completed my presentation preparation within the allotted time and did not continue working after the timer ended.
            </span>
          </label>
          <button
            onClick={onConfirm}
            disabled={!confirmed || submitting}
            style={btn(confirmed ? CCM_RED : "#ccc", "#fff", { width: "100%", cursor: confirmed ? "pointer" : "not-allowed", fontSize: 15, padding: "13px 22px", opacity: submitting ? 0.6 : 1 })}
          >
            {submitting ? "Saving…" : "Confirm and Proceed →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Presentation Waiting Screen ──────────────────────────────────────────────
function PresentationWaitingScreen({ participant }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: SANS, background: "#f7f8fa" }}>
      <style>{FONTS}</style>
      <header style={{ height: HEADER_H, background: "#fff", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", padding: "0 1.5rem", flexShrink: 0, boxShadow: "0 1px 6px rgba(0,0,0,.05)" }}>
        <CCMLogo />
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#666" }}>{participant?.name || participant?.username}</span>
      </header>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 20, padding: "3rem 2.5rem", maxWidth: 540, width: "100%", boxShadow: "0 4px 32px rgba(0,0,0,.07)", textAlign: "center" }}>
          <CCMLogo scale={1.1} />
          <div style={{ fontSize: 48, margin: "1.5rem 0 1rem" }}>🎤</div>
          <h2 style={{ fontFamily: SERIF, fontSize: 28, margin: "0 0 1rem", color: "#111" }}>You're Ready to Present</h2>
          <p style={{ fontSize: 15, color: "#444", lineHeight: 1.75, margin: 0 }}>
            Your preparation time is complete. You may now proceed with your presentation as scheduled. You can close this window.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Participant App ──────────────────────────────────────────────────────
export default function ParticipantApp() {
  const [screen, setScreen] = useState("landing");

  const [loginForm, setLoginForm]     = useState({ username: "", password: "" });
  const [loginError, setLoginError]   = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [session, setSession]         = useState(null);

  // Assessment state
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [assessPhase, setAssessPhase]           = useState("questions");
  const [currentQIdx, setCurrentQIdx]           = useState(0);
  const [answers, setAnswers]                   = useState({});
  const [presentationAnswers, setPresentationAnswers] = useState({});
  const [uploadedFileUrl, setUploadedFileUrl]   = useState(null);
  const [uploading, setUploading]               = useState(false);

  // Part 2 state
  const [part2Answer, setPart2Answer]       = useState("");
  const [part2FileUrl, setPart2FileUrl]     = useState(null);
  const [part2Uploading, setPart2Uploading] = useState(false);

  // Presentation sub-phase (only active when part2_mode === "presentation")
  // values: "reading" | "prep" | "declaration" | "waiting"
  const [presentationPhase, setPresentationPhase] = useState("reading");
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const prepStartRef = useRef(null);

  // Anti-cheat
  const tabSwitchesRef   = useRef(0);
  const part1TabSwitches  = useRef(0);
  const part2TabSwitches  = useRef(0);
  const breakTabSwitches  = useRef(0);
  const breakStartRef     = useRef(null);
  const [tabSwitches, setTabSwitches]     = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Timers — single interval derives both displays from one shared start timestamp
  const [timeLeft, setTimeLeft]           = useState(null);
  const [readingTimeLeft, setReadingTimeLeft] = useState(0);
  const [timerActive, setTimerActive]     = useState(false);
  const startTimeRef       = useRef(null); // Date.now() when module/part began
  const moduleDurationRef  = useRef(0);    // total module seconds
  const readingDurationRef = useRef(0);    // reading lock seconds (0 = no lock)

  // Submission
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [completionTimeSec, setCompletionTimeSec] = useState(0);

  // Split panel
  const [leftWidth, setLeftWidth] = useState(40); // percent
  const containerRef = useRef(null);
  const isDragging   = useRef(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const modules       = session?.modules || [];
  const currentModule = modules[currentModuleIdx] || null;

  // ── Auto-login from localStorage on mount ────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const savedUser = localStorage.getItem(LS_USER);
    const savedPass = localStorage.getItem(LS_PASS);
    if (!savedUser || !savedPass) return;
    setLoginLoading(true);
    (async () => {
      try {
        const p = await db.loginParticipant(savedUser, savedPass);
        if (!p || !p.id) { localStorage.removeItem(LS_USER); localStorage.removeItem(LS_PASS); setLoginLoading(false); return; }
        const sess = await db.loadParticipantSession(p);
        setParticipant(p);
        setSession(sess);
        setScreen("systemCheck");
      } catch {
        localStorage.removeItem(LS_USER);
        localStorage.removeItem(LS_PASS);
      }
      setLoginLoading(false);
    })();
  }, []);

  // ── Drag-to-resize panel ─────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    function onMove(e) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let pct = ((e.clientX - rect.left) / rect.width) * 100;
      pct = Math.max(25, Math.min(75, pct));
      setLeftWidth(pct);
    }
    function onUp() {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  function startDrag(e) {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  // ── Tab switch detection — paused during presentation preparation ─────────────
  useEffect(() => {
    if (screen !== "assessment") return;
    const onVis = () => {
      if (document.visibilityState === "hidden") return;
      // Pause monitoring while participant prepares their presentation externally
      if (assessPhase === "part2" && currentModule?.part2_mode === "presentation" && presentationPhase === "prep") return;
      tabSwitchesRef.current += 1;
      if (assessPhase === "part2") part2TabSwitches.current += 1;
      else if (assessPhase === "break") breakTabSwitches.current += 1;
      else part1TabSwitches.current += 1;
      setTabSwitches(tabSwitchesRef.current);
      setShowTabWarning(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [screen, assessPhase, currentModule, presentationPhase]);

  // ── Unified timer — one interval, both countdowns derived from shared timestamp ─
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newTimeLeft    = Math.max(0, moduleDurationRef.current - elapsed);
      const newReadingLeft = Math.max(0, readingDurationRef.current - elapsed);
      setTimeLeft(newTimeLeft);
      setReadingTimeLeft(newReadingLeft);
      if (newTimeLeft <= 0) { clearInterval(interval); setTimerActive(false); }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  // ── Presentation: reading time ends → enter preparation phase ────────────────
  useEffect(() => {
    if (
      assessPhase === "part2" &&
      currentModule?.part2_mode === "presentation" &&
      presentationPhase === "reading" &&
      readingTimeLeft === 0 &&
      timerActive
    ) {
      setPresentationPhase("prep");
      prepStartRef.current = Date.now();
    }
  }, [assessPhase, currentModule, presentationPhase, readingTimeLeft, timerActive]);

  // ── Presentation: prep timer expires → auto-enter declaration screen ──────────
  useEffect(() => {
    if (
      assessPhase === "part2" &&
      currentModule?.part2_mode === "presentation" &&
      presentationPhase === "prep" &&
      timeLeft !== null &&
      timeLeft === 0
    ) {
      setPresentationPhase("declaration");
    }
  }, [assessPhase, currentModule, presentationPhase, timeLeft]);

  function startModuleTimer(mod) {
    const minutes = mod?.time_limit || 60;
    moduleDurationRef.current  = minutes * 60;
    readingDurationRef.current = 0; // Part 1 has no reading lock
    part1TabSwitches.current   = 0;
    startTimeRef.current = Date.now();
    setTimeLeft(minutes * 60);
    setReadingTimeLeft(0);
    setTimerActive(true);
  }

  // ── Login ─────────────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    const username = loginForm.username.trim();
    const password = loginForm.password.trim();
    if (!username || !password) { setLoginError("Please enter your username and password."); return; }
    setLoginError("");
    setLoginLoading(true);

    let p = null;
    try {
      p = await db.loginParticipant(username, password);
    } catch {
      setLoginError("Could not reach the server. Please check your connection and try again.");
      setLoginLoading(false);
      return;
    }

    if (!p || !p.id) {
      setLoginError("Invalid username or password. Please try again.");
      setLoginLoading(false);
      return;
    }

    try {
      const sess = await db.loadParticipantSession(p);
      localStorage.setItem(LS_USER, username);
      localStorage.setItem(LS_PASS, password);
      setParticipant(p);
      setSession(sess);
      setScreen("systemCheck");
    } catch {
      setLoginError("Your account was found but your assessment session could not be loaded. Please contact your administrator.");
      setLoginLoading(false);
      return;
    }
    setLoginLoading(false);
  }

  // ── Sign out ──────────────────────────────────────────────────────────────────
  function signOut() {
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_PASS);
    setParticipant(null);
    setSession(null);
    setScreen("landing");
    setCurrentModuleIdx(0);
    setAnswers({});
    setPresentationAnswers({});
    setUploadedFileUrl(null);
    setPart2Answer("");
    setPart2FileUrl(null);
    setTimeLeft(null);
    setReadingTimeLeft(0);
    setTimerActive(false);
    tabSwitchesRef.current   = 0;
    part1TabSwitches.current = 0;
    part2TabSwitches.current = 0;
    breakTabSwitches.current = 0;
    breakStartRef.current    = null;
    prepStartRef.current     = null;
    setPresentationPhase("reading");
    setDeclarationConfirmed(false);
    setTabSwitches(0);
    setCompletionTimeSec(0);
  }

  // ── Begin assessment ──────────────────────────────────────────────────────────
  function beginAssessment() {
    if (!modules.length) return;
    setScreen("assessment");
    const mod = modules[0];
    const mt  = mod?.module_type || "questions";
    if (mt === "part2only") {
      setAssessPhase("part2Transition");
      return;
    }
    setAssessPhase(mt === "presentation" ? "presentation" : "questions");
    startModuleTimer(mod);
  }

  // ── Part 2 helpers ────────────────────────────────────────────────────────────
  function getTaskMins(mod, level) {
    const name = (level?.name || "").toLowerCase();
    if (name.includes("director")) return mod?.dir_task_mins ?? 60;
    if (name.includes("manager"))  return mod?.mgr_task_mins ?? 45;
    return mod?.sup_task_mins ?? 30;
  }

  function beginPart2() {
    const taskMins        = getTaskMins(currentModule, session?.level);
    const fullReadingSecs = (currentModule?.reading_time_mins || 5) * 60;
    const skipTimers      = new URLSearchParams(window.location.search).get("skipReading") === "true";
    const readingSecs     = skipTimers ? 5 : fullReadingSecs;
    const moduleSecs      = skipTimers ? (readingSecs + 120) : (taskMins * 60); // prep = 2 min when bypassing
    moduleDurationRef.current  = moduleSecs;
    readingDurationRef.current = readingSecs;
    part2TabSwitches.current   = 0;
    startTimeRef.current = Date.now();
    setTimeLeft(moduleSecs);
    setReadingTimeLeft(readingSecs);
    setTimerActive(true);
    setPresentationPhase("reading");
    setDeclarationConfirmed(false);
    prepStartRef.current = null;
    setAssessPhase("part2");
  }

  function enterBreak() {
    breakStartRef.current    = Date.now();
    breakTabSwitches.current = 0;
    setAssessPhase("break");
  }

  async function resumeFromBreak(skipped = false) {
    const startedAt    = new Date(breakStartRef.current).toISOString();
    const endedAt      = new Date().toISOString();
    const durationSecs = Math.round((Date.now() - breakStartRef.current) / 1000);
    await db.saveBreakData(participant.id, currentModule.id, {
      started_at:                startedAt,
      ended_at:                  endedAt,
      duration_seconds:          durationSecs,
      skipped:                   skipped,
      tab_switches_during_break: breakTabSwitches.current,
    });
    setAssessPhase("part2Transition");
  }

  async function confirmPresentationDeclaration() {
    if (!declarationConfirmed || submitting) return;
    setSubmitting(true);
    const prepTimeUsed = prepStartRef.current
      ? Math.round((Date.now() - prepStartRef.current) / 1000)
      : 0;
    const timeSpent = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
    setCompletionTimeSec(prev => prev + timeSpent);
    try {
      await db.savePart2Result(participant.id, currentModule.id, {
        mode:                  "presentation",
        preparation_time_used: prepTimeUsed,
        declaration_confirmed: true,
        ready_at:              new Date().toISOString(),
        tab_switches_part2:    part2TabSwitches.current,
      });
      setTimerActive(false);
      setPresentationPhase("waiting");
    } catch (err) {
      alert(`Submission failed: ${err.message}. Please try again.`);
    }
    setSubmitting(false);
  }

  async function handlePart2Upload(file) {
    if (!file || !participant || !currentModule) return;
    setPart2Uploading(true);
    try {
      const path = `submissions/${participant.id}/${currentModule.id}/part2/${file.name}`;
      const url  = await db.uploadStorageFile("assessment-media", path, file);
      setPart2FileUrl(url);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
    setPart2Uploading(false);
  }

  // ── Submit module ─────────────────────────────────────────────────────────────
  function advanceToNextModule() {
    const nextIdx = currentModuleIdx + 1;
    if (nextIdx < modules.length) {
      const nextMod = modules[nextIdx];
      setCurrentModuleIdx(nextIdx);
      setCurrentQIdx(0);
      setAnswers({});
      setPresentationAnswers({});
      setUploadedFileUrl(null);
      setPart2Answer("");
      setPart2FileUrl(null);
      setPresentationPhase("reading");
      setDeclarationConfirmed(false);
      prepStartRef.current = null;
      const mt = nextMod?.module_type || "questions";
      if (mt === "part2only") {
        setAssessPhase("part2Transition");
        return;
      }
      setAssessPhase(mt === "presentation" ? "presentation" : "questions");
      startModuleTimer(nextMod);
    } else {
      setTimerActive(false);
      setScreen("done");
    }
  }

  async function submitCurrentModule() {
    if (!currentModule || submitting) return;
    setSubmitting(true);
    const timeSpent = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
    setCompletionTimeSec(prev => prev + timeSpent);
    try {
      if (assessPhase === "part2") {
        // Save Part 2 answers into the existing result row
        await db.savePart2Result(participant.id, currentModule.id, {
          written_response:      part2Answer,
          uploaded_file_url:     part2FileUrl,
          time_taken:            timeSpent,
          tab_switches_part2:    part2TabSwitches.current,
        });
        advanceToNextModule();
      } else {
        // Part 1 — questions or standalone presentation
        await db.saveResult(
          participant.id,
          currentModule.id,
          { questions: answers, presentation: presentationAnswers, uploaded_file_url: uploadedFileUrl, tab_switches: tabSwitchesRef.current, tab_switches_part1: part1TabSwitches.current },
          timeSpent,
          []
        );
        if (assessPhase === "questions" && currentModule.module_type === "both") {
          // Part 1 done — stop timer and enter break before Part 2
          setTimerActive(false);
          enterBreak();
        } else {
          advanceToNextModule();
        }
      }
    } catch (err) {
      alert(`Submission failed: ${err.message}. Please try again.`);
    }
    setShowSubmitModal(false);
    setSubmitting(false);
  }

  // ── File upload (Part 1 / presentation) ──────────────────────────────────────
  async function handleFileUpload(file) {
    if (!file || !participant || !currentModule) return;
    setUploading(true);
    try {
      const path = `submissions/${participant.id}/${currentModule.id}/${file.name}`;
      const url  = await db.uploadStorageFile("assessment-media", path, file);
      setUploadedFileUrl(url);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
    setUploading(false);
  }

  // ── Non-assessment screens ────────────────────────────────────────────────────
  if (loginLoading && screen === "landing") {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
        <style>{FONTS}</style>
        <div style={{ textAlign: "center", color: "#aaa", fontSize: 14 }}>Signing you in…</div>
      </div>
    );
  }
  if (screen === "landing")     return <LandingScreen isMobile={isMobile} onBegin={() => setScreen("login")} />;
  if (screen === "login")       return <LoginScreen form={loginForm} setForm={setLoginForm} error={loginError} loading={loginLoading} onSubmit={handleLogin} />;
  if (screen === "systemCheck") return <SystemCheckScreen onContinue={() => setScreen("welcome")} />;
  if (screen === "welcome")     return <WelcomeScreen session={session} participant={participant} onBegin={beginAssessment} />;
  if (screen === "done")        return <DoneScreen completionTimeSec={completionTimeSec} />;

  // ── Break screen ──────────────────────────────────────────────────────────────
  if (assessPhase === "break") {
    const skipTimers  = new URLSearchParams(window.location.search).get("skipReading") === "true";
    const breakMins   = currentModule?.break_duration_mins ?? 10;
    const breakSecs   = skipTimers ? 15 : breakMins * 60;
    return (
      <BreakScreen
        breakDurationSecs={breakSecs}
        participant={participant}
        tabSwitches={tabSwitches}
        showTabWarning={showTabWarning}
        setShowTabWarning={setShowTabWarning}
        onResume={resumeFromBreak}
        onSkip={() => resumeFromBreak(true)}
        onSignOut={signOut}
      />
    );
  }

  // ── Part 2 transition ─────────────────────────────────────────────────────────
  if (assessPhase === "part2Transition") {
    return (
      <Part2TransitionScreen
        participant={participant}
        tabSwitches={tabSwitches}
        onBeginPart2={beginPart2}
        onSignOut={signOut}
      />
    );
  }

  // ── Presentation declaration screen ──────────────────────────────────────────
  if (assessPhase === "part2" && currentModule?.part2_mode === "presentation" && presentationPhase === "declaration") {
    return (
      <PresentationDeclarationScreen
        participant={participant}
        confirmed={declarationConfirmed}
        setConfirmed={setDeclarationConfirmed}
        onConfirm={confirmPresentationDeclaration}
        submitting={submitting}
        onSignOut={signOut}
      />
    );
  }

  // ── Presentation waiting screen ───────────────────────────────────────────────
  if (assessPhase === "part2" && currentModule?.part2_mode === "presentation" && presentationPhase === "waiting") {
    return <PresentationWaitingScreen participant={participant} />;
  }

  // ── Assessment screen ─────────────────────────────────────────────────────────
  const mt          = currentModule?.module_type || "questions";
  const questions   = currentModule?.questions   || [];
  const competencies = currentModule?.competencies || [];
  const scenario    = currentModule?.scenario    || null;
  const timerUrgent = timeLeft !== null && timeLeft < 300;

  // Shared header used in all assessment phases
  const assessHeader = (
    <header style={{
      height: HEADER_H,
      background: "#fff",
      borderBottom: "1px solid #e8e8e8",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      flexShrink: 0,
      zIndex: 50,
      boxShadow: "0 1px 6px rgba(0,0,0,.05)",
    }}>
      <CCMLogo />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {tabSwitches > 0 && (
          <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "4px 10px", borderRadius: 20, border: "1px solid #fca5a5", fontWeight: 600 }}>
            ⚠ {tabSwitches} tab switch{tabSwitches !== 1 ? "es" : ""}
          </div>
        )}
        <span style={{ fontSize: 13, color: "#666" }}>{participant?.name || participant?.username}</span>
        <button onClick={signOut} style={btn("#fff", "#555", { fontSize: 12, padding: "6px 14px" })}>Sign out</button>
      </div>
    </header>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: SANS, overflow: "hidden" }}>
      <style>{FONTS}</style>

      {assessHeader}

      {/* ── Part 1 — full-width, no case study ─────────────────────────────── */}
      {assessPhase === "questions" && (
        <Part1Screen
          moduleTitle={currentModule?.title}
          moduleIdx={currentModuleIdx}
          moduleCount={modules.length}
          questions={questions}
          competencies={competencies}
          currentQIdx={currentQIdx}
          setCurrentQIdx={setCurrentQIdx}
          answers={answers}
          setAnswers={setAnswers}
          moduleType={mt}
          timeLeft={timeLeft}
          onShowSubmit={() => setShowSubmitModal(true)}
        />
      )}

      {/* ── Part 2 / Presentation — split panel with case study ────────────── */}
      {(assessPhase === "part2" || assessPhase === "presentation") && (
        <div ref={containerRef} style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* LEFT PANEL — case study */}
          <div style={{ width: `${leftWidth}%`, minWidth: "25%", maxWidth: "75%", overflowY: "auto", background: "#f7f8fa", flexShrink: 0 }}>
            <ScenarioPanel
              scenario={scenario}
              moduleTitle={currentModule?.title}
              moduleIdx={currentModuleIdx}
              moduleCount={modules.length}
              assessPhase={assessPhase}
              readingTimeLeft={readingTimeLeft}
            />
          </div>

          {/* DRAG HANDLE */}
          <div
            onMouseDown={startDrag}
            style={{ width: 6, flexShrink: 0, background: "#e8e8e8", cursor: "col-resize", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Drag to resize"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "#bbb" }} />
              ))}
            </div>
          </div>

          {/* RIGHT PANEL — timer + content */}
          <div style={{ flex: 1, minWidth: "25%", display: "flex", flexDirection: "column", overflowY: "auto", background: "#fff" }}>

            {/* Sticky timer bar */}
            <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "10px 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {timeLeft !== null && (
                  <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: timerUrgent ? "#dc2626" : "#111", background: timerUrgent ? "#fef2f2" : "#f5f5f5", padding: "5px 13px", borderRadius: 8, border: `1px solid ${timerUrgent ? "#fca5a5" : "#e5e5e5"}`, letterSpacing: "0.05em", animation: timerUrgent ? "blink 1.2s step-end infinite" : "none" }}>
                    {formatTime(timeLeft)}
                  </div>
                )}
                <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {assessPhase === "presentation" ? "Presentation Task" : "Part 2: Case Study"}
                </span>
              </div>
              {/* Hide submit button in live presentation mode — "I'm Ready" button is in the panel */}
              {!(assessPhase === "part2" && currentModule?.part2_mode === "presentation") && (
                <button onClick={() => setShowSubmitModal(true)} style={btn(CCM_RED, "#fff", { fontSize: 12, padding: "6px 14px" })}>
                  Submit
                </button>
              )}
            </div>

            {/* Part 2 — written submission */}
            {assessPhase === "part2" && (!currentModule?.part2_mode || currentModule.part2_mode === "written") && (
              <Part2Panel
                answer={part2Answer}
                setAnswer={setPart2Answer}
                fileUrl={part2FileUrl}
                uploading={part2Uploading}
                onUpload={handlePart2Upload}
                onSubmit={() => setShowSubmitModal(true)}
                taskBrief={currentModule?.task_brief || ""}
                readingLocked={readingTimeLeft > 0}
              />
            )}

            {/* Part 2 — live presentation: reading phase */}
            {assessPhase === "part2" && currentModule?.part2_mode === "presentation" && presentationPhase === "reading" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: "1rem" }}>📖</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 20, color: "#111", margin: "0 0 0.75rem" }}>Read the Case Study</h3>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, maxWidth: 380, margin: 0 }}>
                  Read the case study carefully. Your preparation time will begin after the reading period ends.
                </p>
              </div>
            )}

            {/* Part 2 — live presentation: preparation phase */}
            {assessPhase === "part2" && currentModule?.part2_mode === "presentation" && presentationPhase === "prep" && (() => {
              const tMins       = getTaskMins(currentModule, session?.level);
              const rSecs       = (currentModule?.reading_time_mins || 5) * 60;
              const totalPrep   = Math.max(60, tMins * 60 - rSecs);
              return (
                <PresentationPrepPanel
                  taskBrief={currentModule?.task_brief || ""}
                  timeLeft={timeLeft}
                  totalPrepSecs={totalPrep}
                  onReadyToPresent={() => setPresentationPhase("declaration")}
                />
              );
            })()}

            {/* Presentation content (standalone module_type=presentation, old flow) */}
            {assessPhase === "presentation" && (
              <PresentationPanel
                presentationAnswers={presentationAnswers}
                setPresentationAnswers={setPresentationAnswers}
                uploadedFileUrl={uploadedFileUrl}
                uploading={uploading}
                onUpload={handleFileUpload}
                onSubmit={() => setShowSubmitModal(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Tab warning modal ────────────────────────────────────────────────── */}
      {showTabWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "2.5rem", maxWidth: 440, width: "90%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>
            <div style={{ fontSize: 48, marginBottom: "0.75rem" }}>⚠️</div>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, marginBottom: "0.75rem", color: "#dc2626" }}>Tab Switch Detected</h2>
            <p style={{ fontSize: 14, color: "#555", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              You switched away from this assessment tab. This has been logged.<br />
              <strong style={{ color: "#111" }}>Total switches recorded: {tabSwitches}</strong>
            </p>
            <button onClick={() => setShowTabWarning(false)} style={btn(CCM_RED, "#fff", { width: "100%", padding: "12px 22px" })}>
              Return to Assessment
            </button>
          </div>
        </div>
      )}

      {/* ── Submit confirmation modal ─────────────────────────────────────────── */}
      {showSubmitModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 440, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, marginBottom: "0.75rem", color: "#111" }}>
              {assessPhase === "questions" ? "Submit Part 1?" : "Submit Assessment?"}
            </h2>
            <p style={{ fontSize: 14, color: "#555", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              {assessPhase === "questions" && mt === "both"
                ? "Once submitted, you will not be able to change your answers. You will move to a short break before Part 2 begins."
                : "Once submitted, you will not be able to change your answers. Please make sure you are happy with your responses before continuing."}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowSubmitModal(false)} disabled={submitting} style={btn("#fff", "#333", { flex: 1 })}>
                Go Back
              </button>
              <button onClick={submitCurrentModule} disabled={submitting} style={btn(CCM_RED, "#fff", { flex: 1, opacity: submitting ? 0.6 : 1 })}>
                {submitting ? "Submitting…" : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
