import { RUBRIC, RUBRIC_COLOR_MAP, PROMOTION_OPTIONS } from "./constants";

export async function callClaude({ system, messages, maxTokens = 400 }) {
  const res = await fetch("/.netlify/functions/generate-ratings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, maxTokens }),
  });
  if (!res.ok) {
    let msg = `AI service error ${res.status}`;
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  const { text } = await res.json();
  return text;
}

// detectCompetency uses the case study's competencies (with keywords) instead of hardcoded ones
export function detectCompetency(text, competencies = []) {
  if (!text || !competencies.length) return "General";
  const lower = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const comp of competencies) {
    const score = (comp.keywords || []).filter(k => lower.includes(k.toLowerCase())).length;
    if (score > bestScore) { bestScore = score; best = comp.name; }
  }
  return best || "General";
}

// generateAIRatings — blank answers get score 0 and are flagged not_attempted
export async function generateAIRatings({ participant, mod, competencies, result }) {
  const answersText = mod.questions.map(q => {
    const ans = (result?.answers?.[q.id] || "").trim();
    const compName = (competencies.find(c => c.id === q.competency_id) || {}).name || "";
    return `[${compName}] Q: ${q.text_advanced || q.text}\nA: ${ans || "BLANK — no answer provided"}`;
  }).join("\n\n");

  const transcriptText = ((result?.sim_messages) || [])
    .filter(m => m.text)
    .map(m => `${m.role === "assessor" ? "Assessor" : "Candidate"}: ${m.text}`)
    .join("\n")
    .substring(0, 3000);

  const compList = competencies.map(c => `"${c.id}"`).join(",");
  const compListFull = competencies.map(c => `"${c.id}":"${c.name}"`).join(",");

  const prompt = `You are an expert assessment center analyst for CCM Consultancy. Do not use em dashes.

Participant: ${participant.name}
Role: ${participant.role || "Not specified"}
Level: ${mod._levelName || ""}
Module: ${mod.title}
Competencies assessed: ${competencies.map(c => c.name).join(", ")}

Written answers:
${answersText}

Interview transcript:
${transcriptText || "No interview transcript available."}

IMPORTANT: If a written answer is BLANK, assign score 0 and mark it as not_attempted.

Rate each competency 1-5 (0 if blank/not attempted). Return valid JSON only — no markdown:
{
  "ratings": {${competencies.map(c => `"${c.id}":3`).join(",")}},
  "not_attempted": {${competencies.map(c => `"${c.id}":false`).join(",")}},
  "interpretations": {${competencies.map(c => `"${c.id}":"2-3 sentence third-person interpretation"`).join(",")}},
  "strengths": {${competencies.map(c => `"${c.id}":"key strengths observed"`).join(",")}},
  "improvements": {${competencies.map(c => `"${c.id}":"areas for development"`).join(",")}},
  "overallNarrative": "3-4 sentence overall summary",
  "developmentPlan": ["action 1","action 2","action 3"]
}`;

  const text = await callClaude({
    system: "Return only valid JSON. No markdown. No em dashes.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 2000,
  });

  if (!text) throw new Error("No response");
  const parsed = JSON.parse(text.replace(/```json|```/g, "").replace(/—/g, "-").trim());
  if (!parsed.ratings) throw new Error("Invalid structure");

  // Enforce: blank answers must be 0
  mod.questions.forEach(q => {
    const ans = (result?.answers?.[q.id] || "").trim();
    if (!ans) {
      parsed.ratings[q.competency_id] = 0;
      if (!parsed.not_attempted) parsed.not_attempted = {};
      parsed.not_attempted[q.competency_id] = true;
    }
  });

  return parsed;
}

// ─── Report Generation ────────────────────────────────────────────────────────

const SCORE_LABELS_AI = {1:"Ineffective",2:"Inconsistent",3:"Effective",4:"Strong",5:"Exceptional"};

function scoreLabel(v) {
  if (v === null) return "Not Scored";
  return SCORE_LABELS_AI[Math.min(5, Math.max(1, Math.round(v)))] || "Not Scored";
}

