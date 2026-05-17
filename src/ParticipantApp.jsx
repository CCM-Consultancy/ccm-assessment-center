import React, { useState, useEffect, useRef } from "react";
import * as db from "./lib/db";

const CCM_RED = "#CC0000";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
`;

const SANS = "'Plus Jakarta Sans', Arial, sans-serif";
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
  minHeight: 140,
};

function btn(bg, color, extra = {}) {
  return {
    padding: "12px 28px",
    background: bg,
    color,
    border: `1px solid ${bg === "#fff" ? "#ddd" : bg}`,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: SANS,
    transition: "opacity 0.15s",
    ...extra,
  };
}

const CARD = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: 12,
  padding: "1.5rem",
  marginBottom: "1.5rem",
};

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
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", fontFamily: SANS }}>
      <style>{FONTS}</style>

      {isMobile && (
        <div style={{ background: "#fff3cd", borderBottom: "1px solid #ffc107", padding: "12px 20px", fontSize: 13, textAlign: "center", color: "#856404", fontFamily: SANS }}>
          ⚠ This assessment is designed for desktop use. For the best experience, please switch to a laptop or desktop computer.
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
        <CCMLogo scale={1.8} />

        <h1 style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 700, margin: "2rem 0 0.5rem", color: "#111", textAlign: "center", lineHeight: 1.2 }}>
          Assessment Centre
        </h1>

        <p style={{ fontSize: 16, color: "#666", marginBottom: "3rem", textAlign: "center", maxWidth: 500, lineHeight: 1.7, marginTop: "0.75rem" }}>
          Welcome. Please ensure you are in a quiet, private environment with no interruptions before you begin.
        </p>

        <button onClick={onBegin} style={btn(CCM_RED, "#fff", { fontSize: 16, padding: "16px 48px", borderRadius: 10 })}>
          Begin Assessment
        </button>
      </div>

      <footer style={{ padding: "1.5rem", textAlign: "center", fontSize: 12, color: "#bbb" }}>
        CCM Consultancy · Assessment Centre Platform
      </footer>
    </div>
  );
}

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ form, setForm, error, loading, onSubmit }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
      <style>{FONTS}</style>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
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
            style={btn(CCM_RED, "#fff", { width: "100%", opacity: loading ? 0.6 : 1 })}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Anti-Cheat Setup Screen ───────────────────────────────────────────────────
function AntiCheatScreen({ session, agreeChecked, setAgreeChecked, onBegin }) {
  const assessmentName = session?.caseStudy?.name || "Assessment";

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, padding: "2rem 1rem" }}>
      <style>{FONTS}</style>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 580, boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <CCMLogo scale={1.1} />
          <h2 style={{ fontFamily: SERIF, fontSize: 24, margin: "1.25rem 0 0.5rem", color: "#111" }}>
            Before You Begin
          </h2>
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
            {assessmentName}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: "2rem" }}>
          {[
            {
              icon: "👁",
              title: "Tab switching is monitored",
              body: "Every time you switch away from this tab, it is recorded and logged. Assessors will be able to see how many times you switched tabs.",
            },
            {
              icon: "⏱",
              title: "Your timer starts when you click Begin",
              body: "Each module has a time limit. Your timer will begin the moment you click the Begin Assessment button below.",
            },
            {
              icon: "⛔",
              title: "Copy and paste is disabled",
              body: "To ensure the integrity of your assessment, pasting text into answer fields is not permitted.",
            },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", background: "#f8f9fb", borderRadius: 10, border: "1px solid #eee" }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#111" }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: "1.5rem", padding: "14px 16px", background: agreeChecked ? "#fff7f7" : "#f8f9fb", borderRadius: 10, border: `1px solid ${agreeChecked ? CCM_RED + "44" : "#eee"}`, transition: "all 0.2s" }}>
          <input
            type="checkbox"
            checked={agreeChecked}
            onChange={e => setAgreeChecked(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 1, accentColor: CCM_RED, flexShrink: 0 }}
          />
          <span style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>
            I understand and agree to the above conditions. I am ready to begin my assessment.
          </span>
        </label>

        <button
          onClick={onBegin}
          disabled={!agreeChecked}
          style={btn(agreeChecked ? CCM_RED : "#ccc", "#fff", { width: "100%", cursor: agreeChecked ? "pointer" : "not-allowed", fontSize: 16, padding: "14px 28px" })}
        >
          Begin Assessment
        </button>
      </div>
    </div>
  );
}

// ─── Questions View ────────────────────────────────────────────────────────────
function QuestionsView({ scenario, questions, currentQIdx, setCurrentQIdx, answers, setAnswers, moduleType, onProceedToPresentation, onSubmit }) {
  const q = questions[currentQIdx];
  const isLast = currentQIdx === questions.length - 1;

  function handlePaste(e) {
    e.preventDefault();
  }

  function handleAnswer(val) {
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: val }));
  }

  function goNext() {
    if (currentQIdx < questions.length - 1) setCurrentQIdx(i => i + 1);
  }

  function goPrev() {
    if (currentQIdx > 0) setCurrentQIdx(i => i - 1);
  }

  return (
    <div>
      {/* Case study */}
      {scenario?.case_study_text && (
        <div style={{ ...CARD }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 17, margin: "0 0 1rem", color: "#111" }}>Case Study</h3>
          <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "#333" }}>
            {scenario.case_study_text}
          </div>

          {scenario.appendix_text && (
            <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Appendix</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "#555" }}>
                {scenario.appendix_text}
              </div>
            </div>
          )}

          {[1, 2, 3].map(n => {
            const url = scenario[`image_${n}_url`];
            const cap = scenario[`image_${n}_caption`];
            if (!url) return null;
            return (
              <div key={n} style={{ marginTop: "1.25rem" }}>
                <img src={url} alt={cap || `Figure ${n}`} style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #eee" }} />
                {cap && <p style={{ fontSize: 12, color: "#888", marginTop: 6, textAlign: "center" }}>{cap}</p>}
              </div>
            );
          })}

          {scenario.file_url && (
            <div style={{ marginTop: "1.25rem", padding: "12px 16px", background: "#f8f9fb", borderRadius: 8, border: "1px solid #e8e8e8" }}>
              <a href={scenario.file_url} target="_blank" rel="noopener noreferrer" style={{ color: CCM_RED, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                📄 {scenario.file_name || "View attached document"}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Question */}
      {q && (
        <div style={{ ...CARD, borderLeft: `4px solid ${CCM_RED}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: CCM_RED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Question {currentQIdx + 1} of {questions.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === currentQIdx ? CCM_RED : answers[questions[i]?.id] ? "#16a34a" : "#e5e5e5" }} />
              ))}
            </div>
          </div>

          <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: "#111", margin: "0 0 1.25rem" }}>
            {q.text}
          </p>

          <textarea
            style={TEXTAREA}
            value={answers[q.id] || ""}
            onChange={e => handleAnswer(e.target.value)}
            onPaste={handlePaste}
            placeholder="Type your answer here… (copy and paste is disabled)"
            rows={8}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}>
            <button
              onClick={goPrev}
              disabled={currentQIdx === 0}
              style={btn("#fff", "#333", { fontSize: 14, padding: "10px 20px", opacity: currentQIdx === 0 ? 0.4 : 1, cursor: currentQIdx === 0 ? "default" : "pointer" })}
            >
              ← Previous
            </button>

            {!isLast && (
              <button onClick={goNext} style={btn(CCM_RED, "#fff", { fontSize: 14, padding: "10px 24px" })}>
                Next →
              </button>
            )}

            {isLast && moduleType === "both" && (
              <button onClick={onProceedToPresentation} style={btn(CCM_RED, "#fff", { fontSize: 14, padding: "10px 24px" })}>
                Continue to Presentation →
              </button>
            )}

            {isLast && moduleType !== "both" && (
              <button onClick={onSubmit} style={btn(CCM_RED, "#fff", { fontSize: 14, padding: "10px 24px" })}>
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      )}

      {questions.length === 0 && (
        <div style={{ ...CARD, textAlign: "center", padding: "3rem", color: "#aaa" }}>
          No questions found for this module.
        </div>
      )}
    </div>
  );
}

