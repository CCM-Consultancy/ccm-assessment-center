const SB_URL    = "https://xczfixvzgpcodjzofeqq.supabase.co";
const SB_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjemZpeHZ6Z3Bjb2Rqem9mZXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzQyMTQsImV4cCI6MjA5MzYxMDIxNH0.0GkWMaK6XuXNmYl6-gesBglhCv9wJbOBIVIcvNLqnkI";

// ─── AI Question Suggestions ───────────────────────────────────────────────────

export async function suggestQuestions(caseName, compName) {
  const res = await fetch("/.netlify/functions/suggest-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseStudyName: caseName, competencyName: compName }),
  });
  if (!res.ok) {
    let msg = `Suggestion service error ${res.status}`;
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  const { suggestions } = await res.json();
  return suggestions;
}

// ─── AI Competency Definition ──────────────────────────────────────────────────

export async function generateCompetencyDefinition(compName) {
  const res = await fetch("/.netlify/functions/generate-competency", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ competencyName: compName }),
  });
  if (!res.ok) {
    let msg = `Definition service error ${res.status}`;
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  const { definition, observed_in } = await res.json();
  return { definition, observed_in };
}

// ─── AI Assessor Guide Generation ─────────────────────────────────────────────

export async function generateAssessorGuide(caseName, compName, questions) {
  const res = await fetch("/.netlify/functions/generate-guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseStudyName: caseName, competencyName: compName, questions }),
  });
  if (!res.ok) {
    let msg = `Guide service error ${res.status}`;
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return await res.json();
}