function buildCompScores(compList, questions, scores, answers, part2Answers, level) {
  const useAdv = level?.complexity_tier === "advanced";
  return compList.map(comp => {
    const qs = questions.filter(q => q.competency_id === comp.id);
    const p1Scores = qs.map(q => scores.part1?.[q.id]).filter(s => s && !s.not_attempted && s.score);
    const p1Avg = p1Scores.length ? p1Scores.reduce((a, s) => a + s.score, 0) / p1Scores.length : null;
    const p2s = scores.part2?.[comp.id];
    const p2Score = p2s && !p2s.not_attempted && p2s.score ? p2s.score : null;
    const overall = p1Avg !== null && p2Score !== null ? (p1Avg + p2Score) / 2 : (p1Avg ?? p2Score ?? null);
    const qText = qs.map(q => {
      const t = useAdv ? (q.text_advanced || q.text_standard) : (q.text_standard || q.text_advanced);
      const a = ((answers?.questions || {})[q.id] || answers?.[q.id] || "Not attempted").substring(0, 300);
      return `Q: ${t}\nA: ${a}`;
    }).join("\n\n");
    const p1Notes = qs.map(q => scores.part1?.[q.id]?.notes).filter(Boolean).join(" ");
    return {
      id: comp.id, name: comp.name, p1Avg, p2Score, overall,
      label: scoreLabel(overall),
      qText,
      p2Text: (part2Answers?.written_response || "").substring(0, 400),
      notes: [p1Notes, p2s?.notes].filter(Boolean).join(" | "),
    };
  });
}

const AC_RULES = `AC Language Rules:
- Never say "passed" or "failed"
- Always say "The candidate demonstrated..."
- Recommendation categories ONLY: "Recommended" | "Recommended with Development" | "Deferred" | "Not Recommended"
- Scores: 1=Ineffective, 2=Inconsistent, 3=Effective, 4=Strong, 5=Exceptional
- No em dashes. Formal, third-person tone.`;

// Fixed boilerplate — injected into AI responses and pre-filled in manual edit mode
export const BOILERPLATE_METHODOLOGY = "This assessment was conducted using CCM Consultancy's Assessment Center methodology, combining structured behavioral questions and case study analysis. Competencies were assessed against standardized criteria across two components: Part 1 (Behavioral Questions) and Part 2 (Case Study Tasks), rated on a 1–5 scale where 1=Ineffective and 5=Exceptional.";

export const BOILERPLATE_HOW_TO_USE = "This report provides the results of the Assessment Center, along with scores, behavioral evidence, and a development plan for each competency assessed. It is intended to support a feedback conversation between the assessor and the participant. The development plan should be discussed and agreed upon collaboratively. Scores reflect observed behavior during the assessment and should be considered alongside other performance data.";

export const BOILERPLATE_ASSESSOR_DECLARATION = "This report was produced by CCM Consultancy following a structured Assessment Center process. All ratings reflect assessor judgment based on observed behavioral evidence collected during the assessment. This report is confidential and intended solely for the use of the commissioning organization.";

export async function generateIndividualReport({ participant, level, cohort, module, questions, compList, scores, answers, part2Answers, completedAt }) {
  const compScores = buildCompScores(compList, questions, scores, answers, part2Answers, level);
  const overallVals = compScores.map(c => c.overall).filter(v => v !== null);
  const overallScore = overallVals.length ? overallVals.reduce((a, b) => a + b, 0) / overallVals.length : null;

  const header = `You are an expert Assessment Center report writer for CCM Consultancy. ${AC_RULES}

PARTICIPANT: ${participant.name} | Role: ${participant.role || "Not specified"} | Level: ${level?.name || "Not specified"} | Cohort: ${cohort?.name || "Not specified"} | Module: ${module?.name || module?.title || "Assessment Module"} | Date: ${completedAt ? new Date(completedAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")} | Overall Score: ${overallScore ? overallScore.toFixed(1) : "N/A"}

COMPETENCY DATA:
${compScores.map(c => `[${c.name}] Score: ${c.overall ? c.overall.toFixed(1) : "N/A"} (${c.label})\n${c.qText}${c.p2Text ? `\nPart 2: ${c.p2Text}` : ""}${c.notes ? `\nNotes: ${c.notes}` : ""}`).join("\n\n")}`;

  // Call 1 — sections 1 and 4 (assessmentMethodology and howToUse are fixed boilerplate)
  const prompt1 = `${header}

Return ONLY valid JSON:
{"executiveSummary":"3-4 sentences tailored to this participant","competencies":[{"name":"exact competency name","measures":"1 sentence on what this competency measures as a leadership behavior","demonstrated":"2 sentences of specific behavioral evidence using AC language — The candidate demonstrated...","strength":"1 sentence on observed strength","developmentOpportunity":"1 sentence on development area"}]}`;

  const text1 = await callClaude({ system: "Return only valid JSON. No markdown. No em dashes.", messages: [{ role: "user", content: prompt1 }], maxTokens: 1500 });
  if (!text1) throw new Error("No AI response (call 1)");
  const part1 = JSON.parse(text1.replace(/```json|```/g, "").trim());

  // Call 2 — sections 5–7 with one consolidated 70-20-10 plan
  const prompt2 = `${header}

Return ONLY valid JSON for sections 5-7:
{"overallStrengths":"2-3 sentences on overall strengths across all competencies","areasForDevelopment":"2-3 sentences on top development priorities","devPlan":{"on70":["3-4 specific workplace actions targeting the top 2 development priorities"],"social20":["2-3 coaching or mentoring actions"],"formal10":["2-3 Coursera, HBR, or book recommendations with titles"]},"recommendation":"one category only: Recommended OR Recommended with Development OR Deferred OR Not Recommended","recommendationNarrative":"2-3 sentences using AC language — The candidate demonstrated..."}`;

  const text2 = await callClaude({ system: "Return only valid JSON. No markdown. No em dashes.", messages: [{ role: "user", content: prompt2 }], maxTokens: 1500 });
  if (!text2) throw new Error("No AI response (call 2)");
  const part2 = JSON.parse(text2.replace(/```json|```/g, "").trim());

  return {
    ...part1,
    ...part2,
    assessmentMethodology: BOILERPLATE_METHODOLOGY,
    howToUse: BOILERPLATE_HOW_TO_USE,
  };
}

