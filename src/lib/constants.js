export const CCM_RED = "#E8251A";

export const RUBRIC = [
  { score: 1, label: "Well below expectation", color: "#dc2626", bg: "#fef2f2", desc: "Little to no evidence of the competency." },
  { score: 2, label: "Below expectation",      color: "#ea580c", bg: "#fff7ed", desc: "Some evidence but significant gaps." },
  { score: 3, label: "Meeting expectation",    color: "#ca8a04", bg: "#fefce8", desc: "Clear evidence, structured and relevant." },
  { score: 4, label: "Above expectation",      color: "#16a34a", bg: "#f0fdf4", desc: "Strong evidence with depth and insight." },
  { score: 5, label: "Exceptional",            color: "#0369a1", bg: "#eff6ff", desc: "Outstanding - significantly exceeded expectations." },
];

export const RUBRIC_COLOR_MAP = {
  "#dc2626": [220, 38, 38],
  "#ea580c": [234, 88, 12],
  "#ca8a04": [202, 138,  4],
  "#16a34a": [ 22, 163, 74],
  "#0369a1": [  3, 105,161],
};

export const PROMOTION_OPTIONS = [
  { value: "",                   label: "Select a recommendation..." },
  { value: "ready_now",          label: "Ready now - Recommend for promotion or target role" },
  { value: "ready_development",  label: "Ready with development - Recommend with 6-month plan" },
  { value: "not_yet",            label: "Not yet ready - Recommend further time in current role" },
  { value: "further_assessment", label: "Further assessment needed - Recommend additional evaluation" },
];

export const S = {
  page:    { minHeight: "100vh", background: "#f5f5f5", fontFamily: "Arial,sans-serif" },
  header:  { background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  card:    { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1.25rem" },
  btn:     (bg, color, extra = {}) => ({ padding: "9px 18px", background: bg, color, border: `1px solid ${bg === "#fff" ? "#ddd" : bg}`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, ...extra }),
  input:   { padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, color: "#111", outline: "none", background: "#fff", width: "100%", boxSizing: "border-box" },
  textarea:{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, color: "#111", outline: "none", background: "#fff", width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.7, fontFamily: "Arial,sans-serif" },
  badge:   (bg, color) => ({ fontSize: 11, background: bg, color, padding: "3px 10px", borderRadius: 20, border: `1px solid ${color}22`, fontWeight: 500, display: "inline-block" }),
  label:   { fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px", display: "block" },
};