// ─── Presentation View ─────────────────────────────────────────────────────────
function PresentationView({ presentationAnswers, setPresentationAnswers, uploadedFileUrl, uploading, onUpload, onSubmit }) {
  const fileInputRef = useRef(null);

  function handlePaste(e) {
    e.preventDefault();
  }

  return (
    <div>
      {/* Instructions */}
      <div style={{ ...CARD }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 17, margin: "0 0 0.75rem", color: "#111" }}>Presentation Task</h3>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>
          Using the provided PowerPoint template, prepare a short presentation based on your analysis of the case study. Download the template below, complete your slides, then upload your finished file. Answer the reflection questions to support your presentation.
        </p>
      </div>

      {/* Download template */}
      <div style={{ ...CARD }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 0.75rem", color: "#111" }}>1. Download the Template</h4>
        <a
          href="#ppt-template"
          onClick={e => { e.preventDefault(); alert("Template download will be configured by your administrator."); }}
          style={btn("#fff", CCM_RED, { fontSize: 14, textDecoration: "none", display: "inline-block", borderColor: CCM_RED })}
        >
          📥 Download PPT Template
        </a>
      </div>

      {/* Reflection questions */}
      <div style={{ ...CARD }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 1rem", color: "#111" }}>2. Answer the Reflection Questions</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
      <div style={{ ...CARD }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 0.75rem", color: "#111" }}>3. Upload Your Completed Presentation</h4>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>Upload your completed PowerPoint or PDF file.</p>

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
            style={btn("#fff", "#333", { fontSize: 14, opacity: uploading ? 0.6 : 1 })}
          >
            {uploading ? "Uploading…" : "📎 Choose File"}
          </button>

          {uploadedFileUrl ? (
            <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✓ File uploaded successfully</span>
          ) : (
            <span style={{ fontSize: 13, color: "#bbb" }}>No file uploaded yet</span>
          )}
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onSubmit} style={btn(CCM_RED, "#fff", { fontSize: 15 })}>
          Submit Assessment
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
    <div style={{ minHeight: "100vh", background: "#f7f8fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
      <style>{FONTS}</style>
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 16, padding: "3rem 2.5rem", width: "100%", maxWidth: 520, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
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

// ─── Main Participant App ──────────────────────────────────────────────────────
export default function ParticipantApp() {
  const [screen, setScreen] = useState("landing");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [session, setSession] = useState(null);

  const [agreeChecked, setAgreeChecked] = useState(false);

  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [assessPhase, setAssessPhase] = useState("questions");
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [presentationAnswers, setPresentationAnswers] = useState({});
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const tabSwitchesRef = useRef(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const startTimeRef = useRef(null);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completionTimeSec, setCompletionTimeSec] = useState(0);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const modules = session?.modules || [];
  const currentModule = modules[currentModuleIdx] || null;

  // Tab switch detection
  useEffect(() => {
    if (screen !== "assessment") return;
    const onVis = () => {
      if (document.visibilityState === "hidden") return;
      tabSwitchesRef.current += 1;
      setTabSwitches(tabSwitchesRef.current);
      setShowTabWarning(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [screen]);

  // Countdown timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t === null || t <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  function startModuleTimer(mod) {
    const minutes = mod?.time_limit || 60;
    setTimeLeft(minutes * 60);
    setTimerActive(true);
    startTimeRef.current = Date.now();
  }

  async function handleLogin(e) {
    e.preventDefault();
    const username = loginForm.username.trim();
    const password = loginForm.password.trim();
    if (!username || !password) {
      setLoginError("Please enter your username and password.");
      return;
    }
    setLoginError("");
    setLoginLoading(true);

    let p = null;
    try {
      p = await db.loginParticipant(username, password);
    } catch (err) {
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
      setParticipant(p);
      setSession(sess);
      setScreen("antiCheat");
    } catch (err) {
      setLoginError("Your account was found but your assessment session could not be loaded. Please contact your administrator.");
      setLoginLoading(false);
      return;
    }
    setLoginLoading(false);
  }

  function beginAssessment() {
    if (!modules.length) return;
    setScreen("assessment");
    const mod = modules[0];
    const mt = mod?.module_type || "questions";
    setAssessPhase(mt === "presentation" ? "presentation" : "questions");
    startModuleTimer(mod);
  }

  async function submitCurrentModule() {
    if (!currentModule || submitting) return;
    setSubmitting(true);
    const timeSpent = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
    setCompletionTimeSec(prev => prev + timeSpent);
    try {
      await db.saveResult(
        participant.id,
        currentModule.id,
        {
          questions:           answers,
          presentation:        presentationAnswers,
          uploaded_file_url:   uploadedFileUrl,
          tab_switches:        tabSwitchesRef.current,
        },
        timeSpent,
        []
      );
      const nextIdx = currentModuleIdx + 1;
      if (nextIdx < modules.length) {
        const nextMod = modules[nextIdx];
        setCurrentModuleIdx(nextIdx);
        setCurrentQIdx(0);
        setAnswers({});
        setPresentationAnswers({});
        setUploadedFileUrl(null);
        const mt = nextMod?.module_type || "questions";
        setAssessPhase(mt === "presentation" ? "presentation" : "questions");
        startModuleTimer(nextMod);
      } else {
        setTimerActive(false);
        setScreen("done");
      }
    } catch (err) {
      alert(`Submission failed: ${err.message}. Please try again.`);
    }
    setShowSubmitModal(false);
    setSubmitting(false);
  }

  async function handleFileUpload(file) {
    if (!file || !participant || !currentModule) return;
    setUploading(true);
    try {
      const path = `submissions/${participant.id}/${currentModule.id}/${file.name}`;
      const url = await db.uploadStorageFile("assessment-media", path, file);
      setUploadedFileUrl(url);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    }
    setUploading(false);
  }

  if (screen === "landing") return <LandingScreen isMobile={isMobile} onBegin={() => setScreen("login")} />;
  if (screen === "login") return <LoginScreen form={loginForm} setForm={setLoginForm} error={loginError} loading={loginLoading} onSubmit={handleLogin} />;
  if (screen === "antiCheat") return <AntiCheatScreen session={session} agreeChecked={agreeChecked} setAgreeChecked={setAgreeChecked} onBegin={beginAssessment} />;
  if (screen === "done") return <DoneScreen completionTimeSec={completionTimeSec} />;

  const mt = currentModule?.module_type || "questions";
  const questions = currentModule?.questions || [];
  const scenario = currentModule?.scenario || null;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", fontFamily: SANS }}>
      <style>{FONTS}</style>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "0 2rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,.05)" }}>
        <CCMLogo />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {timeLeft !== null && (
            <div style={{
              fontFamily: "monospace",
              fontSize: 15,
              fontWeight: 700,
              color: timeLeft < 300 ? "#dc2626" : "#111",
              background: timeLeft < 300 ? "#fef2f2" : "#f5f5f5",
              padding: "5px 13px",
              borderRadius: 8,
              border: `1px solid ${timeLeft < 300 ? "#fca5a5" : "#e5e5e5"}`,
            }}>
              {formatTime(timeLeft)}
            </div>
          )}
          {tabSwitches > 0 && (
            <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", padding: "4px 10px", borderRadius: 20, border: "1px solid #fca5a5", fontWeight: 600 }}>
              ⚠ {tabSwitches} switch{tabSwitches !== 1 ? "es" : ""}
            </div>
          )}
          <span style={{ fontSize: 13, color: "#888" }}>{participant?.name || participant?.username}</span>
        </div>
      </header>

      {/* Tab warning modal */}
      {showTabWarning && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "2.5rem", maxWidth: 440, width: "90%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>
            <div style={{ fontSize: 48, marginBottom: "0.75rem" }}>⚠️</div>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, marginBottom: "0.75rem", color: "#dc2626" }}>Tab Switch Detected</h2>
            <p style={{ fontSize: 14, color: "#555", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              You switched away from this assessment tab. This has been logged by the system.<br />
              <strong style={{ color: "#111" }}>Total switches recorded: {tabSwitches}</strong>
            </p>
            <button onClick={() => setShowTabWarning(false)} style={btn(CCM_RED, "#fff", { width: "100%" })}>
              Return to Assessment
            </button>
          </div>
        </div>
      )}

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 440, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,.2)" }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, marginBottom: "0.75rem", color: "#111" }}>Submit Assessment?</h2>
            <p style={{ fontSize: 14, color: "#555", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              Once submitted, you will not be able to change your answers. Please make sure you are happy with your responses before continuing.
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

      {/* Main content */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Module header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>
            Module {currentModuleIdx + 1} of {modules.length}
            {assessPhase === "presentation" && mt === "both" && " · Presentation"}
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 26, margin: 0, color: "#111" }}>
            {currentModule?.title}
          </h1>
          {assessPhase === "questions" && questions.length > 0 && (
            <div style={{ marginTop: 10, height: 5, background: "#f0f0f0", borderRadius: 4, overflow: "hidden", maxWidth: 400 }}>
              <div style={{
                height: "100%",
                background: CCM_RED,
                borderRadius: 4,
                width: `${((currentQIdx + 1) / questions.length) * 100}%`,
                transition: "width 0.3s ease",
              }} />
            </div>
          )}
        </div>

        {assessPhase === "questions" && (
          <QuestionsView
            scenario={scenario}
            questions={questions}
            currentQIdx={currentQIdx}
            setCurrentQIdx={setCurrentQIdx}
            answers={answers}
            setAnswers={setAnswers}
            moduleType={mt}
            onProceedToPresentation={() => setAssessPhase("presentation")}
            onSubmit={() => setShowSubmitModal(true)}
          />
        )}

        {assessPhase === "presentation" && (
          <PresentationView
            presentationAnswers={presentationAnswers}
            setPresentationAnswers={setPresentationAnswers}
            uploadedFileUrl={uploadedFileUrl}
            uploading={uploading}
            onUpload={handleFileUpload}
            onSubmit={() => setShowSubmitModal(true)}
          />
        )}
      </main>
    </div>
  );
}