export async function generateClientReport({ participant, level, cohort, module, questions, compList, scores, answers, part2Answers, completedAt, assessorName }) {
  const compScores = buildCompScores(compList, questions, scores, answers, part2Answers, level);
  const overallVals = compScores.map(c => c.overall).filter(v => v !== null);
  const overallScore = overallVals.length ? overallVals.reduce((a, b) => a + b, 0) / overallVals.length : null;

  const prompt = `You are an expert Assessment Center report writer for CCM Consultancy. ${AC_RULES}

Write a CLIENT REPORT (formal, concise, suitable for the client organization).

PARTICIPANT: ${participant.name} | Role: ${participant.role || "Not specified"} | Level: ${level?.name || "Not specified"} | Cohort: ${cohort?.name || "Not specified"} | Module: ${module?.name || module?.title || "Assessment Module"} | Date: ${completedAt ? new Date(completedAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")} | Assessor: ${assessorName || "CCM Consultancy"} | Overall Score: ${overallScore ? overallScore.toFixed(1) : "N/A"}

COMPETENCY SCORES:
${compScores.map(c => `[${c.name}] ${c.overall ? c.overall.toFixed(1) : "N/A"} (${c.label}) | Notes: ${c.notes || "None"}`).join("\n")}

Return ONLY valid JSON:
{"executiveSummary":"3-4 sentences","competencies":[{"name":"exact name","evidence":"one concise sentence of evidence","developmentPriority":"one line development priority"}],"overallStrengths":"2-3 sentences","areasForDevelopment":"2-3 sentences","devSummary":[{"competency":"name","action":"one line recommended action"}],"recommendation":"one category only","recommendationNarrative":"2-3 formal sentences"}`;

  const text = await callClaude({ system: "Return only valid JSON. No markdown. No em dashes.", messages: [{ role: "user", content: prompt }], maxTokens: 2000 });
  if (!text) throw new Error("No AI response");
  return { ...JSON.parse(text.replace(/```json|```/g, "").trim()), assessorDeclaration: BOILERPLATE_ASSESSOR_DECLARATION };
}