async function q(table, method = "GET", body = null, query = "") {
  const res = await fetch(`${SB_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST"
        ? "resolution=merge-duplicates,return=representation"
        : method === "PATCH"
        ? "return=representation"
        : "return=representation",
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = parsed?.message || parsed?.error_description || `HTTP ${res.status}`;
    throw new Error(`[${table}] ${msg}`);
  }
  return parsed;
}

const arr    = (res) => Array.isArray(res) ? res : [];
const first  = (res) => (Array.isArray(res) ? res[0] : res) || null;
const now    = () => new Date().toISOString();
const inList = (ids) => `(${ids.join(",")})`;

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings() {
  const rows = await q("ac_settings", "GET", null, "?select=key,value");
  const s = {};
  (rows || []).forEach(r => { s[r.key] = r.value; });
  return s;
}

export async function saveSetting(key, value) {
  return q("ac_settings", "POST", { key, value, updated_at: now() });
}

// ─── Global Competency Library ────────────────────────────────────────────────

export async function getLibraryCompetencies() {
  return arr(await q("ccm_competencies", "GET", null, "?select=*&order=category.asc,name.asc"));
}

export async function saveLibraryCompetency(data) {
  return first(await q("ccm_competencies", "POST", { created_at: now(), ...data }));
}

export async function deleteLibraryCompetency(id) {
  await q("ccm_competencies", "DELETE", null, `?id=eq.${id}`);
}

// ─── Case Study Competency Assignments ────────────────────────────────────────

export async function getAssignedCompetencies(caseStudyId) {
  const assignments = arr(await q("cs_competency_assignments", "GET", null,
    `?case_study_id=eq.${caseStudyId}&select=*&order=display_order.asc`));
  if (!assignments.length) return [];
  const ids = assignments.map(a => a.competency_id);
  const comps = arr(await q("ccm_competencies", "GET", null,
    `?id=in.(${ids.join(",")})&select=*`));
  return assignments.map(a => ({
    ...a,
    competency: comps.find(c => c.id === a.competency_id) || null,
  }));
}

export async function assignCompetency(caseStudyId, competencyId, displayOrder) {
  return first(await q("cs_competency_assignments", "POST", {
    case_study_id: caseStudyId,
    competency_id: competencyId,
    display_order: displayOrder,
    created_at: now(),
  }));
}

export async function unassignCompetency(caseStudyId, competencyId) {
  await q("cs_competency_assignments", "DELETE", null,
    `?case_study_id=eq.${caseStudyId}&competency_id=eq.${competencyId}`);
}

// ─── Assessor Guides (per competency) ────────────────────────────────────────
// Table: cs_competency_guides
//   id             uuid primary key default gen_random_uuid()
//   case_study_id  uuid references case_studies(id) on delete cascade
//   competency_id  uuid references ccm_competencies(id) on delete cascade
//   definition     text
//   score_descriptors jsonb  -- array of {score, label, description}
//   strong_indicators jsonb  -- string[]
//   weak_indicators   jsonb  -- string[]
//   updated_at     timestamptz
//   unique(case_study_id, competency_id)

export async function getCompetencyGuide(caseStudyId, competencyId) {
  return first(await q("cs_competency_guides", "GET", null,
    `?case_study_id=eq.${caseStudyId}&competency_id=eq.${competencyId}&select=*`));
}

export async function saveCompetencyGuide(data) {
  return first(await q("cs_competency_guides", "POST", { ...data, updated_at: now() }));
}

// ─── Case Studies ─────────────────────────────────────────────────────────────

export async function getCaseStudies() {
  return arr(await q("case_studies", "GET", null, "?select=*&order=created_at.asc"));
}

export async function saveCaseStudy(data) {
  return first(await q("case_studies", "POST", { ...data, updated_at: now() }));
}

export async function deleteCaseStudy(id) {
  await q("case_studies", "DELETE", null, `?id=eq.${id}`);
}

export async function getFullCaseStudy(id) {
  const [cs, levels, competencies, modules] = await Promise.all([
    q("case_studies",    "GET", null, `?id=eq.${id}&select=*`),
    q("cs_levels",       "GET", null, `?case_study_id=eq.${id}&select=*&order=display_order.asc`),
    q("cs_competencies", "GET", null, `?case_study_id=eq.${id}&select=*&order=display_order.asc`),
    q("cs_modules",      "GET", null, `?case_study_id=eq.${id}&select=*&order=display_order.asc`),
  ]);

  const moduleIds = (modules || []).map(m => m.id);
  const compIds   = (competencies || []).map(c => c.id);
  let scenarios = [], questions = [], guide = [], rolePlays = [], moduleLevels = [], devActivities = [], questionBank = [];

  if (moduleIds.length) {
    const mf = inList(moduleIds);
    const [s, qs, ml, rp] = await Promise.all([
      q("cs_scenarios",     "GET", null, `?module_id=in.${mf}&select=*`),
      q("cs_questions",     "GET", null, `?module_id=in.${mf}&select=*&order=display_order.asc`),
      q("cs_module_levels", "GET", null, `?module_id=in.${mf}&select=*`),
      q("cs_role_plays",    "GET", null, `?module_id=in.${mf}&select=*`),
    ]);
    scenarios    = s  || [];
    questions    = qs || [];
    moduleLevels = ml || [];
    rolePlays    = rp || [];

    if (questions.length) {
      const qf = inList(questions.map(x => x.id));
      guide = (await q("cs_guide", "GET", null, `?question_id=in.${qf}&select=*`)) || [];
    }
  }

  if (compIds.length) {
    const cf = inList(compIds);
    const [da, qb] = await Promise.all([
      q("cs_development_activities", "GET", null, `?competency_id=in.${cf}&select=*`),
      q("cs_question_bank",          "GET", null, `?competency_id=in.${cf}&select=*&order=created_at.asc`),
    ]);
    devActivities = da || [];
    questionBank  = qb || [];
  }

  return {
    caseStudy:    (cs || [])[0] || null,
    levels:       levels       || [],
    competencies: competencies || [],
    modules:      modules      || [],
    scenarios,
    questions,
    guide,
    rolePlays,
    moduleLevels,
    devActivities,
    questionBank,
  };
}

// ─── Levels ───────────────────────────────────────────────────────────────────

export async function saveLevel(data) {
  return first(await q("cs_levels", "POST", data));
}

export async function deleteLevel(id) {
  await q("cs_levels", "DELETE", null, `?id=eq.${id}`);
}

export async function getAllLevels() {
  return arr(await q("cs_levels", "GET", null, "?select=*"));
}

// ─── Competencies (case-study level — legacy) ─────────────────────────────────

export async function saveCompetency(data) {
  return first(await q("cs_competencies", "POST", { created_at: now(), ...data }));
}

export async function deleteCompetency(id) {
  await q("cs_competencies", "DELETE", null, `?id=eq.${id}`);
}

// ─── Modules ──────────────────────────────────────────────────────────────────

export async function saveModule(data) {
  return first(await q("cs_modules", "POST", { created_at: now(), ...data }));
}

export async function deleteModule(id) {
  await q("cs_modules", "DELETE", null, `?id=eq.${id}`);
}

export async function saveModuleLevels(moduleId, levelIds) {
  await q("cs_module_levels", "DELETE", null, `?module_id=eq.${moduleId}`);
  if (!levelIds.length) return;
  await q("cs_module_levels", "POST", levelIds.map(level_id => ({ module_id: moduleId, level_id })));
}

export async function saveScenario(data) {
  return first(await q("cs_scenarios", "POST", data));
}

export async function saveQuestion(data) {
  return first(await q("cs_questions", "POST", { created_at: now(), ...data }));
}

export async function deleteQuestion(id) {
  await q("cs_questions", "DELETE", null, `?id=eq.${id}`);
}

export async function saveGuide(data) {
  return first(await q("cs_guide", "POST", data));
}

export async function saveRolePlay(data) {
  return first(await q("cs_role_plays", "POST", data));
}

// ─── Development Activities ───────────────────────────────────────────────────

export async function saveDevActivities(data) {
  return first(await q("cs_development_activities", "POST", { ...data, updated_at: now() }));
}

// ─── Question Bank ────────────────────────────────────────────────────────────

export async function saveQuestionBankItem(data) {
  return first(await q("cs_question_bank", "POST", { created_at: now(), ...data }));
}

export async function deleteQuestionBankItem(id) {
  await q("cs_question_bank", "DELETE", null, `?id=eq.${id}`);
}

// ─── Cohorts ──────────────────────────────────────────────────────────────────

export async function getCohortByAccessCode(code) {
  return first(await q("cohorts", "GET", null,
    `?access_code=eq.${encodeURIComponent(code)}&is_active=eq.true&select=*`));
}

export async function getCohorts() {
  return arr(await q("cohorts", "GET", null, "?select=*&order=created_at.asc"));
}

export async function saveCohort(data) {
  return first(await q("cohorts", "POST", { created_at: now(), ...data }));
}

export async function deleteCohort(id) {
  await q("cohorts", "DELETE", null, `?id=eq.${id}`);
}

// ─── Participants ─────────────────────────────────────────────────────────────

export async function getParticipants() {
  return arr(await q("ac_participants", "GET", null, "?select=*&order=created_at.asc"));
}

export async function saveParticipant(data) {
  return first(await q("ac_participants", "POST", { created_at: now(), ...data }));
}

export async function updateParticipant(id, fields) {
  return first(await q("ac_participants", "PATCH", fields, `?id=eq.${id}`));
}

export async function deleteParticipant(id) {
  await q("ac_participants", "DELETE", null, `?id=eq.${id}`);
}

export async function loginParticipant(username, password) {
  const rows = await q("ac_participants", "GET", null,
    `?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}&select=*`);
  if (!rows?.length) return null;
  const p = rows[0];
  const [levels, cohorts] = await Promise.all([
    q("cs_levels", "GET", null, `?id=eq.${p.level_id}&select=*`),
    q("cohorts",   "GET", null, `?id=eq.${p.cohort_id}&select=*`),
  ]);
  const level  = (levels  || [])[0];
  const cohort = (cohorts || [])[0];
  if (!level || !cohort) return null;
  return { ...p, level, cohort };
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function uploadStorageFile(bucket, path, file) {
  const mime = file.type || guessMime(file.name);
  const res = await fetch(`${SB_URL}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey:          SB_KEY,
      Authorization:   `Bearer ${SB_KEY}`,
      "Content-Type":  mime,
      "x-upsert":      "true",
      "Cache-Control": "3600",
    },
    body: file,
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      msg = j?.message || j?.error || j?.error_description || text || msg;
    } catch { msg = text || msg; }
    throw new Error(`[Storage ${res.status}] ${msg}`);
  }
  return `${SB_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function guessMime(filename) {
  const ext = (filename || "").split(".").pop().toLowerCase();
  const map = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
    pdf: "application/pdf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls:  "application/vnd.ms-excel",
  };
  return map[ext] || "application/octet-stream";
}

// ─── Participant Session ───────────────────────────────────────────────────────

export async function loadParticipantSession(p) {
  const csId = p.cohort.case_study_id;
  const [cs, competencies, allModules, mlForLevel] = await Promise.all([
    q("case_studies",    "GET", null, `?id=eq.${csId}&select=*`),
    q("cs_competencies", "GET", null, `?case_study_id=eq.${csId}&select=*&order=display_order.asc`),
    q("cs_modules",      "GET", null, `?case_study_id=eq.${csId}&select=*&order=display_order.asc`),
    q("cs_module_levels","GET", null, `?level_id=eq.${p.level_id}&select=module_id`),
  ]);

  const allowedIds = new Set((mlForLevel || []).map(ml => ml.module_id));
  const accessible = (allModules || []).filter(m => allowedIds.has(m.id));
  const caseStudy  = (cs || [])[0] || null;
  const comps      = competencies || [];

  if (!accessible.length) {
    return { participant: p, level: p.level, cohort: p.cohort, caseStudy, competencies: comps, modules: [] };
  }

  const mf   = inList(accessible.map(m => m.id));
  const tier = p.level.complexity_tier;

  const [scenarios, questions, rolePlays] = await Promise.all([
    q("cs_scenarios",  "GET", null, `?module_id=in.${mf}&select=*`),
    q("cs_questions",  "GET", null, `?module_id=in.${mf}&select=*&order=display_order.asc`),
    q("cs_role_plays", "GET", null, `?module_id=in.${mf}&select=*`),
  ]);

  const compMap = Object.fromEntries(comps.map(c => [c.id, c]));

  const enriched = accessible.map(mod => {
    const qs = (questions || [])
      .filter(x => x.module_id === mod.id)
      .map(x => ({ ...x, text: tier === "advanced" ? x.text_advanced : x.text_standard, competency: compMap[x.competency_id] }));
    const compIds = [...new Set(qs.map(x => x.competency_id))];
    return {
      ...mod,
      scenario:           (scenarios || []).find(s  => s.module_id  === mod.id) || null,
      questions:          qs,
      rolePlay:           (rolePlays || []).find(rp => rp.module_id === mod.id) || null,
      moduleCompetencies: compIds.map(id => compMap[id]).filter(Boolean),
    };
  });

  return { participant: p, level: p.level, cohort: p.cohort, caseStudy, competencies: comps, modules: enriched };
}

// ─── Assessment Data ──────────────────────────────────────────────────────────

export async function loadAllAssessmentData() {
  const [results, ratings, requests, promos] = await Promise.all([
    q("ac_results",         "GET", null, "?select=*"),
    q("ac_ratings",         "GET", null, "?select=*"),
    q("ac_report_requests", "GET", null, "?select=*"),
    q("ac_promotion_recs",  "GET", null, "?select=*"),
  ]);
  return {
    results:  results  || [],
    ratings:  ratings  || [],
    requests: requests || [],
    promos:   promos   || [],
  };
}

export async function moduleHasResults(moduleId) {
  const rows = await q("ac_results", "GET", null, `?module_id=eq.${moduleId}&select=id&limit=1`);
  return Array.isArray(rows) && rows.length > 0;
}

export async function loadParticipantAssessmentData(participantId) {
  const [results, ratings, requests] = await Promise.all([
    q("ac_results",         "GET", null, `?participant_id=eq.${participantId}&select=*`),
    q("ac_ratings",         "GET", null, `?participant_id=eq.${participantId}&select=*`),
    q("ac_report_requests", "GET", null, `?participant_id=eq.${participantId}&select=*`),
  ]);
  return { results: results || [], ratings: ratings || [], requests: requests || [] };
}

export async function saveResult(participantId, moduleId, answers, timeSpent, simMessages) {
  return q("ac_results", "POST", {
    participant_id: participantId,
    module_id:      moduleId,
    answers,
    time_spent:     timeSpent,
    completed_at:   now(),
    sim_messages:   simMessages || [],
    updated_at:     now(),
  });
}

export async function saveRatings(participantId, moduleId, ratings, aiRatings, reportData) {
  return q("ac_ratings", "POST", {
    participant_id: participantId,
    module_id:      moduleId,
    ratings,
    ai_ratings:     aiRatings  || {},
    report_data:    reportData || {},
    updated_at:     now(),
  });
}

export async function saveReportRequest(participantId, moduleId, status) {
  return q("ac_report_requests", "POST", {
    participant_id: participantId,
    module_id:      moduleId,
    status,
    requested_at:   now(),
    approved_at:    status === "approved" ? now() : null,
  });
}

export async function savePromotionRec(participantId, moduleId, recommendation) {
  return q("ac_promotion_recs", "POST", {
    participant_id: participantId,
    module_id:      moduleId,
    recommendation,
    updated_at:     now(),
  });
}