export async function generateCohortReport({ cohortName, moduleName, cohortData, compList, assessorName }) {
  // cohortData: [{ name, role, level, overall, compScores: [{name, overall}] }]
  const avgByComp = compList.map(comp => {
    const vals = cohortData.map(p => (p.compScores.find(c => c.name === comp.name) || {}).overall).filter(v => v !== null && v !== undefined);
    return { name: comp.name, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null, count: vals.length };
  });

  const context = `You are an expert Assessment Center report writer for CCM Consultancy. ${AC_RULES}

Cohort: ${cohortName} | Module: ${moduleName} | Assessor: ${assessorName || "CCM Consultancy"} | Participants: ${cohortData.length}

COHORT COMPETENCY AVERAGES:
${avgByComp.map(c => `${c.name}: ${c.avg ? c.avg.toFixed(1) : "N/A"} (${scoreLabel(c.avg)}) across ${c.count} participants`).join("\n")}

INDIVIDUAL SCORES:
${cohortData.map(p => `${p.name} (${p.level || "Unknown level"}): Overall ${p.overall ? p.overall.toFixed(1) : "N/A"} | ${p.compScores.map(c => `${c.name}: ${c.overall ? c.overall.toFixed(1) : "N/A"}`).join(", ")}`).join("\n")}`;

  // Call 1 — narrative sections (no participant summaries to stay within timeout)
  const prompt1 = `${context}

Return ONLY valid JSON for the narrative sections:
{"executiveSummary":"3-4 sentences on overall cohort performance","competencyInsights":[{"name":"exact name","cohortObs":"2-3 sentences on cohort pattern for this competency"}],"overallStrengths":"2-3 sentences on cohort-wide strengths","developmentThemes":"2-3 sentences on cohort-wide development themes","devPriorities":[{"priority":"Theme name describing the development priority across the cohort","rationale":"1 sentence on why this is a priority for this cohort","on70":"one cohort-wide on-the-job action","social20":"one cohort-wide social or mentoring action","formal10":"one resource recommendation with title"},{"priority":"Second theme name","rationale":"1 sentence","on70":"one action","social20":"one action","formal10":"one resource with title"},{"priority":"Third theme name","rationale":"1 sentence","on70":"one action","social20":"one action","formal10":"one resource with title"}]}`;

  const text1 = await callClaude({ system: "Return only valid JSON. No markdown. No em dashes.", messages: [{ role: "user", content: prompt1 }], maxTokens: 2000 });
  if (!text1) throw new Error("No AI response (call 1)");
  const part1 = JSON.parse(text1.replace(/```json|```/g, "").trim());

  // Call 2 — individual participant summaries
  const prompt2 = `${context}

Write a one-paragraph summary and recommendation for EACH participant listed above.

Return ONLY valid JSON:
{"participantSummaries":[{"name":"exact participant name","recommendation":"one category only","summary":"one paragraph using AC language — The candidate demonstrated..."}]}`;

  const text2 = await callClaude({ system: "Return only valid JSON. No markdown. No em dashes.", messages: [{ role: "user", content: prompt2 }], maxTokens: 1500 });
  if (!text2) throw new Error("No AI response (call 2)");
  const part2 = JSON.parse(text2.replace(/```json|```/g, "").trim());

  return { ...part1, participantSummaries: part2.participantSummaries || [], assessorDeclaration: BOILERPLATE_ASSESSOR_DECLARATION };
}

// ─── PDF helpers ───────────────────────────────────────────────────────────────

function loadJsPDF() {
  return new Promise(resolve => {
    if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(s);
  });
}

function pdfSetup(doc) {
  const W = 210, margin = 20, cW = W - margin * 2;
  let y = margin;
  const checkPage = (needed = 20) => { if (y + needed > 275) { doc.addPage(); y = margin; } };
  const addText = (text, x, fontSize, bold, color) => {
    doc.setFontSize(fontSize || 11);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...(color || [17, 17, 17]));
    const lines = doc.splitTextToSize(String(text), cW - (x - margin));
    doc.text(lines, x, y);
    y += lines.length * ((fontSize || 11) * 0.45) + 2;
  };
  const addSection = (title) => {
    checkPage(12); y += 4;
    doc.setFillColor(232, 37, 26); doc.rect(margin, y, cW, 0.5, "F"); y += 4;
    addText(title, margin, 13, true, [232, 37, 26]); y += 2;
  };
  const redHeader = (right) => {
    doc.setFillColor(232, 37, 26); doc.rect(0, 0, 210, 12, "F");
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("CCM CONSULTANCY", margin, 8);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(right, W - margin, 8, { align: "right" });
  };
  return { W, margin, cW, addText, addSection, redHeader, checkPage, getY: () => y, setY: (v) => { y = v; } };
}

export async function downloadAssessorPDF({
  participant, levelName, mod, competencies, questions,
  result, ratings, reportData, devActivities, ratingNotes,
  promotionRec, assessorName, weights,
}) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { margin, cW, addText, addSection, redHeader, checkPage, getY, setY } = pdfSetup(doc);
  let y;
  const setDocY = (v) => { setY(v); y = v; };

  redHeader("ASSESSMENT CENTER - ASSESSOR REPORT (CONFIDENTIAL)");
  setDocY(22);

  addText("Assessor Report", margin, 16, true); setDocY(getY() + 2);
  addText(`CCM Consultancy Assessment Center | ${new Date().toLocaleDateString()}`, margin, 9, false, [120, 120, 120]);
  setDocY(getY() + 6);

  const promLabel = (PROMOTION_OPTIONS.find(o => o.value === promotionRec) || {}).label || "Not yet selected";
  const tableRows = [
    ["Participant", participant.name, "Level", levelName],
    ["Role assessed", participant.role || "Not specified", "Assessor", assessorName || "CCM Consultancy"],
    ["Module", mod.title, "Date", new Date().toLocaleDateString()],
    ["Time on task", `${Math.round(((result?.time_spent) || 0) / 60)} min`, "Weightings", `Written ${weights.written}% / Interview ${weights.interview}% / Role play ${weights.roleplay}%`],
  ];

  tableRows.forEach((row, i) => {
    checkPage(10);
    if (i % 2 === 0) doc.setFillColor(249, 249, 249); else doc.setFillColor(255, 255, 255);
    const cy = getY();
    doc.rect(margin, cy - 4, cW, 9, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80); doc.text(row[0], margin + 2, cy);
    doc.setFont("helvetica", "normal"); doc.setTextColor(17, 17, 17); doc.text(String(row[1]).substring(0, 40), margin + 45, cy);
    doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80); doc.text(row[2], margin + 105, cy);
    doc.setFont("helvetica", "normal"); doc.setTextColor(17, 17, 17); doc.text(String(row[3]).substring(0, 35), margin + 148, cy);
    setDocY(cy + 9);
  });

  setDocY(getY() + 4);
  checkPage(12);
  doc.setFillColor(255, 241, 241); doc.rect(margin, getY() - 4, cW, 10, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(153, 27, 27);
  doc.text("CONFIDENTIAL - For the assessing team and authorised client representatives only.", margin + 2, getY());
  setDocY(getY() + 10);

  addSection("Assessor Recommendation");
  checkPage(12);
  doc.setFillColor(239, 246, 255); doc.rect(margin, getY() - 4, cW, 12, "F");
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(3, 105, 161);
  doc.text(promLabel, margin + 2, getY() + 2); setDocY(getY() + 14);

  addSection("Competency Ratings and Assessment");
  competencies.forEach(comp => {
    const score = (ratings || {})[comp.id];
    const notAttempted = reportData?.not_attempted?.[comp.id];
    checkPage(35);
    const rb = RUBRIC.find(r => r.score === score) || RUBRIC[2];
    const col = notAttempted ? [120, 120, 120] : (RUBRIC_COLOR_MAP[rb.color] || [17, 17, 17]);
    doc.setFillColor(...col); doc.rect(margin, getY() - 4, 2, 14, "F");
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(...col);
    const scoreLabel = notAttempted ? `${comp.name}: Not attempted` : `${comp.name}: ${score}/5 - ${rb.label}`;
    doc.text(scoreLabel, margin + 5, getY()); setDocY(getY() + 7);
    if (notAttempted) {
      doc.setFontSize(9); doc.setFont("helvetica", "italic"); doc.setTextColor(120, 120, 120);
      doc.text("No written response was provided for this competency. Score recorded as 0.", margin + 5, getY());
      setDocY(getY() + 5);
    } else {
      if (reportData?.interpretations?.[comp.id]) { doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); const lines = doc.splitTextToSize(`Assessment: ${reportData.interpretations[comp.id]}`, cW - 5); doc.text(lines, margin + 5, getY()); setDocY(getY() + lines.length * 4 + 2); }
      if (reportData?.strengths?.[comp.id])      { doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(22, 101, 52); doc.text("Strengths:", margin + 5, getY()); doc.setFont("helvetica", "normal"); const lines = doc.splitTextToSize(reportData.strengths[comp.id], cW - 30); doc.text(lines, margin + 25, getY()); setDocY(getY() + lines.length * 4 + 2); }
      if (reportData?.improvements?.[comp.id])   { doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(153, 27, 27); doc.text("For development:", margin + 5, getY()); doc.setFont("helvetica", "normal"); const lines = doc.splitTextToSize(reportData.improvements[comp.id], cW - 40); doc.text(lines, margin + 40, getY()); setDocY(getY() + lines.length * 4 + 2); }
    }
    const noteKey = `${comp.id}`;
    if (ratingNotes?.[noteKey]) { doc.setFontSize(9); doc.setFont("helvetica", "italic"); doc.setTextColor(80, 80, 80); const lines = doc.splitTextToSize(`Assessor notes: ${ratingNotes[noteKey]}`, cW - 5); doc.text(lines, margin + 5, getY()); setDocY(getY() + lines.length * 4 + 2); }
    setDocY(getY() + 4);
  });

  if (reportData?.overallNarrative) {
    addSection("Overall Performance Summary");
    checkPage(20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(reportData.overallNarrative, cW);
    doc.text(lines, margin, getY()); setDocY(getY() + lines.length * 5 + 4);
  }

  addSection("Written Responses");
  (questions || []).forEach((q, qi) => {
    checkPage(25);
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 120, 120);
    const compName = (competencies.find(c => c.id === q.competency_id) || {}).name || "";
    doc.text(`[${compName}] Question ${qi + 1}`, margin, getY()); setDocY(getY() + 5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(17, 17, 17);
    const qLines = doc.splitTextToSize(q.text_advanced || q.text || "", cW);
    doc.text(qLines, margin, getY()); setDocY(getY() + qLines.length * 4 + 3);
    checkPage(15);
    const ans = ((result?.answers || {})[q.id] || "").trim() || "Not attempted — no written response provided";
    const aLines = doc.splitTextToSize(ans, cW - 4);
    doc.setFillColor(249, 249, 249); doc.rect(margin, getY() - 3, cW, aLines.length * 4.5 + 4, "F");
    doc.setFontSize(9); doc.text(aLines, margin + 2, getY()); setDocY(getY() + aLines.length * 4.5 + 8);
  });

  addSection("Development Recommendations (70-20-10)");
  competencies.forEach(comp => {
    const da = (devActivities || []).find(d => d.competency_id === comp.id);
    if (!da) return;
    checkPage(20);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(232, 37, 26);
    doc.text(comp.name, margin, getY()); setDocY(getY() + 6);
    [["70% - On the job", da.on_job || []], ["20% - Learning from others", da.social || []], ["10% - Formal learning", da.formal || []]].forEach(([label, items]) => {
      checkPage(10); doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80);
      doc.text(label, margin + 2, getY()); setDocY(getY() + 5);
      items.forEach((item, i) => {
        checkPage(8); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(`${i + 1}. ${item}`, cW - 6);
        doc.text(lines, margin + 4, getY()); setDocY(getY() + lines.length * 4 + 2);
      });
      setDocY(getY() + 2);
    });
    setDocY(getY() + 4);
  });

  doc.save(`CCM_Assessor_Report_${participant.name.replace(/\s/g, "_")}_${mod.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

export async function downloadParticipantPDF({
  participant, levelName, mod, competencies, result, ratings, reportData, devActivities,
}) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { margin, cW, addText, addSection, redHeader, checkPage, getY, setY } = pdfSetup(doc);
  let y;
  const setDocY = (v) => { setY(v); y = v; };

  redHeader("PERSONAL DEVELOPMENT REPORT");
  setDocY(22);

  doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 17, 17);
  doc.text("Personal Development Report", margin, getY()); setDocY(getY() + 10);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
  doc.text(`Prepared for: ${participant.name}`, margin, getY()); setDocY(getY() + 6);
  doc.text(`Role: ${participant.role || "Not specified"} | Level: ${levelName}`, margin, getY()); setDocY(getY() + 6);
  doc.text(`Module assessed: ${mod.title}`, margin, getY()); setDocY(getY() + 6);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, getY()); setDocY(getY() + 10);
  doc.setFillColor(232, 37, 26); doc.rect(margin, getY(), cW, 0.5, "F"); setDocY(getY() + 6);

  addSection("Introduction");
  checkPage(20);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
  const intro = `${participant.name} participated in the CCM Consultancy Assessment Center as part of a structured competency evaluation. The assessment covered the module ${mod.title}, which assessed the competencies of ${competencies.map(c => c.name).join(" and ")}. This report summarizes ${participant.name}'s performance across the assessed competencies and provides a personalized development plan structured using the 70-20-10 learning framework.`;
  const introLines = doc.splitTextToSize(intro, cW);
  doc.text(introLines, margin, getY()); setDocY(getY() + introLines.length * 5 + 8);

  addSection("Competency Performance");
  const hasRatings = Object.keys(ratings || {}).length > 0;

  if (!hasRatings) {
    checkPage(20);
    doc.setFillColor(255, 251, 235); doc.rect(margin, getY() - 4, cW, 18, "F");
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 83, 0);
    doc.text("Assessment under review.", margin + 3, getY() + 2);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(120, 83, 0);
    const wLines = doc.splitTextToSize("Your assessor is currently reviewing your responses. Your competency ratings and personalized development plan will be included in your final report once the review is complete.", cW - 6);
    doc.text(wLines, margin + 3, getY() + 8); setDocY(getY() + 24);
  } else {
    competencies.forEach(comp => {
      const score = (ratings || {})[comp.id];
      const notAttempted = reportData?.not_attempted?.[comp.id];
      checkPage(30);
      const rb = RUBRIC.find(r => r.score === score) || RUBRIC[2];
      const col = notAttempted ? [120, 120, 120] : (RUBRIC_COLOR_MAP[rb.color] || [17, 17, 17]);
      doc.setFillColor(...col); doc.rect(margin, getY() - 4, 3, 16, "F");
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(...col);
      doc.text(comp.name, margin + 6, getY()); setDocY(getY() + 6);
      doc.setFontSize(10);
      doc.text(notAttempted ? "Not attempted — score: 0" : `${score}/5 - ${rb.label}`, margin + 6, getY()); setDocY(getY() + 6);
      if (!notAttempted && reportData?.interpretations?.[comp.id]) {
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(reportData.interpretations[comp.id], cW - 8);
        doc.text(lines, margin + 6, getY()); setDocY(getY() + lines.length * 4 + 4);
      }
      setDocY(getY() + 3);
    });

    if (reportData?.overallNarrative) {
      checkPage(20);
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 17, 17);
      doc.text("Overall Summary", margin, getY()); setDocY(getY() + 6);
      doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(reportData.overallNarrative, cW);
      doc.text(lines, margin, getY()); setDocY(getY() + lines.length * 5 + 6);
    }

    addSection("Personalized Development Plan (70-20-10 Framework)");
    checkPage(20);
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
    const fwText = "The 70-20-10 framework reflects research evidence that most effective professional learning happens through on-the-job experience (70%), learning from others such as mentors and coaches (20%), and formal structured learning (10%).";
    const fwLines = doc.splitTextToSize(fwText, cW);
    doc.text(fwLines, margin, getY()); setDocY(getY() + fwLines.length * 4 + 8);

    competencies.forEach(comp => {
      const da = (devActivities || []).find(d => d.competency_id === comp.id);
      if (!da) return;
      checkPage(25);
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(232, 37, 26);
      doc.text(comp.name, margin, getY()); setDocY(getY() + 7);
      [["70% - On the job (learning by doing)", da.on_job || []], ["20% - Learning from others (mentoring and coaching)", da.social || []], ["10% - Formal learning", da.formal || []]].forEach(([label, items]) => {
        checkPage(12); doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80);
        doc.text(label, margin + 2, getY()); setDocY(getY() + 5);
        items.forEach((item, i) => {
          checkPage(10); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
          const lines = doc.splitTextToSize(`${i + 1}. ${item}`, cW - 6);
          doc.text(lines, margin + 4, getY()); setDocY(getY() + lines.length * 4 + 3);
        });
        setDocY(getY() + 3);
      });
      setDocY(getY() + 5);
    });

    addSection("Next Steps");
    checkPage(30);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    [`${participant.name} is encouraged to share this development plan with their line manager within the next two weeks and to agree on which activities to prioritise in the first 90 days.`, "The recommended approach is to begin with one activity from each of the three 70-20-10 categories for each assessed competency, and to review progress monthly in a structured one-to-one conversation.", "CCM Consultancy recommends a formal follow-up review at 90 days to assess progress and adjust the plan as needed."].forEach(ns => {
      const lines = doc.splitTextToSize(ns, cW);
      doc.text(lines, margin, getY()); setDocY(getY() + lines.length * 5 + 4);
    });
  }

  checkPage(15);
  setDocY(getY() + 10);
  doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.setTextColor(150, 150, 150);
  doc.text("Prepared by CCM Consultancy. This report is intended solely for the named participant.", margin, getY());
  doc.save(`CCM_Development_Report_${participant.name.replace(/\s/g, "_")}.pdf`);
}
