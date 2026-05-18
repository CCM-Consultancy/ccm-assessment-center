import React, { useState, useEffect } from "react";
import { CCM_RED, S } from "./lib/constants";
import * as db from "./lib/db";
import * as ai from "./lib/ai";

// ─── Logo ──────────────────────────────────────────────────────────────────────
function CCMLogo() {
  return (
    <svg width="88" height="38" viewBox="0 0 88 38" fill="none">
      <text x="0" y="27" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="30" fill={CCM_RED} letterSpacing="-1">CCM</text>
      <text x="1" y="36" fontFamily="Arial,sans-serif" fontWeight="400" fontSize="8.5" fill="#111" letterSpacing="2.2">CONSULTANCY</text>
    </svg>
  );
}

// ─── Toast notification ────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:"#111", color:"#fff", padding:"12px 20px", borderRadius:10, zIndex:9999, fontSize:13, maxWidth:340, boxShadow:"0 4px 16px rgba(0,0,0,.25)" }}>
      {msg}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
 
  const [screen, setScreen]         = useState("login");
  const [loginForm, setLoginForm]   = useState({ username:"", password:"" });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading]       = useState(false);

  const [caseStudies, setCaseStudies] = useState([]);
  const [selectedId, setSelectedId]   = useState(null); // null | "new" | uuid

  const [csData, setCsData]       = useState(null);
  const [csLoading, setCsLoading] = useState(false);

  const [csForm, setCsForm]       = useState({ name:"", industry:"", description:"", is_active:false });
  const [levelForm, setLevelForm] = useState({ name:"", complexity_tier:"standard" });

  const [adminTab, setAdminTab] = useState("case-studies");

  // ─── Cohorts ──────────────────────────────────────────────────────────────────
  const [cohorts, setCohorts]       = useState([]);
  const [cohortForm, setCohortForm] = useState({ case_study_id:"", name:"", start_date:"", end_date:"", access_code:"" });
  const [cohortSaving, setCohortSaving] = useState(false);

  // ─── Participants ─────────────────────────────────────────────────────────────
  const emptyPForm = { id:"", name:"", username:"", password:"", role:"", cohort_id:"", level_id:"" };
  const [participants, setParticipants] = useState([]);
  const [allLevels,    setAllLevels]    = useState([]);
  const [pForm,        setPForm]        = useState(emptyPForm);
  const [pEditing,     setPEditing]     = useState(false);
  const [pSaving,      setPSaving]      = useState(false);
  const [resetPwd,     setResetPwd]     = useState({ id:null, value:"", saving:false });

  // ─── Module Builder ───────────────────────────────────────────────────────────
  const [mbCsId,         setMbCsId]         = useState("");
  const [mbModules,      setMbModules]      = useState([]);
  const [mbLevels,       setMbLevels]       = useState([]);
  const [mbModuleLevels, setMbModuleLevels] = useState([]);
  const [mbScenarios,    setMbScenarios]    = useState([]);
  const [mbSelModId,     setMbSelModId]     = useState(null);
  const [libComps,       setLibComps]       = useState([]);
const [libLoading,     setLibLoading]     = useState(false);
const [libFilter,      setLibFilter]      = useState("All");
const [libSearch,      setLibSearch]      = useState("");
const [addCompOpen,    setAddCompOpen]    = useState(false);
const [newCompForm,    setNewCompForm]    = useState({ name:"", category:"Leadership" });
const [newCompGen,     setNewCompGen]     = useState(false);
const [newCompSaving,  setNewCompSaving]  = useState(false);
const [editCompId,     setEditCompId]     = useState(null);
const [editCompForm,   setEditCompForm]   = useState({ name:"", category:"", definition:"", observed_in:"" });
const [editCompSaving, setEditCompSaving] = useState(false);
  const [mbModForm,      setMbModForm]      = useState({ name:"", module_type:"questions", task_brief:"" });
  const emptyScenForm = { case_study_text:"", appendix_text:"", image_1_url:"", image_1_caption:"", image_2_url:"", image_2_caption:"", image_3_url:"", image_3_caption:"", file_url:"", file_name:"", file_type:"" };
  const [mbScenForm,     setMbScenForm]     = useState({ ...emptyScenForm });
  const [mbLevelIds,     setMbLevelIds]     = useState([]);
  const emptyTimeForm = { reading_time_mins:5, sup_q_mins:45, sup_task_mins:30, mgr_q_mins:60, mgr_task_mins:45, dir_q_mins:75, dir_task_mins:60 };
  const [mbTimeForm,     setMbTimeForm]     = useState({ ...emptyTimeForm });
  const [mbTimeSaving,   setMbTimeSaving]   = useState(false);
  const [mbLoading,      setMbLoading]      = useState(false);
  const [mbSaving,       setMbSaving]       = useState(false);
  const [mbUploading,    setMbUploading]    = useState(null); // "image_1"|"image_2"|"image_3"|"document"|null
  const [mbScenEditing,  setMbScenEditing]  = useState(false);
  const [mbNewName,      setMbNewName]      = useState("");
  const [mbAdding,       setMbAdding]       = useState(false);

  // ─── Questions & Guide ────────────────────────────────────────────────────────
  const [qgCsId,      setQgCsId]      = useState("");
  const [qgData,      setQgData]      = useState(null);
  const [qgModuleId,  setQgModuleId]  = useState("");
  const [qgLoading,   setQgLoading]   = useState(false);
  const emptyQForm = { id:null, text_advanced:"", text_standard:"", competency_id:"", display_order:0 };
  const [qForm,       setQForm]       = useState({ ...emptyQForm });
  const [qFormOpen,   setQFormOpen]   = useState(false);
  const [qSaving,     setQSaving]     = useState(false);
  const [guideOpen,   setGuideOpen]   = useState(null); // question_id being edited
  const emptyGuide = { model_answer:"", best_answer:"", strong_indicators:"", weak_indicators:"" };
  const [guideForm,   setGuideForm]   = useState({ ...emptyGuide });
  // AI question suggestions
  const [aiPanelOpen,   setAiPanelOpen]   = useState(false); // controlled separately from load state
  const [aiSuggestions, setAiSuggestions] = useState([]); // [{advanced, standard}]
  const [aiError,       setAiError]       = useState(null);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiSelected,    setAiSelected]    = useState(new Set());
  const [aiAdding,      setAiAdding]      = useState(false);

  // ─── Case study competency assignments ───────────────────────────────────────
  const [csAssignedComps,   setCsAssignedComps]   = useState([]);
  const [csAssignedLoading, setCsAssignedLoading] = useState(false);
  const [csCompSaved,       setCsCompSaved]       = useState(false);
  // ─── Q&G per-competency guides ────────────────────────────────────────────────
  const [qgAssignedComps,   setQgAssignedComps]   = useState([]);
  const [qgCompGuides,      setQgCompGuides]      = useState({});
  const [guideGenLoading,   setGuideGenLoading]   = useState({});
  // ─── Assessor Guide tab ───────────────────────────────────────────────────────
  const [agCsId,            setAgCsId]            = useState("");
  const [agData,            setAgData]            = useState(null);
  const [agLoading,         setAgLoading]         = useState(false);

  // ─── Dashboard ────────────────────────────────────────────────────────────────
  const [dbCohortId, setDbCohortId] = useState("");
  const [dbModules,  setDbModules]  = useState([]);
  const [dbResults,  setDbResults]  = useState([]);
  const [dbLoading,  setDbLoading]  = useState(false);

  // ─── Reports ──────────────────────────────────────────────────────────────────
  const [rpResults,       setRpResults]       = useState([]);
  const [rpModules,       setRpModules]       = useState([]);
  const [rpLoading,       setRpLoading]       = useState(false);
  const [rpSelKey,        setRpSelKey]        = useState(null);
  const [rpQuestions,     setRpQuestions]     = useState([]);
  const [rpCompetencies,  setRpCompetencies]  = useState([]);
  const [rpScores,        setRpScores]        = useState({ part1:{}, part2:{} });
  const [rpSaving,        setRpSaving]        = useState(false);
  const [rpReport,        setRpReport]        = useState(null);
  const [rpReportLoading, setRpReportLoading] = useState(false);
  const [rpReportType,    setRpReportType]    = useState(null);
  const [rpEditMode,      setRpEditMode]      = useState(false);
  const [rpEditContent,   setRpEditContent]   = useState(null);
  const [rpOrigContent,   setRpOrigContent]   = useState(null);

  // ─── Self-registration ────────────────────────────────────────────────────────
  const [loginMode,  setLoginMode]  = useState("signin"); // "signin" | "register"
  const [regStep,    setRegStep]    = useState("code");   // "code" | "form"
  const [regCode,    setRegCode]    = useState("");
  const [regCohort,  setRegCohort]  = useState(null);
  const [regLevels,  setRegLevels]  = useState([]);
  const [regForm,    setRegForm]    = useState({ name:"", username:"", password:"", role:"", level_id:"" });
  const [regLoading, setRegLoading] = useState(false);
  const [regError,   setRegError]   = useState("");

  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  function notify(msg) { setToast(msg); setTimeout(() => setToast(""), 4000); }

  // ─── Login ────────────────────────────────────────────────────────────────────
  async function handleLogin() {
    setLoading(true); setLoginError("");
    try {
      if (loginForm.username === "admin" && loginForm.password === "ccm2024") {
        const [cs, co, parts, lvls] = await Promise.all([
          db.getCaseStudies(), db.getCohorts(), db.getParticipants(), db.getAllLevels(),
        ]);
        setCaseStudies(Array.isArray(cs)    ? cs    : []);
        setCohorts(Array.isArray(co)        ? co    : []);
        setParticipants(Array.isArray(parts)? parts : []);
        setAllLevels(Array.isArray(lvls)    ? lvls  : []);
        setScreen("admin");
      } else {
        setLoginError("Incorrect credentials.");
      }
    } catch { setLoginError("Connection error. Please try again."); }
    setLoading(false);
  }

  // ─── Select case study ────────────────────────────────────────────────────────
  async function selectCs(id) {
    if (id === "new") {
      setSelectedId("new");
      setCsForm({ name:"", industry:"", description:"", is_active:false });
      setCsData(null);
      setCsAssignedComps([]);
      return;
    }
    setSelectedId(id);
    setCsLoading(true);
    try {
      const [data, assigned] = await Promise.all([
        db.getFullCaseStudy(id),
        db.getAssignedCompetencies(id),
      ]);
      setCsData(data);
      setCsAssignedComps(assigned);
      setCsForm({
        name:        data.caseStudy?.name        || "",
        industry:    data.caseStudy?.industry    || "",
        description: data.caseStudy?.description || "",
        is_active:   data.caseStudy?.is_active   || false,
      });
    } catch { notify("Failed to load case study."); }
    setCsLoading(false);
  }

  async function reloadCsData() {
    if (!selectedId || selectedId === "new") return;
    const data = await db.getFullCaseStudy(selectedId);
    setCsData(data);
  }

  // ─── Save case study info ─────────────────────────────────────────────────────
  async function saveCsInfo() {
    if (!csForm.name.trim()) { notify("Name is required."); return; }
    setSaving(true);
    try {
      const payload = {
        name:        csForm.name.trim(),
        industry:    csForm.industry.trim(),
        description: csForm.description.trim(),
        is_active:   csForm.is_active,
      };
      if (selectedId !== "new") payload.id = selectedId;
      const saved = await db.saveCaseStudy(payload);
      const cs = await db.getCaseStudies();
      setCaseStudies(Array.isArray(cs) ? cs : []);
      if (selectedId === "new") {
        await selectCs(saved.id);
      } else {
        setCsData(prev => ({ ...prev, caseStudy: saved }));
      }
      notify("✓ Case study saved successfully.");
    } catch(e) { notify(`Save failed: ${e.message}`); }
    setSaving(false);
  }

  // ─── Delete case study ────────────────────────────────────────────────────────
  async function deleteCs(id) {
    if (!window.confirm("Delete this case study? This cannot be undone.")) return;
    try {
      await db.deleteCaseStudy(id);
      const cs2 = await db.getCaseStudies();
      setCaseStudies(Array.isArray(cs2) ? cs2 : []);
      setSelectedId(null); setCsData(null);
      notify("Case study deleted.");
    } catch { notify("Cannot delete — it may have cohorts attached."); }
  }

  // ─── Levels ───────────────────────────────────────────────────────────────────
  async function addLevel() {
    if (!levelForm.name.trim()) { notify("Level name required."); return; }
    if (!selectedId || selectedId === "new") { notify("Save the case study first."); return; }
    try {
      await db.saveLevel({
        case_study_id: selectedId,
        name:          levelForm.name.trim(),
        complexity_tier: levelForm.complexity_tier,
        display_order: (csData?.levels?.length || 0),
      });
      setLevelForm({ name:"", complexity_tier:"standard" });
      await reloadCsData();
      notify("Level added.");
    } catch { notify("Failed to add level."); }
  }

  async function removeLevel(id) {
    try {
      await db.deleteLevel(id);
      await reloadCsData();
      notify("Level removed.");
    } catch { notify("Cannot delete — participants may be using this level."); }
  }

  // ─── Competencies ─────────────────────────────────────────────────────────────
  async function updateKeywords(compId, keywords) {
    try {
      const comp = csData.competencies.find(c => c.id === compId);
      if (!comp) return;
      await db.saveCompetency({ id: compId, case_study_id: selectedId, name: comp.name, keywords, display_order: comp.display_order });
      setCsData(prev => ({ ...prev, competencies: prev.competencies.map(c => c.id === compId ? { ...c, keywords } : c) }));
    } catch { notify("Failed to update keywords."); }
  }

  // ─── Cohort handlers ─────────────────────────────────────────────────────────
  function genCode() {
    return Math.random().toString(36).substring(2,8).toUpperCase();
  }

  async function saveCohort() {
    if (!cohortForm.case_study_id) { notify("Select a case study."); return; }
    if (!cohortForm.name.trim())   { notify("Cohort name required."); return; }
    setCohortSaving(true);
    try {
      await db.saveCohort({
        case_study_id: cohortForm.case_study_id,
        name:          cohortForm.name.trim(),
        access_code:   genCode(),
        start_date:    cohortForm.start_date || null,
        end_date:      cohortForm.end_date   || null,
        is_active:     true,
      });
      const co = await db.getCohorts();
      setCohorts(Array.isArray(co) ? co : []);
      setCohortForm({ case_study_id:"", name:"", start_date:"", end_date:"" });
      notify("Cohort created.");
    } catch { notify("Failed to create cohort. Access code may already be in use."); }
    setCohortSaving(false);
  }

  async function toggleCohortActive(cohort) {
    try {
      await db.saveCohort({ id: cohort.id, case_study_id: cohort.case_study_id, name: cohort.name, access_code: cohort.access_code, start_date: cohort.start_date, end_date: cohort.end_date, is_active: !cohort.is_active });
      const co = await db.getCohorts();
      setCohorts(Array.isArray(co) ? co : []);
    } catch { notify("Failed to update cohort."); }
  }

  async function deleteCohort(id) {
    if (!window.confirm("Delete this cohort? This cannot be undone.")) return;
    try {
      // Check for linked participants first
      const participants = await db.getParticipants();
      const linked = Array.isArray(participants) ? participants.filter(p => p.cohort_id === id) : [];
      if (linked.length > 0) {
        notify(`Cannot delete — ${linked.length} participant${linked.length > 1 ? "s are" : " is"} assigned to this cohort. Remove them first.`);
        return;
      }
      await db.deleteCohort(id);
      const co = await db.getCohorts();
      setCohorts(Array.isArray(co) ? co : []);
      notify("Cohort deleted.");
    } catch { notify("Delete failed. Please try again."); }
  }

  // ─── Self-registration handlers ───────────────────────────────────────────────
  async function verifyAccessCode() {
    if (!regCode.trim()) { setRegError("Enter an access code."); return; }
    setRegLoading(true); setRegError("");
    try {
      const cohort = await db.getCohortByAccessCode(regCode.trim().toUpperCase());
      if (!cohort) { setRegError("Access code not found or cohort is inactive."); setRegLoading(false); return; }
      const lvls = await db.getAllLevels();
      const filtered = (Array.isArray(lvls) ? lvls : []).filter(l => l.case_study_id === cohort.case_study_id);
      setRegCohort(cohort);
      setRegLevels(filtered);
      setRegStep("form");
    } catch(e) { setRegError(`Error: ${e.message}`); }
    setRegLoading(false);
  }

  async function submitRegistration() {
    if (!regForm.name.trim())     { setRegError("Full name required."); return; }
    if (!regForm.username.trim()) { setRegError("Username required."); return; }
    if (!regForm.password.trim()) { setRegError("Password required."); return; }
    if (!regForm.level_id)        { setRegError("Select your level."); return; }
    setRegLoading(true); setRegError("");
    try {
      const id = regForm.username.trim().toLowerCase().replace(/\s+/g,"_") + "_" + Date.now();
      await db.saveParticipant({
        id,
        name:      regForm.name.trim(),
        username:  regForm.username.trim(),
        password:  regForm.password.trim(),
        role:      regForm.role.trim(),
        cohort_id: regCohort.id,
        level_id:  regForm.level_id,
      });
      // Auto sign-in after registration
      const p = await db.loginParticipant(regForm.username.trim(), regForm.password.trim());
      if (p) {
        const sess = await db.loadParticipantSession(p);
        setScreen("participant");
      } else {
        setRegError("Account created but sign-in failed. Please sign in manually.");
        setLoginMode("signin"); setRegStep("code"); setRegCode(""); setRegForm({ name:"", username:"", password:"", role:"", level_id:"" });
      }
    } catch(e) { setRegError(`Registration failed: ${e.message}`); }
    setRegLoading(false);
  }

  // ─── Participant handlers ─────────────────────────────────────────────────────
  async function reloadParticipants() {
    const [parts, lvls] = await Promise.all([db.getParticipants(), db.getAllLevels()]);
    setParticipants(Array.isArray(parts) ? parts : []);
    setAllLevels(Array.isArray(lvls) ? lvls : []);
  }

  // levels available for the selected cohort's case study
  function levelsForCohort(cohort_id) {
    const cohort = cohorts.find(c => c.id === cohort_id);
    if (!cohort) return [];
    return allLevels.filter(l => l.case_study_id === cohort.case_study_id);
  }

  async function saveParticipant() {
    if (!pForm.name.trim())     { notify("Name required."); return; }
    if (!pForm.username.trim()) { notify("Username required."); return; }
    if (!pForm.cohort_id)       { notify("Select a cohort."); return; }
    if (!pForm.level_id)        { notify("Select a level."); return; }
    if (!pEditing && !pForm.password.trim()) { notify("Password required."); return; }
    setPSaving(true);
    try {
      if (pEditing) {
        await db.updateParticipant(pForm.id, {
          name:     pForm.name.trim(),
          username: pForm.username.trim(),
          role:     pForm.role.trim(),
          level_id: pForm.level_id,
        });
      } else {
        const id = pForm.username.trim().toLowerCase().replace(/\s+/g,"_") + "_" + Date.now();
        await db.saveParticipant({ id, name: pForm.name.trim(), username: pForm.username.trim(), password: pForm.password.trim(), role: pForm.role.trim(), cohort_id: pForm.cohort_id, level_id: pForm.level_id });
      }
      await reloadParticipants();
      setPForm(emptyPForm); setPEditing(false);
      notify(pEditing ? "Participant updated." : "Participant created.");
    } catch(e) { notify(`Failed: ${e.message}`); }
    setPSaving(false);
  }

  function editParticipant(p) {
    setPForm({ id:p.id, name:p.name, username:p.username, password:"", role:p.role||"", cohort_id:p.cohort_id, level_id:p.level_id });
    setPEditing(true);
  }

  async function deleteParticipant(p) {
    if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    try {
      const d = await db.loadParticipantAssessmentData(p.id);
      if (d.results && d.results.length > 0) {
        notify(`Cannot delete — ${p.name} has ${d.results.length} submitted result${d.results.length > 1 ? "s" : ""}. Remove results first.`);
        return;
      }
      await db.deleteParticipant(p.id);
      await reloadParticipants();
      notify("Participant deleted.");
    } catch(e) { notify(`Delete failed: ${e.message}`); }
  }

  async function saveResetPassword() {
    if (!resetPwd.value.trim()) { notify("Enter a new password."); return; }
    setResetPwd(r => ({ ...r, saving:true }));
    try {
      const p = participants.find(x => x.id === resetPwd.id);
      if (!p) return;
      await db.saveParticipant({ id:p.id, name:p.name, username:p.username, password:resetPwd.value.trim(), role:p.role||"", cohort_id:p.cohort_id, level_id:p.level_id });
      setResetPwd({ id:null, value:"", saving:false });
      notify("Password reset successfully.");
    } catch(e) { notify(`Reset failed: ${e.message}`); setResetPwd(r => ({ ...r, saving:false })); }
  }

  // ─── Module Builder handlers ──────────────────────────────────────────────────
  async function loadModuleBuilder(csId) {
    if (!csId) {
      setMbModules([]); setMbLevels([]); setMbModuleLevels([]);
      setMbScenarios([]); setMbSelModId(null);
      return;
    }
    setMbLoading(true);
    try {
      const data = await db.getFullCaseStudy(csId);
      setMbModules(data.modules      || []);
      setMbLevels(data.levels        || []);
      setMbModuleLevels(data.moduleLevels || []);
      setMbScenarios(data.scenarios  || []);
      setMbSelModId(null);
      setMbModForm({ name:"", description:"", module_type:"questions" });
      setMbScenForm({ standard:"", advanced:"" });
      setMbLevelIds([]);
    } catch(e) { notify(`Failed to load: ${e.message}`); }
    setMbLoading(false);
  }

  function selectMbModule(moduleId) {
    setMbSelModId(moduleId);
    setMbScenEditing(false);
    const mod = mbModules.find(m => m.id === moduleId);
    setMbModForm({ name: mod?.title || "", module_type: mod?.module_type || "questions", task_brief: mod?.task_brief || "" });
    setMbTimeForm({
      reading_time_mins: mod?.reading_time_mins ?? 5,
      sup_q_mins:        mod?.sup_q_mins        ?? 45,
      sup_task_mins:     mod?.sup_task_mins      ?? 30,
      mgr_q_mins:        mod?.mgr_q_mins         ?? 60,
      mgr_task_mins:     mod?.mgr_task_mins      ?? 45,
      dir_q_mins:        mod?.dir_q_mins         ?? 75,
      dir_task_mins:     mod?.dir_task_mins      ?? 60,
    });
    const levelIds = mbModuleLevels.filter(ml => ml.module_id === moduleId).map(ml => ml.level_id);
    setMbLevelIds(levelIds);
    const scen = mbScenarios.find(s => s.module_id === moduleId);
    setMbScenForm({
      case_study_text:  scen?.case_study_text  || "",
      appendix_text:    scen?.appendix_text    || "",
      image_1_url:      scen?.image_1_url      || "",
      image_1_caption:  scen?.image_1_caption  || "",
      image_2_url:      scen?.image_2_url      || "",
      image_2_caption:  scen?.image_2_caption  || "",
      image_3_url:      scen?.image_3_url      || "",
      image_3_caption:  scen?.image_3_caption  || "",
      file_url:         scen?.file_url         || "",
      file_name:        scen?.file_name        || "",
      file_type:        scen?.file_type        || "",
    });
  }

  async function addMbModule() {
    if (!mbNewName.trim()) { notify("Module name required."); return; }
    setMbAdding(true);
    try {
      const mod = await db.saveModule({
        case_study_id: mbCsId,
        title:         mbNewName.trim(),
        display_order: mbModules.length,
        module_type:   "questions",
      });
      const newMods = [...mbModules, mod];
      setMbModules(newMods);
      setMbNewName("");
      // Select the new module
      setMbSelModId(mod.id);
      setMbModForm({ name: mod.title || "", module_type: "questions", task_brief: "" });
      setMbLevelIds([]);
      setMbScenForm({ ...emptyScenForm });
      notify("Module added.");
    } catch(e) { notify(`Failed to add module: ${e.message}`); }
    setMbAdding(false);
  }

  async function saveMbModule() {
    if (!mbSelModId) return;
    if (!mbModForm.name.trim()) { notify("Module name required."); return; }
    setMbSaving(true);
    try {
      const mod = mbModules.find(m => m.id === mbSelModId);
      // 1. Save module info
      const savedMod = await db.saveModule({
        id:            mbSelModId,
        case_study_id: mbCsId,
        title:         mbModForm.name.trim(),
        display_order: mod?.display_order ?? 0,
        module_type:   mbModForm.module_type || "questions",
        task_brief:    mbModForm.task_brief  || "",
      });
      // 2. Save level access
      await db.saveModuleLevels(mbSelModId, mbLevelIds);
      // 3. Save scenario — one row per module, no complexity_tier split
      const scenRow = mbScenarios.find(s => s.module_id === mbSelModId);
      const savedScen = await db.saveScenario({
        ...(scenRow || {}),
        module_id: mbSelModId,
        ...mbScenForm,
      });
      // 4. Update local state
      setMbModules(prev => prev.map(m => m.id === mbSelModId ? { ...m, ...savedMod } : m));
      setMbScenarios(prev => {
        const filtered = prev.filter(s => s.module_id !== mbSelModId);
        return savedScen ? [...filtered, savedScen] : filtered;
      });
      // 5. Reload module levels from DB to get accurate state
      const fresh = await db.getFullCaseStudy(mbCsId);
      setMbModuleLevels(fresh.moduleLevels || []);
      notify("Module saved.");
    } catch(e) { notify(`Save failed: ${e.message}`); }
    setMbSaving(false);
  }

  async function saveModuleTimeSettings() {
    if (!mbSelModId) return;
    setMbTimeSaving(true);
    try {
      const saved = await db.saveModuleTimeSettings(mbSelModId, mbTimeForm);
      if (saved) setMbModules(prev => prev.map(m => m.id === mbSelModId ? { ...m, ...saved } : m));
      notify("Time settings saved.");
    } catch(e) { notify(`Save failed: ${e.message}`); }
    setMbTimeSaving(false);
  }

  async function deleteMbModule(moduleId) {
    if (!window.confirm("Delete this module? Scenarios inside will also be deleted.")) return;
    try {
      await db.deleteModule(moduleId);
      setMbModules(prev => prev.filter(m => m.id !== moduleId));
      setMbScenarios(prev => prev.filter(s => s.module_id !== moduleId));
      setMbModuleLevels(prev => prev.filter(ml => ml.module_id !== moduleId));
      setMbSelModId(null);
      setMbModForm({ name:"", description:"" });
      setMbScenForm({ ...emptyScenForm });
      setMbLevelIds([]);
      notify("Module deleted.");
    } catch(e) { notify(`Delete failed: ${e.message}`); }
  }

  function pickFile(accept, onFile) {
    const input = document.createElement("input");
    input.type = "file"; input.accept = accept;
    input.onchange = e => { if (e.target.files[0]) onFile(e.target.files[0]); };
    input.click();
  }

  async function uploadMbImage(slot) {
    pickFile("image/png,image/jpeg", async (file) => {
      setMbUploading(`image_${slot}`);
      try {
        const ext  = file.name.split(".").pop().toLowerCase();
        const path = `modules/${mbSelModId}/image_${slot}.${ext}`;
        const url  = await db.uploadStorageFile("assessment-media", path, file);
        setMbScenForm(f => ({ ...f, [`image_${slot}_url`]: url }));
        notify(`Image ${slot} uploaded.`);
      } catch(e) { notify(`Upload failed: ${e.message}`); }
      setMbUploading(null);
    });
  }

  async function uploadMbDocument() {
    pickFile(".pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", async (file) => {
      setMbUploading("document");
      try {
        const ext  = file.name.split(".").pop().toLowerCase();
        const path = `modules/${mbSelModId}/document.${ext}`;
        const url  = await db.uploadStorageFile("assessment-media", path, file);
        setMbScenForm(f => ({ ...f, file_url: url, file_name: file.name, file_type: file.type }));
        notify("Document uploaded.");
      } catch(e) { notify(`Upload failed: ${e.message}`); }
      setMbUploading(null);
    });
  }

  // ─── Questions & Guide handlers ───────────────────────────────────────────────
  async function loadQgCs(csId) {
  setQgCsId(csId); setQgModuleId(""); setQFormOpen(false); setGuideOpen(null);
  setQForm({ ...emptyQForm }); closeAiPanel();
  if (!csId) { setQgData(null); setQgAssignedComps([]); setQgCompGuides({}); return; }
  setQgLoading(true);
  try {
    const [data, assigned] = await Promise.all([
      db.getFullCaseStudy(csId),
      db.getAssignedCompetencies(csId),
    ]);
    setQgData(data);
    setQgAssignedComps(assigned);
    const guides = {};
    await Promise.all(assigned.map(async a => {
      const guide = await db.getCompetencyGuide(csId, a.competency_id);
      if (guide) guides[a.competency_id] = guide;
    }));
    setQgCompGuides(guides);
  }
  catch(e) { notify(`Failed to load: ${e.message}`); }
  setQgLoading(false);
}

async function loadLibComps() {
  setLibLoading(true);
  try { setLibComps(await db.getLibraryCompetencies()); }
  catch(e) { notify(`Failed to load competencies: ${e.message}`); }
  setLibLoading(false);
}

useEffect(() => {
  if (screen === "admin") loadLibComps();
}, [screen]);

useEffect(() => {
  if (adminTab !== "reports") return;
  (async () => {
    setRpLoading(true);
    try {
      const [data, mods] = await Promise.all([db.loadAllAssessmentData(), db.getModules()]);
      setRpResults(data.results || []);
      setRpModules(mods || []);
    } catch(e) { notify("Failed to load results: " + e.message); }
    setRpLoading(false);
  })();
}, [adminTab]);

async function generateAndAddCompetency() {
  if (!newCompForm.name.trim()) { notify("Enter a competency name first."); return; }
  setNewCompGen(true);
  try {
    const { definition, observed_in } = await db.generateCompetencyDefinition(newCompForm.name.trim());
    setNewCompSaving(true);
    await db.saveLibraryCompetency({
      name:       newCompForm.name.trim(),
      category:   newCompForm.category,
      definition,
      observed_in,
      is_default: false,
    });
    await loadLibComps();
    setAddCompOpen(false);
    setNewCompForm({ name:"", category:"Leadership" });
    notify("✓ Competency added.");
  } catch(e) { notify(`Failed: ${e.message}`); }
  setNewCompGen(false);
  setNewCompSaving(false);
}

async function saveEditComp() {
  if (!editCompForm.name.trim() || !editCompForm.definition.trim()) { notify("Name and definition required."); return; }
  setEditCompSaving(true);
  try {
    await db.saveLibraryCompetency({ id: editCompId, ...editCompForm });
    await loadLibComps();
    setEditCompId(null);
    notify("✓ Competency updated.");
  } catch(e) { notify(`Failed: ${e.message}`); }
  setEditCompSaving(false);
}

async function deleteLibComp(id) {
  if (!window.confirm("Delete this competency from the library? This cannot be undone.")) return;
  try {
    await db.deleteLibraryCompetency(id);
    await loadLibComps();
    notify("Competency deleted.");
  } catch(e) { notify(`Delete failed: ${e.message}`); }
}
    

  async function reloadQgData() {
    if (!qgCsId) return;
    try {
      const data = await db.getFullCaseStudy(qgCsId);
      setQgData(data);
      if (qgAssignedComps.length) {
        const guides = {};
        await Promise.all(qgAssignedComps.map(async a => {
          const guide = await db.getCompetencyGuide(qgCsId, a.competency_id);
          if (guide) guides[a.competency_id] = guide;
        }));
        setQgCompGuides(guides);
      }
    }
    catch(e) { notify(`Reload failed: ${e.message}`); }
  }

  async function saveQgQuestion() {
    if (!qForm.text_advanced.trim()) { notify("Advanced question text required."); return; }
    if (!qForm.text_standard.trim()) { notify("Standard question text required."); return; }
    if (!qForm.competency_id)        { notify("Select a competency."); return; }
    setQSaving(true);
    try {
      const payload = {
        module_id:     qgModuleId,
        text_advanced: qForm.text_advanced.trim(),
        text_standard: qForm.text_standard.trim(),
        competency_id: qForm.competency_id,
        display_order: Number(qForm.display_order) || 0,
      };
      if (qForm.id) payload.id = qForm.id;
      await db.saveQuestion(payload);
      await reloadQgData();
      setQForm({ ...emptyQForm }); setQFormOpen(false);
      notify(qForm.id ? "Question updated." : "Question added.");
    } catch(e) { notify(`Save failed: ${e.message}`); }
    setQSaving(false);
  }

  async function deleteQgQuestion(question) {
    if (!window.confirm("Delete this question and its assessor guide? This cannot be undone.")) return;
    try {
      const blocked = await db.moduleHasResults(question.module_id);
      if (blocked) { notify("Cannot delete — participants have already submitted answers for this module. Remove results first."); return; }
      await db.deleteQuestion(question.id);
      await reloadQgData();
      if (guideOpen === question.id) setGuideOpen(null);
      notify("Question deleted.");
    } catch(e) { notify(`Delete failed: ${e.message}`); }
  }

  // Coerce legacy array or current string → plain string
  function toIndicatorText(v) {
    if (Array.isArray(v)) return v.join("\n");
    return typeof v === "string" ? v : "";
  }

  function openGuideEdit(questionId) {
    const guide = (qgData?.guide || []).find(g => g.question_id === questionId);
    setGuideForm({
      model_answer:      guide?.model_answer || "",
      best_answer:       guide?.best_answer  || "",
      strong_indicators: toIndicatorText(guide?.strong_indicators),
      weak_indicators:   toIndicatorText(guide?.weak_indicators),
    });
    setGuideOpen(questionId);
  }

  async function fetchAiSuggestions(compId) {
    // Reset content but leave panel open — caller is responsible for opening it
    setAiSuggestions([]); setAiSelected(new Set()); setAiError(null); setAiLoading(true);
    if (!compId) { setAiLoading(false); return; }
    const csName      = qgData?.caseStudy?.name || "the case study";
    const assignedA   = qgAssignedComps.find(a => a.competency_id === compId);
    const legacyComp  = (qgData?.competencies || []).find(c => c.id === compId);
    const compName    = assignedA?.competency?.name || legacyComp?.name || compId;
    try {
      const suggestions = await db.suggestQuestions(csName, compName);
      setAiSuggestions(Array.isArray(suggestions) ? suggestions.slice(0, 5) : []);
    } catch(e) {
      setAiError(e.message || "Could not load suggestions — try again.");
    }
    setAiLoading(false);
  }

  function openAiPanel(compId) {
    setAiPanelOpen(true); // open synchronously so the panel is guaranteed visible
    fetchAiSuggestions(compId);
  }

  function closeAiPanel() {
    setAiPanelOpen(false); setAiSuggestions([]); setAiSelected(new Set()); setAiError(null); setAiLoading(false);
  }

  async function addSelectedSuggestions() {
    const chosen = aiSuggestions.filter((_, i) => aiSelected.has(i));
    if (!chosen.length) { notify("Tick at least one suggestion."); return; }
    setAiAdding(true);
    try {
      const base = (qgData?.questions || []).filter(q => q.module_id === qgModuleId).length;
      for (let i = 0; i < chosen.length; i++) {
        await db.saveQuestion({
          module_id:     qgModuleId,
          text_advanced: chosen[i].advanced,
          text_standard: chosen[i].standard,
          competency_id: qForm.competency_id,
          display_order: base + i,
        });
      }
      await reloadQgData();
      closeAiPanel();
      setQFormOpen(false); setQForm({ ...emptyQForm });
      notify(`${chosen.length} question${chosen.length !== 1 ? "s" : ""} added.`);
    } catch(e) { notify(`Add failed: ${e.message}`); }
    setAiAdding(false);
  }

  async function saveQgGuide(questionId) {
    try {
      const existing = (qgData?.guide || []).find(g => g.question_id === questionId);
      await db.saveGuide({
        ...(existing ? { id: existing.id } : {}),
        question_id:       questionId,
        model_answer:      guideForm.model_answer,
        best_answer:       guideForm.best_answer,
        strong_indicators: guideForm.strong_indicators,
        weak_indicators:   guideForm.weak_indicators,
      });
      await reloadQgData();
      setGuideOpen(null);
      notify("Assessor guide saved.");
    } catch(e) { notify(`Save failed: ${e.message}`); }
  }

  // ─── Case study competency assignment ─────────────────────────────────────────
  async function toggleCsComp(compId, isAssigned) {
    if (!selectedId || selectedId === "new") return;
    setCsAssignedLoading(true);
    try {
      if (isAssigned) {
        await db.unassignCompetency(selectedId, compId);
      } else {
        await db.assignCompetency(selectedId, compId, csAssignedComps.length);
      }
      const updated = await db.getAssignedCompetencies(selectedId);
      setCsAssignedComps(updated);
      // Keep Q&G tab in sync when it has the same case study loaded
      if (qgCsId === selectedId) {
        setQgAssignedComps(updated);
        const guides = {};
        await Promise.all(updated.map(async a => {
          const guide = await db.getCompetencyGuide(selectedId, a.competency_id);
          if (guide) guides[a.competency_id] = guide;
        }));
        setQgCompGuides(guides);
      }
    } catch(e) { notify(`Failed: ${e.message}`); }
    setCsAssignedLoading(false);
  }

  // ─── Per-competency guide generation ─────────────────────────────────────────
  async function generateCompGuide(compId, compName) {
    const csName = qgData?.caseStudy?.name || "the case study";
    const questions = (qgData?.questions || [])
      .filter(q => q.module_id === qgModuleId && q.competency_id === compId)
      .map(q => ({ advanced: q.text_advanced, standard: q.text_standard }));
    setGuideGenLoading(prev => ({ ...prev, [compId]: true }));
    try {
      const result = await db.generateAssessorGuide(csName, compName, questions);
      await db.saveCompetencyGuide({
        case_study_id:     qgCsId,
        competency_id:     compId,
        definition:        result.definition,
        score_descriptors: result.score_descriptors,
        strong_indicators: result.strong_indicators,
        weak_indicators:   result.weak_indicators,
      });
      const updated = { ...qgCompGuides };
      updated[compId] = await db.getCompetencyGuide(qgCsId, compId);
      setQgCompGuides(updated);
      notify("✓ Guide generated and saved.");
    } catch(e) { notify(`Generate failed: ${e.message}`); }
    setGuideGenLoading(prev => ({ ...prev, [compId]: false }));
  }

  // ─── Assessor Guide tab data loader ──────────────────────────────────────────
  async function loadAgData(csId) {
    if (!csId) { setAgData(null); return; }
    setAgLoading(true);
    try {
      const [fullData, assigned] = await Promise.all([
        db.getFullCaseStudy(csId),
        db.getAssignedCompetencies(csId),
      ]);
      const guides = {};
      await Promise.all(assigned.map(async a => {
        const guide = await db.getCompetencyGuide(csId, a.competency_id);
        if (guide) guides[a.competency_id] = guide;
      }));
      setAgData({ ...fullData, assignedComps: assigned, guides });
    } catch(e) { notify(`Failed to load assessor guide: ${e.message}`); }
    setAgLoading(false);
  }

  // ─── PDF new-window renderer ─────────────────────────────────────────────────
  function openPdfWindow(data) {
    const { caseStudy, assignedComps, guides, questions } = data;
    function esc(str) {
      return (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }
    const scoreColors = [
      { bg:"#f5f5f5", color:"#555",    border:"#ddd"    },
      { bg:"#fef2f2", color:"#dc2626", border:"#fca5a5" },
      { bg:"#fff7ed", color:"#ea580c", border:"#fdba74" },
      { bg:"#fefce8", color:"#ca8a04", border:"#fde047" },
      { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
      { bg:"#eff6ff", color:"#0369a1", border:"#bfdbfe" },
    ];

    const compsHtml = assignedComps.map((assignment, idx) => {
      const compId = assignment.competency_id;
      const comp   = assignment.competency;
      const guide  = guides[compId];
      const compQs = (questions || []).filter(q => q.competency_id === compId);

      let guideHtml = "";
      if (guide) {
        if (guide.definition) {
          guideHtml += `<div class="def-box"><div class="def-label">Competency Definition</div><p>${esc(guide.definition)}</p></div>`;
        }
        if (Array.isArray(guide.score_descriptors) && guide.score_descriptors.length) {
          const rows = guide.score_descriptors.map(sd => {
            const c = scoreColors[sd.score] || scoreColors[0];
            return `<div class="sd-row" style="background:${c.bg};border:1px solid ${c.border}">
              <div class="sd-score" style="color:${c.color}">${sd.score}<span>${esc(sd.label)}</span></div>
              <div class="sd-desc">${esc(sd.description)}</div>
            </div>`;
          }).join("");
          guideHtml += `<div class="sec-title">Score Descriptors (0–5)</div><div class="sd-list">${rows}</div>`;
        }
        const toArr = v => Array.isArray(v) ? v : (typeof v === "string" ? v.split("\n").filter(Boolean) : []);
        const si = toArr(guide.strong_indicators);
        const wi = toArr(guide.weak_indicators);
        if (si.length || wi.length) {
          guideHtml += `<div class="indicators">
            <div class="ind-col">
              <div class="ind-title strong-t">Strong Behavioral Indicators</div>
              <ul class="ind-list strong-l">${si.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>
            </div>
            <div class="ind-col">
              <div class="ind-title weak-t">Weak Behavioral Indicators</div>
              <ul class="ind-list weak-l">${wi.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>
            </div>
          </div>`;
        }
      } else {
        guideHtml = `<p class="no-guide">No assessor guide generated for this competency yet.</p>`;
      }

      let questionsHtml = "";
      if (compQs.length) {
        const qItems = compQs.map((q, qi) => `
          <div class="q-item">
            <div class="q-num">Q${qi + 1}</div>
            <div class="q-texts">
              ${q.text_advanced ? `<div class="q-line"><span class="tier adv">advanced</span><span>${esc(q.text_advanced)}</span></div>` : ""}
              ${q.text_standard ? `<div class="q-line"><span class="tier std">standard</span><span>${esc(q.text_standard)}</span></div>` : ""}
            </div>
          </div>`).join("");
        questionsHtml = `<div class="sec-title q-title">Questions (${compQs.length})</div><div class="q-list">${qItems}</div>`;
      }

      return `<div class="comp-section">
        <div class="comp-header">
          <div class="comp-num">${idx + 1}</div>
          <div>
            <h2>${esc(comp?.name || compId)}</h2>
            ${comp?.category ? `<span class="cat-badge">${esc(comp.category)}</span>` : ""}
          </div>
        </div>
        ${guideHtml}
        ${questionsHtml}
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Assessor Guide — ${esc(caseStudy?.name || "")}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;background:#fff;color:#111;font-size:13px;line-height:1.5;padding:28px 32px}
.page-header{display:flex;align-items:flex-start;gap:18px;margin-bottom:28px;padding-bottom:18px;border-bottom:3px solid #E8251A}
.logo-ccm{font-size:30px;font-weight:900;color:#E8251A;letter-spacing:-1px;line-height:1}
.logo-sub{font-size:8px;letter-spacing:2.5px;color:#111;text-transform:uppercase;margin-top:2px}
.cs-meta h1{font-size:20px;font-weight:700;margin-bottom:4px}
.cs-meta p{font-size:12px;color:#666}
.cs-meta .badge{font-size:11px;color:#888;margin-top:6px}
.comp-section{margin-bottom:28px;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden}
.comp-header{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fafafa;border-bottom:1px solid #e5e5e5}
.comp-num{width:32px;height:32px;border-radius:50%;background:#E8251A;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex-shrink:0}
.comp-header h2{font-size:16px;font-weight:700;margin-bottom:3px}
.cat-badge{font-size:11px;color:#7e22ce;background:#faf5ff;border:1px solid #e9d5ff;padding:2px 8px;border-radius:20px}
.def-box{margin:14px 16px;padding:12px 14px;background:#f8f7ff;border:1px solid #e9d5ff;border-radius:6px}
.def-label{font-size:10px;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
.def-box p{font-size:13px;line-height:1.65}
.sec-title{font-size:12px;font-weight:700;color:#333;padding:12px 16px 6px}
.q-title{border-top:1px solid #f0f0f0;margin-top:4px}
.sd-list{padding:0 16px 14px;display:flex;flex-direction:column;gap:5px}
.sd-row{display:flex;gap:12px;padding:9px 12px;border-radius:6px}
.sd-score{flex-shrink:0;width:52px;text-align:center;font-size:19px;font-weight:900;line-height:1}
.sd-score span{font-size:10px;font-weight:600;display:block;margin-top:2px}
.sd-desc{flex:1;font-size:12px;line-height:1.55;padding-top:3px}
.indicators{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px 14px}
.ind-title{font-size:12px;font-weight:700;margin-bottom:6px}
.strong-t{color:#16a34a}.weak-t{color:#dc2626}
.ind-list{list-style:none;display:flex;flex-direction:column;gap:4px}
.ind-list li{font-size:12px;padding:5px 10px;border-radius:5px}
.ind-list li::before{content:"● ";font-size:10px}
.strong-l li{background:#f0fdf4;border:1px solid #bbf7d0}
.weak-l li{background:#fef2f2;border:1px solid #fca5a5}
.q-list{padding:0 16px 14px;display:flex;flex-direction:column;gap:7px}
.q-item{display:flex;gap:10px;padding:9px 12px;background:#f9f9f9;border:1px solid #eee;border-radius:6px}
.q-num{font-size:11px;font-weight:700;color:#888;flex-shrink:0;padding-top:2px;min-width:22px}
.q-texts{flex:1;display:flex;flex-direction:column;gap:5px}
.q-line{display:flex;gap:8px;align-items:flex-start}
.tier{font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;flex-shrink:0;margin-top:1px}
.adv{background:#eff6ff;color:#0369a1;border:1px solid #bfdbfe}
.std{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
.no-guide{padding:12px 16px;margin:14px 16px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;font-size:13px}
@media print{body{padding:0}@page{margin:14mm;size:A4 portrait}}
</style>
</head>
<body>
<div class="page-header">
  <div><div class="logo-ccm">CCM</div><div class="logo-sub">Consultancy</div></div>
  <div class="cs-meta">
    <h1>${esc(caseStudy?.name || "")}</h1>
    <p>${[caseStudy?.industry, caseStudy?.description].filter(Boolean).map(esc).join(" — ")}</p>
    <div class="badge">Assessor Guide &nbsp;·&nbsp; ${assignedComps.length} competenc${assignedComps.length !== 1 ? "ies" : "y"}</div>
  </div>
</div>
${compsHtml}
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 400);
    } else { notify("Pop-up blocked — please allow pop-ups for this site, then try again."); }
  }

  // ─── Dashboard handlers ──────────────────────────────────────────────────────
  async function loadDashboard(cohortId) {
    setDbModules([]); setDbResults([]);
    if (!cohortId) return;
    setDbLoading(true);
    try {
      const cohort = cohorts.find(c => c.id === cohortId);
      if (!cohort) return;
      const cohortParts = participants.filter(p => p.cohort_id === cohortId);
      const [modules, results] = await Promise.all([
        db.getModulesForCaseStudy(cohort.case_study_id),
        cohortParts.length ? db.getResultsForParticipants(cohortParts.map(p => p.id)) : Promise.resolve([]),
      ]);
      setDbModules(modules);
      setDbResults(results);
    } catch(e) { notify(`Failed to load dashboard: ${e.message}`); }
    setDbLoading(false);
  }

  function downloadDashboardCsv() {
    const cohort = cohorts.find(c => c.id === dbCohortId);
    const cs     = caseStudies.find(c => c.id === cohort?.case_study_id);
    const parts  = participants.filter(p => p.cohort_id === dbCohortId);
    const header = [
      "Name","Username","Job Title","Level","Cohort","Case Study",
      ...dbModules.map(m => `${m.title} — Status`),
      ...dbModules.map(m => `${m.title} — Time (min)`),
      "Total Time (min)","Tab Switches",
    ];
    const rMap = {};
    dbResults.forEach(r => {
      if (!rMap[r.participant_id]) rMap[r.participant_id] = {};
      rMap[r.participant_id][r.module_id] = r;
    });
    const rows = parts.map(p => {
      const level   = allLevels.find(l => l.id === p.level_id);
      const pMods   = rMap[p.id] || {};
      const statuses = dbModules.map(m => pMods[m.id] ? "Completed" : "Not Started");
      const times    = dbModules.map(m => pMods[m.id] ? Math.round((pMods[m.id].time_spent || 0) / 60) : "");
      const total    = Math.round(Object.values(pMods).reduce((s, r) => s + (r.time_spent || 0), 0) / 60);
      const ts       = Object.values(pMods).reduce((s, r) => {
        const a = r.answers; return s + (Array.isArray(a) ? 0 : (a?.tab_switches || 0));
      }, 0);
      return [p.name, p.username, p.role||"", level?.name||"", cohort?.name||"", cs?.name||"", ...statuses, ...times, total||"", ts||""];
    });
    const csv = [header, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a   = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type:"text/csv" })), download: `dashboard-${cohort?.name||"cohort"}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  }

  function emailAccessCode(co) {
    const cs       = caseStudies.find(c => c.id === co.case_study_id);
    const appUrl   = window.location.origin;
    const dates    = co.start_date && co.end_date ? `${co.start_date} to ${co.end_date}` : co.start_date || co.end_date || "TBC";
    const subject  = encodeURIComponent(`CCM Assessment Centre — ${co.name}`);
    const body     = encodeURIComponent(
      `Dear Participant,\n\nYou are invited to complete the CCM Assessment Centre for ${cs?.name || "the assessment"}.\n\n` +
      `Cohort: ${co.name}\nDates: ${dates}\n\n` +
      `To register:\n1. Visit: ${appUrl}\n2. Click "Register"\n3. Enter your access code: ${co.access_code}\n\n` +
      `Please keep this code confidential.\n\nKind regards`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  // ─── Login screen ─────────────────────────────────────────────────────────────
  if (screen === "login") {
    const errBox = (msg) => msg ? (
      <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", color:"#dc2626", padding:"10px 12px", borderRadius:8, fontSize:13, marginBottom:12 }}>{msg}</div>
    ) : null;

    return (
      <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ ...S.card, width:380, padding:"2rem" }}>
          <div style={{ textAlign:"center", marginBottom:"1.25rem" }}><CCMLogo /></div>

          {/* Sign In (default — admin and returning participants) */}
          {loginMode === "signin" && <>
            {errBox(loginError)}
            <div style={{ marginBottom:12 }}>
              <label style={S.label}>Username</label>
              <input style={S.input} value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username:e.target.value }))} onKeyDown={e => e.key==="Enter" && handleLogin()} autoFocus />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Password</label>
              <input style={S.input} type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password:e.target.value }))} onKeyDown={e => e.key==="Enter" && handleLogin()} />
            </div>
            <button onClick={handleLogin} disabled={loading} style={S.btn(CCM_RED,"#fff",{ width:"100%", opacity:loading?0.6:1 })}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </>}

          {/* Register — Step 1: access code */}
          {loginMode === "register" && regStep === "code" && <>
            {errBox(regError)}
            <p style={{ fontSize:13, color:"#666", marginBottom:16 }}>Enter the access code provided by your assessor to register.</p>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Access Code</label>
              <input style={{ ...S.input, textTransform:"uppercase", letterSpacing:3, fontFamily:"monospace", fontSize:16 }}
                value={regCode} onChange={e => setRegCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key==="Enter" && verifyAccessCode()} placeholder="e.g. X4KR2M" autoFocus />
            </div>
            <button onClick={verifyAccessCode} disabled={regLoading} style={S.btn(CCM_RED,"#fff",{ width:"100%", opacity:regLoading?0.6:1 })}>
              {regLoading ? "Checking…" : "Continue →"}
            </button>
          </>}

          {/* Register — Step 2: registration form */}
          {loginMode === "register" && regStep === "form" && <>
            {errBox(regError)}
            <div style={{ marginBottom:10, padding:"8px 12px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, fontSize:12, color:"#15803d" }}>
              Registering for: <strong>{regCohort?.name}</strong>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
              <div><label style={S.label}>Full Name *</label>
                <input style={S.input} value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name:e.target.value }))} placeholder="Your full name" /></div>
              <div><label style={S.label}>Job Title</label>
                <input style={S.input} value={regForm.role} onChange={e => setRegForm(f => ({ ...f, role:e.target.value }))} placeholder="e.g. Operations Manager" /></div>
              <div><label style={S.label}>Username *</label>
                <input style={S.input} value={regForm.username} onChange={e => setRegForm(f => ({ ...f, username:e.target.value }))} placeholder="Choose a username" autoCapitalize="none" /></div>
              <div><label style={S.label}>Password *</label>
                <input style={S.input} type="password" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password:e.target.value }))} placeholder="Choose a password" /></div>
              <div>
                <label style={S.label}>Level *</label>
                <select style={S.input} value={regForm.level_id} onChange={e => setRegForm(f => ({ ...f, level_id:e.target.value }))}>
                  <option value="">Select your level…</option>
                  {regLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <p style={{ fontSize:11, color:"#888", margin:"5px 0 0" }}>Your level will be communicated to you by your assessor.</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setRegStep("code")} style={S.btn("#fff","#666",{ border:"1px solid #ddd" })}>← Back</button>
              <button onClick={submitRegistration} disabled={regLoading} style={S.btn(CCM_RED,"#fff",{ flex:1, opacity:regLoading?0.6:1 })}>
                {regLoading ? "Creating account…" : "Create Account"}
              </button>
            </div>
          </>}
        </div>
        <Toast msg={toast} />
      </div>
    );
  }

  async function selectRpResult(result) {
    setRpSelKey(result.participant_id + "|" + result.module_id);
    try {
      const { questions, competencies } = await db.getQuestionsForModule(result.module_id);
      setRpQuestions(questions);
      setRpCompetencies(competencies);
      const ex = result.scores || {};
      setRpScores({ part1: ex.part1 || {}, part2: ex.part2 || {} });
    } catch(e) { notify("Failed to load questions: " + e.message); }
  }

  async function saveRpScores() {
    if (!rpSelKey) return;
    const [pid, mid] = rpSelKey.split("|");
    setRpSaving(true);
    try {
      await db.saveScores(pid, mid, rpScores);
      setRpResults(prev => prev.map(r =>
        r.participant_id === pid && r.module_id === mid ? { ...r, scores: rpScores } : r
      ));
      notify("✓ Scores saved.");
    } catch(e) { notify("Save failed: " + e.message); }
    setRpSaving(false);
  }

  // ─── Admin shell ──────────────────────────────────────────────────────────────
  const levels       = csData?.levels       || [];
  const competencies = csData?.competencies || [];
  const isNew        = selectedId === "new";

  const TABS = [
    { id:"case-studies",    label:"Case Studies" },
    { id:"competencies", label:"Competencies" },
    { id:"module-builder",  label:"Module Builder" },
    { id:"questions-guide", label:"Questions & Guide" },
    { id:"cohorts",         label:"Cohorts" },
    { id:"participants",    label:"Participants" },
    { id:"dashboard",       label:"Dashboard" },
    { id:"assessor-guide",  label:"Assessor Guide" },
    { id:"live-panel",      label:"Live Panel" },
    { id:"reports",         label:"Reports" },
    { id:"settings",        label:"Settings" },
  ];

  function Placeholder({ title, description }) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", flexDirection:"column", gap:12, color:"#aaa" }}>
        <div style={{ fontSize:40 }}>🚧</div>
        <div style={{ fontSize:17, fontWeight:600, color:"#555" }}>{title}</div>
        <div style={{ fontSize:13, color:"#888", maxWidth:340, textAlign:"center" }}>{description}</div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* ── Top header ────────────────────────────────────────────────────────── */}
      <div style={S.header}>
        <CCMLogo />
        <span style={{ fontWeight:700, fontSize:15, color:"#111" }}>Assessment Centre Admin</span>
        <button onClick={() => setScreen("login")} style={S.btn("#fff","#666",{ fontSize:12 })}>Sign out</button>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────────── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e5e5", display:"flex", overflowX:"auto", flexShrink:0, paddingLeft:8 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setAdminTab(t.id)}
            style={{
              padding:"0 18px", height:42, border:"none", background:"transparent", cursor:"pointer",
              fontSize:13, fontWeight: adminTab===t.id ? 600 : 400,
              color: adminTab===t.id ? CCM_RED : "#555",
              borderBottom: adminTab===t.id ? `2px solid ${CCM_RED}` : "2px solid transparent",
              whiteSpace:"nowrap", flexShrink:0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────────── */}
      <div style={{ display: (adminTab==="case-studies"||adminTab==="module-builder"||adminTab==="questions-guide"||adminTab==="reports") ? "flex" : "block", height:"calc(100vh - 98px)", overflow: (adminTab==="case-studies"||adminTab==="module-builder"||adminTab==="questions-guide"||adminTab==="reports") ? "hidden" : "auto" }}>

        {/* ── Placeholders for tabs not yet built ─────────────────────────────── */}
        {adminTab==="module-builder" && (
          <>
            {/* ── Left panel: selector + module list ────────────────────────── */}
            <div style={{ width:280, borderRight:"1px solid #e5e5e5", background:"#fafafa", display:"flex", flexDirection:"column", overflowY:"auto", flexShrink:0 }}>
              <div style={{ padding:"1rem", borderBottom:"1px solid #e5e5e5" }}>
                <label style={S.label}>Case Study</label>
                <select style={S.input} value={mbCsId} onChange={e => { setMbCsId(e.target.value); loadModuleBuilder(e.target.value); }}>
                  <option value="">Select case study…</option>
                  {caseStudies.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                </select>
              </div>

              {mbCsId && (
                <>
                  <div style={{ padding:"10px 16px", borderBottom:"1px solid #f0f0f0" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <input
                        style={{ ...S.input, flex:1, fontSize:12 }}
                        value={mbNewName}
                        onChange={e => setMbNewName(e.target.value)}
                        onKeyDown={e => e.key==="Enter" && addMbModule()}
                        placeholder="New module name…"
                      />
                      <button onClick={addMbModule} disabled={mbAdding} style={S.btn(CCM_RED,"#fff",{ fontSize:14, padding:"6px 12px", opacity:mbAdding?0.6:1 })}>+</button>
                    </div>
                  </div>

                  {mbLoading && <p style={{ padding:"1rem", fontSize:13, color:"#888" }}>Loading…</p>}
                  {!mbLoading && mbModules.length === 0 && (
                    <p style={{ padding:"1rem", fontSize:13, color:"#aaa" }}>No modules yet. Add one above.</p>
                  )}
                  {mbModules.map(mod => {
                    const levelCount = mbModuleLevels.filter(ml => ml.module_id === mod.id).length;
                    const hasScen    = mbScenarios.some(s => s.module_id === mod.id && s.case_study_text);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => selectMbModule(mod.id)}
                        style={{
                          borderBottom:"1px solid #f0f0f0",
                          background:   mbSelModId===mod.id ? "#fff7f7" : "transparent",
                          borderLeft:   mbSelModId===mod.id ? `3px solid ${CCM_RED}` : "3px solid transparent",
                          cursor:"pointer", padding:"12px 16px",
                        }}
                      >
                        <div style={{ fontWeight:600, fontSize:13 }}>{mod.title}</div>
                        <div style={{ fontSize:11, color:"#aaa", marginTop:3 }}>
                          {levelCount} level{levelCount!==1?"s":""} · {hasScen ? "✓ case study" : "no case study"}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {!mbCsId && (
                <p style={{ padding:"1rem", fontSize:13, color:"#aaa" }}>Select a case study to get started.</p>
              )}
            </div>

            {/* ── Right panel: module editor ─────────────────────────────────── */}
            <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
              {!mbCsId && (
                <div style={{ textAlign:"center", marginTop:"5rem", color:"#bbb", fontSize:14 }}>
                  Select a case study from the left panel.
                </div>
              )}
              {mbCsId && !mbSelModId && (
                <div style={{ textAlign:"center", marginTop:"5rem", color:"#bbb", fontSize:14 }}>
                  Select a module or add a new one.
                </div>
              )}

              {mbSelModId && (
                <div style={{ maxWidth:760 }}>

                  {/* Module info */}
                  <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                      <h2 style={{ margin:0, fontSize:17 }}>Module Details</h2>
                      <button onClick={() => deleteMbModule(mbSelModId)} style={S.btn("#fff","#dc2626",{ fontSize:12, border:"1px solid #fca5a5" })}>Delete Module</button>
                    </div>
                    <div>
                      <label style={S.label}>Module Name *</label>
                      <input style={S.input} value={mbModForm.name} onChange={e => setMbModForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. In-Tray Exercise" />
                    </div>
                    <div style={{ marginTop:14 }}>
                      <label style={S.label}>Module Type</label>
                      <select style={S.input} value={mbModForm.module_type || "questions"} onChange={e => setMbModForm(f => ({ ...f, module_type:e.target.value }))}>
                        <option value="questions">Interview Questions only</option>
                        <option value="presentation">Presentation Task only</option>
                        <option value="both">Both — Questions then Presentation Task</option>
                      </select>
                    </div>
                  </div>

                  {/* Level access */}
                  <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:15 }}>Level Access</h3>
                    <p style={{ fontSize:12, color:"#888", marginTop:0, marginBottom:14 }}>
                      Tick the levels that should see this module during their assessment.
                    </p>
                    {mbLevels.length === 0 && (
                      <p style={{ fontSize:13, color:"#aaa" }}>No levels defined for this case study. Add levels in the Case Studies tab first.</p>
                    )}
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {mbLevels.map(lv => (
                        <label key={lv.id} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, cursor:"pointer" }}>
                          <input
                            type="checkbox"
                            checked={mbLevelIds.includes(lv.id)}
                            onChange={e => setMbLevelIds(ids => e.target.checked ? [...ids, lv.id] : ids.filter(id => id !== lv.id))}
                          />
                          <span style={{ fontWeight:500 }}>{lv.name}</span>
                          <span style={{
                            fontSize:11, padding:"2px 8px", borderRadius:20,
                            background: lv.complexity_tier==="advanced" ? "#eff6ff" : "#f0fdf4",
                            color:      lv.complexity_tier==="advanced" ? "#0369a1" : "#16a34a",
                            border:`1px solid ${lv.complexity_tier==="advanced"?"#bfdbfe":"#bbf7d0"}`,
                          }}>
                            {lv.complexity_tier}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Case Study text */}
                  <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
                      <div>
                        <h3 style={{ margin:"0 0 4px", fontSize:15 }}>Case Study</h3>
                        <p style={{ fontSize:12, color:"#888", margin:0 }}>
                          Shown to <strong>all</strong> participants regardless of level. Complexity is controlled by questions, not this text.
                        </p>
                      </div>
                      <button
                        onClick={() => setMbScenEditing(e => !e)}
                        style={mbScenEditing
                          ? S.btn("#111","#fff",{ fontSize:12, padding:"5px 14px" })
                          : S.btn("#fff","#333",{ fontSize:12, border:"1px solid #ddd", padding:"5px 14px" })}
                      >
                        {mbScenEditing ? "✓ Done editing" : "✏ Edit"}
                      </button>
                    </div>

                    {mbScenEditing ? (
                      <textarea
                        autoFocus
                        style={{ ...S.textarea, height:320, marginTop:12 }}
                        value={mbScenForm.case_study_text}
                        onChange={e => setMbScenForm(f => ({ ...f, case_study_text:e.target.value }))}
                        placeholder="Paste or type the full case study here…"
                      />
                    ) : (
                      <div
                        onClick={() => setMbScenEditing(true)}
                        style={{
                          marginTop:12, minHeight:80, padding:"12px 14px",
                          background:"#f8f8f8", border:"1px dashed #ddd", borderRadius:8,
                          fontSize:13, lineHeight:1.65, whiteSpace:"pre-wrap", color: mbScenForm.case_study_text ? "#111" : "#bbb",
                          cursor:"text",
                        }}
                        title="Click to edit"
                      >
                        {mbScenForm.case_study_text || "No case study written yet — click ✏ Edit to add one."}
                      </div>
                    )}

                    <div style={{ marginTop:18 }}>
                      <label style={S.label}>Appendix (optional)</label>
                      <p style={{ fontSize:12, color:"#888", marginTop:0, marginBottom:8 }}>Supplementary reference material — e.g. Appendix A tables, data sheets.</p>
                      {mbScenEditing ? (
                        <textarea
                          style={{ ...S.textarea, height:140 }}
                          value={mbScenForm.appendix_text}
                          onChange={e => setMbScenForm(f => ({ ...f, appendix_text:e.target.value }))}
                          placeholder="Appendix A: …"
                        />
                      ) : (
                        <div
                          onClick={() => setMbScenEditing(true)}
                          style={{
                            minHeight:44, padding:"10px 14px",
                            background:"#f8f8f8", border:"1px dashed #ddd", borderRadius:8,
                            fontSize:13, lineHeight:1.65, whiteSpace:"pre-wrap", color: mbScenForm.appendix_text ? "#111" : "#bbb",
                            cursor:"text",
                          }}
                          title="Click to edit"
                        >
                          {mbScenForm.appendix_text || "No appendix — click ✏ Edit to add one."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Case Study Tasks (Part 2 brief) */}
                  <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:15 }}>Case Study Tasks</h3>
                    <p style={{ fontSize:12, color:"#888", marginTop:0, marginBottom:12 }}>
                      The numbered tasks participants must complete in Part 2. Displayed verbatim in the participant's task panel.
                    </p>
                    <textarea
                      style={{ ...S.textarea, height:180 }}
                      value={mbModForm.task_brief}
                      onChange={e => setMbModForm(f => ({ ...f, task_brief: e.target.value }))}
                      placeholder={"1) Develop a SWOT analysis based on the case study.\n2) Prepare a 3-year recovery plan.\n3) How would you allocate the budget?\n4) What observations do you have about the financial results?"}
                    />
                  </div>

                  {/* Images */}
                  <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:15 }}>Images (optional, up to 3)</h3>
                    <p style={{ fontSize:12, color:"#888", marginTop:0, marginBottom:14 }}>PNG or JPG. Displayed inline below the case study text in the participant view.</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      {[1,2,3].map(n => {
                        const urlKey     = `image_${n}_url`;
                        const captionKey = `image_${n}_caption`;
                        const url        = mbScenForm[urlKey];
                        return (
                          <div key={n} style={{ padding:"12px 14px", background:"#f8f8f8", borderRadius:8, border:"1px solid #eee" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: url ? 10 : 0 }}>
                              <button
                                onClick={() => uploadMbImage(n)}
                                disabled={mbUploading === `image_${n}`}
                                style={S.btn("#fff","#555",{ fontSize:12, border:"1px solid #ddd", opacity:mbUploading===`image_${n}`?0.5:1 })}
                              >
                                {mbUploading === `image_${n}` ? "Uploading…" : url ? `Replace Image ${n}` : `Upload Image ${n}`}
                              </button>
                              {url
                                ? <>
                                    <img src={url} alt="" style={{ height:52, width:88, objectFit:"cover", borderRadius:6, border:"1px solid #ddd" }} />
                                    <button onClick={() => setMbScenForm(f => ({ ...f, [urlKey]:"", [captionKey]:"" }))} style={{ background:"none", border:"none", color:"#dc2626", cursor:"pointer", fontSize:12 }}>Remove</button>
                                  </>
                                : <span style={{ fontSize:12, color:"#bbb" }}>No image uploaded</span>
                              }
                            </div>
                            {url && (
                              <div>
                                <label style={{ ...S.label, fontSize:11 }}>Caption (optional)</label>
                                <input
                                  style={{ ...S.input, fontSize:12 }}
                                  value={mbScenForm[captionKey]}
                                  onChange={e => setMbScenForm(f => ({ ...f, [captionKey]:e.target.value }))}
                                  placeholder="e.g. Figure 1: Q3 throughput by facility"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Document */}
                  <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:15 }}>Document (optional — PDF or Excel)</h3>
                    <p style={{ fontSize:12, color:"#888", marginTop:0, marginBottom:14 }}>
                      Rendered inline in the participant view. PDF files display directly; Excel files open via Office Online viewer.
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <button
                        onClick={uploadMbDocument}
                        disabled={mbUploading === "document"}
                        style={S.btn("#fff","#555",{ fontSize:12, border:"1px solid #ddd", opacity:mbUploading==="document"?0.5:1 })}
                      >
                        {mbUploading === "document" ? "Uploading…" : "Upload Document"}
                      </button>
                      {mbScenForm.file_url
                        ? <>
                            <span style={{ fontSize:13, color:"#555" }}>📄 {mbScenForm.file_name}</span>
                            <button onClick={() => setMbScenForm(f => ({ ...f, file_url:"", file_name:"", file_type:"" }))} style={{ background:"none", border:"none", color:"#dc2626", cursor:"pointer", fontSize:12 }}>Remove</button>
                          </>
                        : <span style={{ fontSize:12, color:"#ccc" }}>No document</span>
                      }
                    </div>
                  </div>

                  {/* Time Settings */}
                  <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:15 }}>Time Settings</h3>
                    <p style={{ fontSize:12, color:"#888", marginTop:0, marginBottom:16 }}>
                      All values in minutes. Set per-level time limits for questions and tasks.
                    </p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 24px" }}>
                      {[
                        { key:"reading_time_mins", label:"Reading time (all levels)" },
                        { key:"sup_q_mins",        label:"Supervisor — Behavioural Qs" },
                        { key:"sup_task_mins",     label:"Supervisor — Tasks" },
                        { key:"mgr_q_mins",        label:"Manager — Behavioural Qs" },
                        { key:"mgr_task_mins",     label:"Manager — Tasks" },
                        { key:"dir_q_mins",        label:"Director — Behavioural Qs" },
                        { key:"dir_task_mins",     label:"Director — Tasks" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label style={S.label}>{label}</label>
                          <input
                            type="number"
                            min="1"
                            style={{ ...S.input, width:100 }}
                            value={mbTimeForm[key]}
                            onChange={e => setMbTimeForm(f => ({ ...f, [key]: Number(e.target.value) || 0 }))}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:18 }}>
                      <button onClick={saveModuleTimeSettings} disabled={mbTimeSaving} style={S.btn(CCM_RED,"#fff",{ opacity:mbTimeSaving?0.6:1 })}>
                        {mbTimeSaving ? "Saving…" : "Save Time Settings"}
                      </button>
                    </div>
                  </div>

                  <button onClick={saveMbModule} disabled={mbSaving} style={S.btn(CCM_RED,"#fff",{ opacity:mbSaving?0.6:1 })}>
                    {mbSaving ? "Saving…" : "Save Module"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {adminTab==="questions-guide" && (() => {
          const qgModules      = qgData?.modules || [];
          const qgCompetencies = qgAssignedComps.length > 0
            ? qgAssignedComps.map(a => ({ id: a.competency_id, name: a.competency?.name || a.competency_id, ...a.competency }))
            : (qgData?.competencies || []);
          const qgQuestions    = (qgData?.questions || []).filter(q => q.module_id === qgModuleId);
          const qgGuides       = qgData?.guide || [];

          // Shared badge style
          const tierBadge = (tier) => ({
            fontSize:10, padding:"2px 7px", borderRadius:20, fontWeight:600, letterSpacing:"0.04em",
            background: tier==="advanced" ? "#eff6ff" : "#f0fdf4",
            color:      tier==="advanced" ? "#0369a1" : "#16a34a",
            border:     `1px solid ${tier==="advanced" ? "#bfdbfe" : "#bbf7d0"}`,
          });

          return (
            <div style={{ display:"flex", flexDirection:"column", width:"100%", overflow:"hidden" }}>

              {/* ── Selector bar ─────────────────────────────────────────── */}
              <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid #e5e5e5", background:"#fff", display:"flex", gap:16, alignItems:"flex-end", flexShrink:0 }}>
                <div>
                  <label style={S.label}>Case Study</label>
                  <select style={{ ...S.input, width:260 }} value={qgCsId} onChange={e => loadQgCs(e.target.value)}>
                    <option value="">Select case study…</option>
                    {caseStudies.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                  </select>
                </div>
                {qgCsId && (
                  <div>
                    <label style={S.label}>Module</label>
                    <select style={{ ...S.input, width:280 }} value={qgModuleId} onChange={e => { setQgModuleId(e.target.value); setQFormOpen(false); setGuideOpen(null); setQForm({ ...emptyQForm }); closeAiPanel(); }}>
                      <option value="">Select module…</option>
                      {qgModules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </div>
                )}
                {qgLoading && <span style={{ fontSize:12, color:"#aaa", paddingBottom:6 }}>Loading…</span>}
              </div>

              {/* ── Scrollable content ───────────────────────────────────── */}
              <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
                <div style={{ maxWidth:820, margin:"0 auto" }}>

                  {/* Empty states */}
                  {!qgCsId && (
                    <div style={{ textAlign:"center", marginTop:"5rem", color:"#bbb", fontSize:14 }}>Select a case study to get started.</div>
                  )}
                  {qgCsId && !qgModuleId && !qgLoading && (
                    <div style={{ textAlign:"center", marginTop:"5rem", color:"#bbb", fontSize:14 }}>Select a module to view and manage its questions.</div>
                  )}
                  {qgCsId && qgModuleId && qgCompetencies.length === 0 && !qgLoading && (
                    <div style={{ ...S.card, textAlign:"center", padding:"2rem", color:"#888" }}>
                      <div style={{ fontSize:24, marginBottom:8 }}>⚠</div>
                      <div>No competencies assigned to this case study. Assign competencies in the Case Studies tab first.</div>
                    </div>
                  )}

                  {/* ── Add / Edit question form ───────────────────────── */}
                  {qgModuleId && qgCompetencies.length > 0 && (
                    <>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
                        <h3 style={{ margin:0, fontSize:15 }}>
                          Questions
                          <span style={{ fontWeight:400, color:"#aaa", fontSize:13, marginLeft:6 }}>({qgQuestions.length})</span>
                        </h3>
                        {!qFormOpen && (
                          <button
                            onClick={() => { setQForm({ ...emptyQForm, display_order: qgQuestions.length }); setQFormOpen(true); setGuideOpen(null); }}
                            style={S.btn(CCM_RED,"#fff",{ fontSize:13 })}
                          >+ Add Question</button>
                        )}
                      </div>

                      {qFormOpen && (
                        <div style={{ ...S.card, marginBottom:"1.5rem", borderLeft:`3px solid ${CCM_RED}` }}>
                          <h3 style={{ margin:"0 0 1rem", fontSize:15 }}>{qForm.id ? "Edit Question" : "New Question"}</h3>

                          <div style={{ marginBottom:14 }}>
                            <label style={{ ...S.label, display:"flex", alignItems:"center", gap:6 }}>
                              <span style={tierBadge("advanced")}>advanced</span>Question Text *
                            </label>
                            <textarea
                              style={{ ...S.textarea, height:90 }}
                              value={qForm.text_advanced}
                              onChange={e => setQForm(f => ({ ...f, text_advanced:e.target.value }))}
                              placeholder="Question shown to participants on advanced-tier levels…"
                            />
                          </div>

                          <div style={{ marginBottom:14 }}>
                            <label style={{ ...S.label, display:"flex", alignItems:"center", gap:6 }}>
                              <span style={tierBadge("standard")}>standard</span>Question Text *
                            </label>
                            <textarea
                              style={{ ...S.textarea, height:90 }}
                              value={qForm.text_standard}
                              onChange={e => setQForm(f => ({ ...f, text_standard:e.target.value }))}
                              placeholder="Simplified version shown to participants on standard-tier levels…"
                            />
                          </div>

                          <div style={{ display:"grid", gridTemplateColumns:"1fr 100px auto", gap:12, marginBottom: aiSuggestions.length || aiLoading ? 0 : 14, alignItems:"flex-end" }}>
                            <div>
                              <label style={S.label}>Competency *</label>
                              <select
                                style={S.input}
                                value={qForm.competency_id}
                                onChange={e => setQForm(f => ({ ...f, competency_id: e.target.value }))}
                              >
                                <option value="">Select competency…</option>
                                {qgCompetencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={S.label}>Order</label>
                              <input
                                style={S.input} type="number" min={0}
                                value={qForm.display_order}
                                onChange={e => setQForm(f => ({ ...f, display_order:e.target.value }))}
                              />
                            </div>
                            <button
                              onClick={() => qForm.competency_id && openAiPanel(qForm.competency_id)}
                              disabled={!qForm.competency_id}
                              title={qForm.competency_id ? "Get AI question suggestions for this competency" : "Select a competency first"}
                              style={S.btn("#7e22ce","#fff",{ fontSize:12, whiteSpace:"nowrap", opacity: qForm.competency_id ? 1 : 0.4 })}
                            >✨ Suggest Questions</button>
                          </div>

                          {/* ── AI Suggestions panel ─────────────────────── */}
                          {aiPanelOpen && (
                            <div style={{ margin:"14px 0", padding:"14px 16px", background:"#f8f7ff", border:"1px solid #e9d5ff", borderRadius:10 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                                <span style={{ fontSize:13, fontWeight:600, color:"#6d28d9" }}>✨ AI Question Suggestions</span>
                                {aiLoading && <span style={{ fontSize:12, color:"#9c60d0" }}>Generating…</span>}
                                {!aiLoading && qForm.competency_id && (
                                  <button
                                    onClick={() => fetchAiSuggestions(qForm.competency_id)}
                                    style={S.btn("#fff","#7e22ce",{ fontSize:11, padding:"3px 10px", border:"1px solid #c4b5fd" })}
                                  >↻ {aiError ? "Retry" : "Regenerate"}</button>
                                )}
                              </div>

                              {aiLoading && (
                                <div style={{ fontSize:12, color:"#9c60d0", padding:"8px 0" }}>
                                  Asking Claude for questions about <em>{(qgCompetencies.find(c=>c.id===qForm.competency_id)||{}).name}</em>…
                                </div>
                              )}

                              {!aiLoading && aiError && (
                                <div style={{ fontSize:12, color:"#b91c1c", background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:6, padding:"8px 12px", marginBottom:8 }}>
                                  {aiError}
                                </div>
                              )}

                              {!aiLoading && aiSuggestions.map((s, i) => (
                                <label key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"10px 12px", background:aiSelected.has(i)?"#ede9fe":"#fff", border:`1px solid ${aiSelected.has(i)?"#c4b5fd":"#e9d5ff"}`, borderRadius:8, marginBottom:6, cursor:"pointer" }}>
                                  <input
                                    type="checkbox"
                                    checked={aiSelected.has(i)}
                                    onChange={e => setAiSelected(prev => {
                                      const next = new Set(prev);
                                      e.target.checked ? next.add(i) : next.delete(i);
                                      return next;
                                    })}
                                    style={{ marginTop:2, flexShrink:0 }}
                                  />
                                  <div style={{ flex:1 }}>
                                    <div style={{ display:"flex", gap:6, marginBottom:4, alignItems:"flex-start" }}>
                                      <span style={{ ...tierBadge("advanced"), flexShrink:0 }}>advanced</span>
                                      <span style={{ fontSize:12, lineHeight:1.5, color:"#222" }}>{s.advanced}</span>
                                    </div>
                                    <div style={{ display:"flex", gap:6, alignItems:"flex-start" }}>
                                      <span style={{ ...tierBadge("standard"), flexShrink:0 }}>standard</span>
                                      <span style={{ fontSize:12, lineHeight:1.5, color:"#555" }}>{s.standard}</span>
                                    </div>
                                  </div>
                                </label>
                              ))}

                              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                                {!aiLoading && aiSuggestions.length > 0 && (
                                  <button
                                    onClick={addSelectedSuggestions}
                                    disabled={aiAdding || aiSelected.size === 0}
                                    style={S.btn("#7e22ce","#fff",{ fontSize:12, opacity:(aiAdding||aiSelected.size===0)?0.5:1 })}
                                  >
                                    {aiAdding ? "Adding…" : `Add Selected (${aiSelected.size})`}
                                  </button>
                                )}
                                <button
                                  onClick={closeAiPanel}
                                  style={S.btn("#fff","#888",{ fontSize:12, border:"1px solid #ddd" })}
                                >Dismiss</button>
                              </div>
                            </div>
                          )}

                          <div style={{ display:"flex", gap:8, marginTop:4 }}>
                            <button onClick={saveQgQuestion} disabled={qSaving} style={S.btn(CCM_RED,"#fff",{ opacity:qSaving?0.6:1 })}>
                              {qSaving ? "Saving…" : qForm.id ? "Update Question" : "Save Question"}
                            </button>
                            <button onClick={() => { setQFormOpen(false); setQForm({ ...emptyQForm }); closeAiPanel(); }} style={S.btn("#fff","#666",{ border:"1px solid #ddd" })}>Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* ── Question list ──────────────────────────────── */}
                      {qgQuestions.length === 0 && !qFormOpen && (
                        <div style={{ ...S.card, textAlign:"center", color:"#aaa", padding:"2.5rem" }}>
                          <div style={{ fontSize:28, marginBottom:8 }}>❓</div>
                          <div style={{ fontSize:14 }}>No questions yet for this module.</div>
                          <div style={{ fontSize:12, marginTop:4 }}>Click "+ Add Question" to get started.</div>
                        </div>
                      )}

                      {qgQuestions.map((question, idx) => {
                        const comp    = qgCompetencies.find(c => c.id === question.competency_id);
                        const isEditingQ = qFormOpen && qForm.id === question.id;

                        return (
                          <div key={question.id} style={{ ...S.card, marginBottom:"1rem", opacity: isEditingQ ? 0.5 : 1 }}>

                            {/* Question header */}
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                              <span style={{ fontSize:11, fontWeight:700, background:"#f0f0f0", color:"#555", padding:"3px 9px", borderRadius:20, minWidth:28, textAlign:"center" }}>
                                Q{idx + 1}
                              </span>
                              {comp && (
                                <span style={{ fontSize:11, background:"#faf5ff", color:"#7e22ce", border:"1px solid #e9d5ff", padding:"2px 9px", borderRadius:20 }}>
                                  {comp.name}
                                </span>
                              )}
                              <div style={{ flex:1 }} />
                              <button
                                onClick={() => {
                                  closeAiPanel();
                                  setQForm({ id:question.id, text_advanced:question.text_advanced||"", text_standard:question.text_standard||"", competency_id:question.competency_id||"", display_order:question.display_order||0 });
                                  setQFormOpen(true); setGuideOpen(null);
                                  window.scrollTo({ top:0, behavior:"smooth" });
                                }}
                                style={S.btn("#fff","#333",{ fontSize:11, padding:"4px 10px", border:"1px solid #ddd" })}
                              >Edit</button>
                              <button
                                onClick={() => deleteQgQuestion(question)}
                                style={S.btn("#fff","#dc2626",{ fontSize:11, padding:"4px 10px", border:"1px solid #fca5a5" })}
                              >Delete</button>
                            </div>

                            {/* Question text */}
                            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                              {[["advanced","text_advanced"],["standard","text_standard"]].map(([tier, field]) => (
                                <div key={tier} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                                  <span style={{ ...tierBadge(tier), flexShrink:0, marginTop:1 }}>{tier}</span>
                                  <span style={{ fontSize:13, lineHeight:1.55, color:"#222" }}>{question[field] || <em style={{ color:"#bbb" }}>Not set</em>}</span>
                                </div>
                              ))}
                            </div>

                          </div>
                        );
                      })}

                      {/* ── Per-competency Assessor Guide section ─────────── */}
                      {qgAssignedComps.length > 0 && (() => {
                        const scoreColors = [
                          { bg:"#f5f5f5", color:"#666",    border:"#e0e0e0" },
                          { bg:"#fef2f2", color:"#dc2626", border:"#fca5a5" },
                          { bg:"#fff7ed", color:"#ea580c", border:"#fdba74" },
                          { bg:"#fefce8", color:"#ca8a04", border:"#fde047" },
                          { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
                          { bg:"#eff6ff", color:"#0369a1", border:"#bfdbfe" },
                        ];
                        return (
                          <div style={{ marginTop:"2rem" }}>
                            <h3 style={{ fontSize:15, margin:"0 0 1rem", color:"#333" }}>Competency Assessor Guides</h3>
                            <p style={{ fontSize:12, color:"#888", marginTop:0, marginBottom:"0.5rem" }}>
                              One guide per competency — click ✨ Generate Guide to have Claude write the full descriptor, score anchors, and behavioral indicators.
                            </p>
                            <p style={{ fontSize:12, color:"#b45309", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:6, padding:"6px 10px", marginBottom:"1rem" }}>
                              ⏳ Generation takes up to 25 seconds. Stay on this page while it runs, and generate one at a time.
                            </p>
                            {qgAssignedComps.map(assignment => {
                              const compId   = assignment.competency_id;
                              const comp     = assignment.competency;
                              const guide    = qgCompGuides[compId];
                              const isGen    = guideGenLoading[compId];
                              const compQs   = qgQuestions.filter(q => q.competency_id === compId);
                              return (
                                <div key={compId} style={{ ...S.card, marginBottom:"1rem", borderLeft:`3px solid #7e22ce` }}>
                                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: guide ? 16 : 0 }}>
                                    <div>
                                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                                        <span style={{ fontWeight:700, fontSize:15 }}>{comp?.name || compId}</span>
                                        {comp?.category && <span style={{ fontSize:11, color:"#7e22ce", background:"#faf5ff", border:"1px solid #e9d5ff", padding:"2px 8px", borderRadius:20 }}>{comp.category}</span>}
                                        {guide && <span style={{ fontSize:11, color:"#16a34a" }}>✓ Guide saved</span>}
                                      </div>
                                      <span style={{ fontSize:11, color:"#888" }}>{compQs.length} question{compQs.length !== 1 ? "s" : ""} in this module</span>
                                    </div>
                                    <button
                                      onClick={() => generateCompGuide(compId, comp?.name || compId)}
                                      disabled={isGen}
                                      style={S.btn("#7e22ce","#fff",{ fontSize:12, opacity:isGen?0.6:1 })}
                                    >
                                      {isGen ? "✨ Generating…" : "✨ Generate Guide"}
                                    </button>
                                  </div>

                                  {guide && (
                                    <div>
                                      {guide.definition && (
                                        <div style={{ marginBottom:16, padding:"12px 14px", background:"#f8f7ff", border:"1px solid #e9d5ff", borderRadius:8 }}>
                                          <div style={{ fontSize:11, fontWeight:700, color:"#6d28d9", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Competency Definition</div>
                                          <p style={{ fontSize:13, lineHeight:1.6, margin:0 }}>{guide.definition}</p>
                                        </div>
                                      )}

                                      {Array.isArray(guide.score_descriptors) && guide.score_descriptors.length > 0 && (
                                        <div style={{ marginBottom:16 }}>
                                          <div style={{ fontSize:12, fontWeight:700, color:"#333", marginBottom:8 }}>Score Descriptors (0–5)</div>
                                          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                            {guide.score_descriptors.map((sd, i) => {
                                              const col = scoreColors[sd.score] || scoreColors[0];
                                              return (
                                                <div key={i} style={{ display:"flex", gap:10, padding:"10px 12px", background:col.bg, border:`1px solid ${col.border}`, borderRadius:8 }}>
                                                  <div style={{ flexShrink:0, width:54, textAlign:"center" }}>
                                                    <div style={{ fontSize:18, fontWeight:900, color:col.color }}>{sd.score}</div>
                                                    <div style={{ fontSize:10, fontWeight:600, color:col.color, lineHeight:1.2 }}>{sd.label}</div>
                                                  </div>
                                                  <div style={{ flex:1, fontSize:12, lineHeight:1.55, color:"#333" }}>{sd.description}</div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                        {[
                                          { label:"Strong Indicators", key:"strong_indicators", color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
                                          { label:"Weak Indicators",   key:"weak_indicators",   color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
                                        ].map(({ label, key, color, bg, border }) => {
                                          const items = Array.isArray(guide[key]) ? guide[key] : (typeof guide[key]==="string" ? guide[key].split("\n").filter(Boolean) : []);
                                          if (!items.length) return null;
                                          return (
                                            <div key={key}>
                                              <div style={{ fontSize:12, fontWeight:700, color, marginBottom:6 }}>{label}</div>
                                              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                                {items.map((item, i) => (
                                                  <div key={i} style={{ fontSize:12, padding:"5px 10px", background:bg, border:`1px solid ${border}`, borderRadius:6 }}>● {item}</div>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        {adminTab==="cohorts" && (
          <div style={{ maxWidth:820, margin:"0 auto", padding:"1.5rem" }}>

            {/* ── Create cohort form ── */}
            <div style={{ ...S.card, marginBottom:"1.5rem" }}>
              <h2 style={{ margin:"0 0 1.25rem", fontSize:17 }}>New Cohort</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={S.label}>Case Study *</label>
                  <select style={S.input} value={cohortForm.case_study_id} onChange={e => setCohortForm(f => ({ ...f, case_study_id:e.target.value }))}>
                    <option value="">Select case study…</option>
                    {caseStudies.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Cohort Name *</label>
                  <input style={S.input} value={cohortForm.name} onChange={e => setCohortForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. Boeing Cohort A — May 2026" />
                </div>
                <div>
                  <label style={S.label}>Start Date</label>
                  <input style={S.input} type="date" value={cohortForm.start_date} onChange={e => setCohortForm(f => ({ ...f, start_date:e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>End Date</label>
                  <input style={S.input} type="date" value={cohortForm.end_date} onChange={e => setCohortForm(f => ({ ...f, end_date:e.target.value }))} />
                </div>
              </div>

              <p style={{ fontSize:12, color:"#888", margin:"0 0 14px" }}>
                An access code will be generated automatically and shown in the list below.
              </p>
              <button onClick={saveCohort} disabled={cohortSaving} style={S.btn(CCM_RED,"#fff",{ opacity:cohortSaving?0.6:1 })}>
                {cohortSaving ? "Creating…" : "Create Cohort"}
              </button>
            </div>

            {/* ── Cohort list ── */}
            <h3 style={{ fontSize:15, margin:"0 0 1rem" }}>All Cohorts ({cohorts.length})</h3>
            {cohorts.length === 0 && <p style={{ fontSize:13, color:"#aaa" }}>No cohorts yet.</p>}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {cohorts.map(co => {
                const cs = caseStudies.find(c => c.id === co.case_study_id);
                return (
                  <div key={co.id} style={{ ...S.card, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                        <span style={{ fontWeight:600, fontSize:14 }}>{co.name}</span>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, fontWeight:500, background: co.is_active ? "#f0fdf4" : "#f5f5f5", color: co.is_active ? "#16a34a" : "#888", border:`1px solid ${co.is_active?"#bbf7d0":"#ddd"}` }}>
                          {co.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div style={{ fontSize:12, color:"#888" }}>
                        {cs?.name || "Unknown case study"}{co.start_date ? ` · ${co.start_date}` : ""}{co.end_date ? ` → ${co.end_date}` : ""}
                      </div>
                    </div>
                    {/* Access code display */}
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ fontFamily:"monospace", fontSize:16, fontWeight:700, letterSpacing:3, color:"#333", background:"#f8f8f8", padding:"6px 14px", borderRadius:8, border:"1px solid #e5e5e5" }}>
                        {co.access_code}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(co.access_code); notify("Copied!"); }} style={S.btn("#f5f5f5","#555",{ fontSize:11, border:"1px solid #ddd", padding:"6px 10px" })}>
                        Copy
                      </button>
                      <button onClick={() => emailAccessCode(co)} style={S.btn("#eff6ff","#1d4ed8",{ fontSize:11, border:"1px solid #bfdbfe", padding:"6px 10px" })}>
                        ✉ Email Code
                      </button>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => toggleCohortActive(co)} style={S.btn("#fff", co.is_active?"#dc2626":"#16a34a", { fontSize:12, border:`1px solid ${co.is_active?"#fca5a5":"#bbf7d0"}` })}>
                        {co.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => deleteCohort(co.id)} style={S.btn("#fff","#dc2626",{ fontSize:12, border:"1px solid #fca5a5" })}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {adminTab==="participants" && (
          <div style={{ maxWidth:960, margin:"0 auto", padding:"1.5rem" }}>

            {/* ── Edit form (corrections only, shown when pEditing) ── */}
            {pEditing && (
              <div style={{ ...S.card, marginBottom:"1.5rem", borderLeft:`3px solid ${CCM_RED}` }}>
                <h3 style={{ margin:"0 0 1rem", fontSize:15 }}>Edit Participant (corrections only)</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                  <div><label style={S.label}>Full Name</label>
                    <input style={S.input} value={pForm.name} onChange={e => setPForm(f => ({ ...f, name:e.target.value }))} /></div>
                  <div><label style={S.label}>Job Title</label>
                    <input style={S.input} value={pForm.role} onChange={e => setPForm(f => ({ ...f, role:e.target.value }))} /></div>
                  <div><label style={S.label}>Username</label>
                    <input style={S.input} value={pForm.username} onChange={e => setPForm(f => ({ ...f, username:e.target.value }))} /></div>
                  <div><label style={S.label}>Level</label>
                    <select style={S.input} value={pForm.level_id} onChange={e => setPForm(f => ({ ...f, level_id:e.target.value }))}>
                      <option value="">Select level…</option>
                      {(() => {
                        const cohort = cohorts.find(c => c.id === pForm.cohort_id);
                        return allLevels.filter(l => l.case_study_id === cohort?.case_study_id);
                      })().map(l => <option key={l.id} value={l.id}>{l.name} ({l.complexity_tier})</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={saveParticipant} disabled={pSaving} style={S.btn(CCM_RED,"#fff",{ opacity:pSaving?0.6:1 })}>{pSaving?"Saving…":"Save Changes"}</button>
                  <button onClick={() => { setPForm(emptyPForm); setPEditing(false); }} style={S.btn("#fff","#666",{ border:"1px solid #ddd" })}>Cancel</button>
                </div>
              </div>
            )}

            {/* ── Participant list grouped by cohort ── */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
              <h3 style={{ fontSize:15, margin:0 }}>Registered Participants ({participants.length})</h3>
              <button onClick={reloadParticipants} style={S.btn("#fff","#555",{ fontSize:12, border:"1px solid #ddd" })}>↻ Refresh</button>
            </div>

            {participants.length === 0 && (
              <div style={{ ...S.card, textAlign:"center", color:"#aaa", padding:"3rem" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>👥</div>
                <div style={{ fontSize:14 }}>No participants registered yet.</div>
                <div style={{ fontSize:12, marginTop:6 }}>Participants self-register using their cohort access code.</div>
              </div>
            )}

            {cohorts.map(cohort => {
              const cohortParts = participants.filter(p => p.cohort_id === cohort.id);
              if (cohortParts.length === 0) return null;
              const cs = caseStudies.find(c => c.id === cohort.case_study_id);
              return (
                <div key={cohort.id} style={{ ...S.card, marginBottom:"1rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, paddingBottom:10, borderBottom:"1px solid #f0f0f0" }}>
                    <span style={{ fontWeight:700, fontSize:14 }}>{cohort.name}</span>
                    <span style={{ fontSize:11, color:"#888" }}>{cs?.name || ""}</span>
                    <span style={{ fontFamily:"monospace", fontSize:12, background:"#f0f0f0", padding:"2px 8px", borderRadius:6 }}>{cohort.access_code}</span>
                    <span style={{ fontSize:11, color:"#888", marginLeft:"auto" }}>{cohortParts.length} participant{cohortParts.length!==1?"s":""}</span>
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ color:"#888", fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                        <th style={{ textAlign:"left", padding:"4px 8px", fontWeight:600 }}>Name</th>
                        <th style={{ textAlign:"left", padding:"4px 8px", fontWeight:600 }}>Username</th>
                        <th style={{ textAlign:"left", padding:"4px 8px", fontWeight:600 }}>Job Title</th>
                        <th style={{ textAlign:"left", padding:"4px 8px", fontWeight:600 }}>Level</th>
                        <th style={{ textAlign:"right", padding:"4px 8px", fontWeight:600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortParts.map(p => {
                        const level = allLevels.find(l => l.id === p.level_id);
                        const isResetting = resetPwd.id === p.id;
                        return (
                          <tr key={p.id} style={{ borderTop:"1px solid #f5f5f5" }}>
                            <td style={{ padding:"8px" }}>{p.name}</td>
                            <td style={{ padding:"8px", fontFamily:"monospace", fontSize:12, color:"#555" }}>{p.username}</td>
                            <td style={{ padding:"8px", color:"#666" }}>{p.role || "—"}</td>
                            <td style={{ padding:"8px" }}>
                              {level
                                ? <span style={{ fontSize:11, background:"#f0f0f0", padding:"2px 8px", borderRadius:20 }}>{level.name} · {level.complexity_tier}</span>
                                : "—"}
                            </td>
                            <td style={{ padding:"8px", textAlign:"right" }}>
                              {isResetting ? (
                                <span style={{ display:"inline-flex", gap:4, alignItems:"center" }}>
                                  <input
                                    type="password"
                                    placeholder="New password"
                                    value={resetPwd.value}
                                    onChange={e => setResetPwd(r => ({ ...r, value:e.target.value }))}
                                    style={{ ...S.input, width:130, fontSize:12, padding:"4px 8px" }}
                                  />
                                  <button onClick={saveResetPassword} disabled={resetPwd.saving} style={S.btn(CCM_RED,"#fff",{ fontSize:11, padding:"4px 10px" })}>
                                    {resetPwd.saving?"…":"Save"}
                                  </button>
                                  <button onClick={() => setResetPwd({ id:null, value:"", saving:false })} style={S.btn("#fff","#666",{ fontSize:11, padding:"4px 8px", border:"1px solid #ddd" })}>✕</button>
                                </span>
                              ) : (
                                <span style={{ display:"inline-flex", gap:4 }}>
                                  <button onClick={() => editParticipant(p)} style={S.btn("#fff","#333",{ fontSize:11, padding:"4px 10px", border:"1px solid #ddd" })}>Edit</button>
                                  <button onClick={() => setResetPwd({ id:p.id, value:"", saving:false })} style={S.btn("#fff","#555",{ fontSize:11, padding:"4px 10px", border:"1px solid #ddd" })}>Reset Pwd</button>
                                  <button onClick={() => deleteParticipant(p)} style={S.btn("#fff","#dc2626",{ fontSize:11, padding:"4px 10px", border:"1px solid #fca5a5" })}>Delete</button>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
            {/* Participants not matched to any loaded cohort */}
            {(() => {
              const knownCohortIds = new Set(cohorts.map(c => c.id));
              const orphans = participants.filter(p => !knownCohortIds.has(p.cohort_id));
              if (!orphans.length) return null;
              return (
                <div style={{ ...S.card, marginBottom:"1rem", borderLeft:"3px solid #f59e0b" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#92400e", marginBottom:12 }}>⚠ Unmatched cohort ({orphans.length})</div>
                  {orphans.map(p => <div key={p.id} style={{ fontSize:13, padding:"4px 0" }}>{p.name} — {p.username}</div>)}
                </div>
              );
            })()}
          </div>
        )}
        {adminTab==="competencies" && (() => {
  const CATEGORIES = ["All","Leadership","Cognitive","Interpersonal","Personal Effectiveness","Functional & Executive"];
  const filtered = libComps.filter(c => {
    const matchCat = libFilter === "All" || c.category === libFilter;
    const matchSearch = !libSearch || c.name.toLowerCase().includes(libSearch.toLowerCase());
    return matchCat && matchSearch;
  });
  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const items = filtered.filter(c => c.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const catColor = {
    "Leadership":             { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" },
    "Cognitive":              { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0" },
    "Interpersonal":          { bg:"#fdf4ff", color:"#7e22ce", border:"#e9d5ff" },
    "Personal Effectiveness": { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" },
    "Functional & Executive": { bg:"#fef2f2", color:"#b91c1c", border:"#fecaca" },
  };

  return (
    <div style={{ maxWidth:960, margin:"0 auto", padding:"1.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Competency Library</h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"#888" }}>
            {libComps.length} competencies · Global library reused across all case studies
          </p>
        </div>
        <button onClick={() => setAddCompOpen(v => !v)} style={S.btn(CCM_RED,"#fff",{ fontSize:13 })}>+ Add Competency</button>
      </div>

      {addCompOpen && (
        <div style={{ ...S.card, marginBottom:"1.5rem", borderLeft:`3px solid ${CCM_RED}` }}>
          <h3 style={{ margin:"0 0 1rem", fontSize:15 }}>Add New Competency</h3>
          <p style={{ fontSize:12, color:"#888", marginTop:0, marginBottom:14 }}>
            Type the competency name, select a category, and click Generate — Claude will write the definition automatically.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 200px", gap:12, marginBottom:14 }}>
            <div>
              <label style={S.label}>Competency Name *</label>
              <input style={S.input} value={newCompForm.name} onChange={e => setNewCompForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. Emotional Intelligence" />
            </div>
            <div>
              <label style={S.label}>Category *</label>
              <select style={S.input} value={newCompForm.category} onChange={e => setNewCompForm(f => ({ ...f, category:e.target.value }))}>
                <option>Leadership</option>
                <option>Cognitive</option>
                <option>Interpersonal</option>
                <option>Personal Effectiveness</option>
                <option>Functional & Executive</option>
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={generateAndAddCompetency} disabled={newCompGen||newCompSaving} style={S.btn(CCM_RED,"#fff",{ opacity:(newCompGen||newCompSaving)?0.6:1 })}>
              {newCompGen ? "✨ Generating…" : newCompSaving ? "Saving…" : "✨ Generate & Add"}
            </button>
            <button onClick={() => { setAddCompOpen(false); setNewCompForm({ name:"", category:"Leadership" }); }} style={S.btn("#fff","#666",{ border:"1px solid #ddd" })}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:10, marginBottom:"1.25rem", alignItems:"center" }}>
        <input style={{ ...S.input, width:260, fontSize:13 }} placeholder="Search competencies…" value={libSearch} onChange={e => setLibSearch(e.target.value)} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setLibFilter(cat)} style={{
              fontSize:11, padding:"4px 12px", borderRadius:20, cursor:"pointer", fontWeight: libFilter===cat ? 600 : 400,
              background: libFilter===cat ? "#111" : "#f5f5f5",
              color:      libFilter===cat ? "#fff" : "#555",
              border:     libFilter===cat ? "1px solid #111" : "1px solid #ddd",
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {libLoading && <p style={{ fontSize:13, color:"#aaa" }}>Loading…</p>}

      {!libLoading && Object.entries(grouped).map(([cat, items]) => {
        const colors = catColor[cat] || { bg:"#f5f5f5", color:"#333", border:"#ddd" };
        return (
          <div key={cat} style={{ marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, background:colors.bg, color:colors.color, border:`1px solid ${colors.border}`, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {cat}
              </span>
              <span style={{ fontSize:12, color:"#aaa" }}>{items.length} competencies</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {items.map(comp => {
                const isEditing = editCompId === comp.id;
                return (
                  <div key={comp.id} style={{ ...S.card, padding:"14px 16px" }}>
                    {isEditing ? (
                      <div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 200px", gap:12, marginBottom:10 }}>
                          <div>
                            <label style={S.label}>Name</label>
                            <input style={S.input} value={editCompForm.name} onChange={e => setEditCompForm(f => ({ ...f, name:e.target.value }))} />
                          </div>
                          <div>
                            <label style={S.label}>Category</label>
                            <select style={S.input} value={editCompForm.category} onChange={e => setEditCompForm(f => ({ ...f, category:e.target.value }))}>
                              <option>Leadership</option>
                              <option>Cognitive</option>
                              <option>Interpersonal</option>
                              <option>Personal Effectiveness</option>
                              <option>Functional & Executive</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom:10 }}>
                          <label style={S.label}>Definition</label>
                          <textarea style={{ ...S.textarea, height:80 }} value={editCompForm.definition} onChange={e => setEditCompForm(f => ({ ...f, definition:e.target.value }))} />
                        </div>
                        <div style={{ marginBottom:12 }}>
                          <label style={S.label}>Observed In</label>
                          <input style={S.input} value={editCompForm.observed_in} onChange={e => setEditCompForm(f => ({ ...f, observed_in:e.target.value }))} />
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={saveEditComp} disabled={editCompSaving} style={S.btn(CCM_RED,"#fff",{ opacity:editCompSaving?0.6:1 })}>{editCompSaving?"Saving…":"Save"}</button>
                          <button onClick={() => setEditCompId(null)} style={S.btn("#fff","#666",{ border:"1px solid #ddd" })}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                            <span style={{ fontWeight:700, fontSize:14 }}>{comp.name}</span>
                            {!comp.is_default && (
                              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"#fff7ed", color:"#c2410c", border:"1px solid #fed7aa" }}>Custom</span>
                            )}
                          </div>
                          <p style={{ fontSize:13, color:"#444", margin:"0 0 6px", lineHeight:1.55 }}>{comp.definition}</p>
                          {comp.observed_in && (
                            <p style={{ fontSize:11, color:"#888", margin:0 }}>
                              <span style={{ fontWeight:600 }}>Observed in: </span>{comp.observed_in}
                            </p>
                          )}
                        </div>
                        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                          <button onClick={() => { setEditCompId(comp.id); setEditCompForm({ name:comp.name, category:comp.category, definition:comp.definition, observed_in:comp.observed_in||"" }); }} style={S.btn("#fff","#333",{ fontSize:11, padding:"4px 10px", border:"1px solid #ddd" })}>Edit</button>
                          <button onClick={() => deleteLibComp(comp.id)} style={S.btn("#fff","#dc2626",{ fontSize:11, padding:"4px 10px", border:"1px solid #fca5a5" })}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!libLoading && filtered.length === 0 && (
        <div style={{ ...S.card, textAlign:"center", color:"#aaa", padding:"3rem" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
          <div style={{ fontSize:14 }}>No competencies found.</div>
        </div>
      )}
    </div>
  );
})()}
        {adminTab==="dashboard" && (
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"1.5rem" }}>
            {/* Header + cohort selector */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Dashboard</h2>
                <p style={{ margin:"4px 0 0", fontSize:13, color:"#888" }}>Cohort completion overview and integrity monitoring</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <select style={{ ...S.input, width:320 }} value={dbCohortId} onChange={e => { setDbCohortId(e.target.value); loadDashboard(e.target.value); }}>
                  <option value="">Select cohort…</option>
                  {cohorts.map(co => {
                    const cs = caseStudies.find(c => c.id === co.case_study_id);
                    return <option key={co.id} value={co.id}>{co.name}{cs ? ` — ${cs.name}` : ""}</option>;
                  })}
                </select>
                <button onClick={() => { reloadParticipants(); if (dbCohortId) loadDashboard(dbCohortId); }} style={S.btn("#fff","#555",{ fontSize:12, border:"1px solid #ddd" })}>↻</button>
              </div>
            </div>

            {!dbCohortId && (
              <div style={{ textAlign:"center", marginTop:"5rem", color:"#bbb", fontSize:14 }}>
                Select a cohort above to view its dashboard.
              </div>
            )}

            {dbCohortId && (() => {
              const cohort     = cohorts.find(c => c.id === dbCohortId);
              const cs         = caseStudies.find(c => c.id === cohort?.case_study_id);
              const cohortParts = participants.filter(p => p.cohort_id === dbCohortId);

              const rMap = {};
              dbResults.forEach(r => {
                if (!rMap[r.participant_id]) rMap[r.participant_id] = {};
                rMap[r.participant_id][r.module_id] = r;
              });

              function cellStatus(pId, mId) { return rMap[pId]?.[mId] ? "done" : "none"; }
              function cellTime(pId, mId) {
                const r = rMap[pId]?.[mId];
                if (!r?.time_spent) return "";
                const m = Math.round(r.time_spent / 60);
                return m > 0 ? `${m}m` : "<1m";
              }
              function totalMins(pId) {
                return Math.round(Object.values(rMap[pId]||{}).reduce((s,r) => s+(r.time_spent||0), 0) / 60);
              }
              function tabSwitches(pId) {
                return Object.values(rMap[pId]||{}).reduce((s,r) => {
                  const a = r.answers; return s + (Array.isArray(a) ? 0 : (a?.tab_switches||0));
                }, 0);
              }
              function doneCount(pId) { return dbModules.filter(m => rMap[pId]?.[m.id]).length; }

              const thS = { padding:"8px 10px", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em", color:"#888", background:"#fafafa", borderBottom:"2px solid #e5e5e5", whiteSpace:"nowrap" };
              const tdS = { padding:"7px 8px", borderBottom:"1px solid #f5f5f5", fontSize:13 };

              // Level grouping
              const LCOLORS = ["#1d4ed8","#7e22ce","#c2410c","#15803d","#0369a1","#92400e"];
              const levelNames = [...new Set(cohortParts.map(p => allLevels.find(l => l.id === p.level_id)?.name || "Unknown"))];
              const lColorMap  = Object.fromEntries(levelNames.map((n,i) => [n, LCOLORS[i%LCOLORS.length]]));

              function renderRow(p, showActions) {
                const level    = allLevels.find(l => l.id === p.level_id);
                const lvlName  = level?.name || "—";
                const lvlColor = lColorMap[lvlName] || "#555";
                const ts       = tabSwitches(p.id);
                const flagged  = ts > 3;
                const tot      = totalMins(p.id);
                const isReset  = resetPwd.id === p.id;
                return (
                  <tr key={p.id} style={{ background: flagged ? "#fff8f8" : "transparent" }}>
                    <td style={{ ...tdS, paddingLeft:12 }}>
                      <div style={{ fontWeight:600 }}>{p.name}</div>
                      {p.role && <div style={{ fontSize:11, color:"#888" }}>{p.role}</div>}
                    </td>
                    {showActions && (
                      <td style={{ ...tdS, textAlign:"center" }}>
                        <span style={{ fontSize:11, fontWeight:600, color:lvlColor, background:"#f0f0f0", padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap" }}>{lvlName}</span>
                      </td>
                    )}
                    <td style={{ ...tdS, textAlign:"center" }}>
                      <span style={{ fontSize:12, color: doneCount(p.id)===dbModules.length && dbModules.length>0 ? "#16a34a" : doneCount(p.id)>0 ? "#d97706" : "#aaa" }}>
                        {doneCount(p.id)}/{dbModules.length}
                      </span>
                    </td>
                    {dbModules.map(m => {
                      const done = cellStatus(p.id, m.id) === "done";
                      const time = cellTime(p.id, m.id);
                      return (
                        <td key={m.id} style={{ ...tdS, textAlign:"center" }}>
                          <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", background: done?"#f0fdf4":"#f5f5f5", border:`1px solid ${done?"#bbf7d0":"#e5e5e5"}`, borderRadius:6, padding:"3px 8px", minWidth:44 }}>
                            <span style={{ fontSize:12, fontWeight:700, color: done?"#16a34a":"#ccc" }}>{done?"✓":"—"}</span>
                            {time && <span style={{ fontSize:10, color:"#888", marginTop:1 }}>{time}</span>}
                          </div>
                        </td>
                      );
                    })}
                    <td style={{ ...tdS, textAlign:"center" }}>
                      <span style={{ fontSize:12, color:"#555" }}>{tot ? `${tot}m` : "—"}</span>
                    </td>
                    <td style={{ ...tdS, textAlign:"center" }}>
                      <span style={{ fontSize:12, fontWeight: flagged?700:400, color: flagged?"#dc2626":"#555", background: flagged?"#fef2f2":"transparent", padding: flagged?"2px 6px":0, borderRadius:4 }}>
                        {ts > 0 ? ts : "—"}{flagged ? " ⚠" : ""}
                      </span>
                    </td>
                    {showActions && (
                      <td style={{ ...tdS, textAlign:"right", paddingRight:8 }}>
                        {isReset ? (
                          <span style={{ display:"inline-flex", gap:4, alignItems:"center" }}>
                            <input type="password" placeholder="New password" value={resetPwd.value}
                              onChange={e => setResetPwd(r => ({ ...r, value:e.target.value }))}
                              style={{ ...S.input, width:110, fontSize:11, padding:"3px 6px" }} />
                            <button onClick={saveResetPassword} disabled={resetPwd.saving}
                              style={S.btn(CCM_RED,"#fff",{ fontSize:10, padding:"3px 8px" })}>{resetPwd.saving?"…":"Save"}</button>
                            <button onClick={() => setResetPwd({ id:null, value:"", saving:false })}
                              style={S.btn("#fff","#666",{ fontSize:10, padding:"3px 6px", border:"1px solid #ddd" })}>✕</button>
                          </span>
                        ) : (
                          <span style={{ display:"inline-flex", gap:4 }}>
                            <button onClick={() => { editParticipant(p); setAdminTab("participants"); }}
                              style={S.btn("#fff","#333",{ fontSize:10, padding:"3px 8px", border:"1px solid #ddd" })}>Edit</button>
                            <button onClick={() => setResetPwd({ id:p.id, value:"", saving:false })}
                              style={S.btn("#fff","#555",{ fontSize:10, padding:"3px 8px", border:"1px solid #ddd" })}>Pwd</button>
                            <button onClick={() => deleteParticipant(p)}
                              style={S.btn("#fff","#dc2626",{ fontSize:10, padding:"3px 8px", border:"1px solid #fca5a5" })}>Delete</button>
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              }

              return (
                <>
                  {/* ── Cohort info card ── */}
                  <div style={{ ...S.card, marginBottom:"1.5rem", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <span style={{ fontWeight:700, fontSize:16 }}>{cohort?.name}</span>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, fontWeight:500, background: cohort?.is_active?"#f0fdf4":"#f5f5f5", color: cohort?.is_active?"#16a34a":"#888", border:`1px solid ${cohort?.is_active?"#bbf7d0":"#ddd"}` }}>
                          {cohort?.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div style={{ fontSize:13, color:"#666", display:"flex", flexWrap:"wrap", gap:16 }}>
                        {cs && <span>📋 {cs.name}</span>}
                        {cohort?.start_date && <span>📅 {cohort.start_date}{cohort.end_date ? ` → ${cohort.end_date}` : ""}</span>}
                        <span>👥 {cohortParts.length} participant{cohortParts.length!==1?"s":""}</span>
                        {dbModules.length > 0 && <span>📦 {dbModules.length} module{dbModules.length!==1?"s":""}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      <div style={{ fontFamily:"monospace", fontSize:18, fontWeight:700, letterSpacing:4, color:"#333", background:"#f8f8f8", padding:"8px 16px", borderRadius:8, border:"1px solid #e5e5e5" }}>
                        {cohort?.access_code}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(cohort?.access_code||""); notify("Copied!"); }} style={S.btn("#f5f5f5","#555",{ fontSize:12, border:"1px solid #ddd" })}>Copy</button>
                      <button onClick={() => cohort && emailAccessCode(cohort)} style={S.btn("#eff6ff","#1d4ed8",{ fontSize:12, border:"1px solid #bfdbfe" })}>✉ Email Code</button>
                      {!dbLoading && cohortParts.length > 0 && (
                        <button onClick={downloadDashboardCsv} style={S.btn("#f0fdf4","#16a34a",{ fontSize:12, border:"1px solid #bbf7d0" })}>⬇ CSV</button>
                      )}
                    </div>
                  </div>

                  {dbLoading && (
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"2rem 0", color:"#888", fontSize:13 }}>
                      <div style={{ width:20, height:20, border:"3px solid #e5e7eb", borderTopColor:CCM_RED, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                      Loading dashboard data…
                    </div>
                  )}

                  {!dbLoading && cohortParts.length === 0 && (
                    <div style={{ textAlign:"center", padding:"3rem", color:"#bbb", fontSize:14 }}>No participants in this cohort yet.</div>
                  )}

                  {!dbLoading && cohortParts.length > 0 && (
                    <>
                      {/* ── Section 1: Participant completion heatmap ── */}
                      <div style={{ ...S.card, marginBottom:"1.5rem", padding:0, overflow:"hidden" }}>
                        <div style={{ padding:"14px 16px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Module Completion</h3>
                          <span style={{ fontSize:12, color:"#888" }}>
                            {dbModules.length === 0 ? "No modules configured" : `${dbResults.length} submission${dbResults.length!==1?"s":""} across ${dbModules.length} module${dbModules.length!==1?"s":""}`}
                          </span>
                        </div>
                        <div style={{ overflowX:"auto" }}>
                          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                            <thead>
                              <tr>
                                <th style={{ ...thS, textAlign:"left", paddingLeft:12, minWidth:160 }}>Participant</th>
                                <th style={{ ...thS, textAlign:"center", minWidth:80 }}>Level</th>
                                <th style={{ ...thS, textAlign:"center", minWidth:56 }}>Done</th>
                                {dbModules.map(m => (
                                  <th key={m.id} style={{ ...thS, textAlign:"center", minWidth:72, maxWidth:100 }}>
                                    <div style={{ maxWidth:100, overflow:"hidden", textOverflow:"ellipsis" }} title={m.title}>{m.title}</div>
                                  </th>
                                ))}
                                <th style={{ ...thS, textAlign:"center", minWidth:72 }}>Total</th>
                                <th style={{ ...thS, textAlign:"center", minWidth:80 }}>Tab Switches</th>
                                <th style={{ ...thS, textAlign:"right", paddingRight:8, minWidth:190 }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cohortParts.map(p => renderRow(p, true))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* ── Section 2: Level heatmap ── */}
                      <div style={{ ...S.card, marginBottom:"1.5rem", padding:0, overflow:"hidden" }}>
                        <div style={{ padding:"14px 16px", borderBottom:"1px solid #f0f0f0" }}>
                          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>By Level</h3>
                        </div>
                        <div style={{ overflowX:"auto" }}>
                          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                            <thead>
                              <tr>
                                <th style={{ ...thS, textAlign:"left", paddingLeft:12, minWidth:160 }}>Participant</th>
                                <th style={{ ...thS, textAlign:"center", minWidth:56 }}>Done</th>
                                {dbModules.map(m => (
                                  <th key={m.id} style={{ ...thS, textAlign:"center", minWidth:72 }}>
                                    <div style={{ maxWidth:100, overflow:"hidden", textOverflow:"ellipsis" }} title={m.title}>{m.title}</div>
                                  </th>
                                ))}
                                <th style={{ ...thS, textAlign:"center", minWidth:72 }}>Total</th>
                                <th style={{ ...thS, textAlign:"center", minWidth:80 }}>Tab Switches</th>
                              </tr>
                            </thead>
                            <tbody>
                              {levelNames.map(lvlName => {
                                const lvlColor = lColorMap[lvlName] || "#555";
                                const grp = cohortParts.filter(p => (allLevels.find(l => l.id === p.level_id)?.name || "Unknown") === lvlName);
                                return (
                                  <React.Fragment key={lvlName}>
                                    <tr>
                                      <td colSpan={3 + dbModules.length} style={{ padding:"5px 12px", background:`${lvlColor}18`, borderBottom:"1px solid #e5e5e5", borderTop:"1px solid #e5e5e5" }}>
                                        <span style={{ fontSize:12, fontWeight:700, color:lvlColor }}>{lvlName}</span>
                                        <span style={{ fontSize:11, color:"#888", marginLeft:8 }}>{grp.length} participant{grp.length!==1?"s":""}</span>
                                      </td>
                                    </tr>
                                    {grp.map(p => renderRow(p, false))}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* ── Section 3: Integrity monitor ── */}
                      <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
                        <div style={{ padding:"14px 16px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", gap:12 }}>
                          <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Integrity Monitor</h3>
                          <span style={{ fontSize:12, color:"#888" }}>Flags participants with more than 3 tab switches during assessment</span>
                        </div>
                        <div style={{ padding:"0 16px" }}>
                          {cohortParts.map(p => {
                            const ts      = tabSwitches(p.id);
                            const tot     = totalMins(p.id);
                            const flagged = ts > 3;
                            const pResArr = Object.values(rMap[p.id]||{});
                            const lastAt  = pResArr.length ? pResArr.reduce((l,r) => (r.completed_at||"") > l ? (r.completed_at||"") : l, "") : null;
                            return (
                              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #f5f5f5" }}>
                                <span style={{ fontSize:18, flexShrink:0 }}>{flagged ? "🚩" : "✓"}</span>
                                <div style={{ flex:1, minWidth:120 }}>
                                  <div style={{ fontWeight:600, fontSize:13, color: flagged?"#dc2626":"#111" }}>{p.name}</div>
                                  {p.role && <div style={{ fontSize:11, color:"#888" }}>{p.role}</div>}
                                </div>
                                <div style={{ textAlign:"center", minWidth:90 }}>
                                  <div style={{ fontWeight:700, fontSize:15, color:"#333" }}>{tot ? `${tot} min` : "—"}</div>
                                  <div style={{ fontSize:10, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.04em" }}>Total time</div>
                                </div>
                                <div style={{ textAlign:"center", minWidth:80 }}>
                                  <div style={{ fontWeight:700, fontSize:20, color: flagged?"#dc2626":ts>0?"#555":"#ccc" }}>{ts>0?ts:"—"}</div>
                                  <div style={{ fontSize:10, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.04em" }}>Tab switches</div>
                                </div>
                                {lastAt && (
                                  <div style={{ fontSize:11, color:"#aaa", minWidth:90, textAlign:"right" }}>
                                    Last: {new Date(lastAt).toLocaleDateString()}
                                  </div>
                                )}
                                {flagged && (
                                  <span style={{ fontSize:12, fontWeight:700, color:"#dc2626", background:"#fef2f2", border:"1px solid #fca5a5", padding:"3px 10px", borderRadius:6 }}>Flagged</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}
        {adminTab==="assessor-guide" && (
          <div style={{ maxWidth:900, margin:"0 auto", padding:"1.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
              <div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Assessor Guide</h2>
                <p style={{ margin:"4px 0 0", fontSize:13, color:"#888" }}>Read-only guide for assessors during the assessment centre</p>
              </div>
              {agData && (
                <button onClick={() => openPdfWindow(agData)} style={S.btn("#111","#fff",{ fontSize:13 })}>Download PDF</button>
              )}
            </div>

            <div style={{ marginBottom:"1.5rem" }}>
              <label style={S.label}>Case Study</label>
              <select style={{ ...S.input, width:320 }} value={agCsId} onChange={e => { setAgCsId(e.target.value); loadAgData(e.target.value); }}>
                <option value="">Select case study…</option>
                {caseStudies.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
              </select>
            </div>

            {agLoading && (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"2rem 0", color:"#888", fontSize:13 }}>
                <div style={{ width:22, height:22, border:"3px solid #e5e7eb", borderTopColor:CCM_RED, borderRadius:"50%", animation:"spin 0.8s linear infinite", flexShrink:0 }} />
                Loading assessor guide…
              </div>
            )}
            {!agCsId && !agLoading && (
              <div style={{ textAlign:"center", marginTop:"4rem", color:"#bbb", fontSize:14 }}>Select a case study to view its assessor guide.</div>
            )}

            {agData && !agLoading && (() => {
              const { caseStudy, assignedComps, guides, modules, questions } = agData;
              const tierBadge = (tier) => ({
                fontSize:10, padding:"2px 7px", borderRadius:20, fontWeight:600,
                background: tier==="advanced" ? "#eff6ff" : "#f0fdf4",
                color:      tier==="advanced" ? "#0369a1" : "#16a34a",
                border:     `1px solid ${tier==="advanced" ? "#bfdbfe" : "#bbf7d0"}`,
              });
              const scoreColors = [
                { bg:"#f5f5f5", color:"#666",    border:"#e0e0e0" },
                { bg:"#fef2f2", color:"#dc2626", border:"#fca5a5" },
                { bg:"#fff7ed", color:"#ea580c", border:"#fdba74" },
                { bg:"#fefce8", color:"#ca8a04", border:"#fde047" },
                { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
                { bg:"#eff6ff", color:"#0369a1", border:"#bfdbfe" },
              ];
              return (
                <div id="ag-printable">
                  {/* Case study header */}
                  <div style={{ ...S.card, marginBottom:"1.5rem", borderLeft:`4px solid ${CCM_RED}` }}>
                    <h2 style={{ margin:"0 0 6px", fontSize:20, color:"#111" }}>{caseStudy?.name}</h2>
                    {caseStudy?.industry && <p style={{ margin:"0 0 4px", fontSize:13, color:"#555" }}>{caseStudy.industry}</p>}
                    {caseStudy?.description && <p style={{ margin:0, fontSize:13, color:"#777", lineHeight:1.55 }}>{caseStudy.description}</p>}
                    <div style={{ marginTop:10, fontSize:12, color:"#888" }}>
                      {assignedComps.length} competenc{assignedComps.length !== 1 ? "ies" : "y"} · {modules.length} module{modules.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {assignedComps.length === 0 && (
                    <div style={{ ...S.card, textAlign:"center", color:"#aaa", padding:"2rem" }}>
                      No competencies assigned. Go to the Case Studies tab to assign competencies to this case study.
                    </div>
                  )}

                  {assignedComps.map((assignment, idx) => {
                    const compId     = assignment.competency_id;
                    const comp       = assignment.competency;
                    const guide      = guides[compId];
                    const compQs     = (questions || []).filter(q => q.competency_id === compId);

                    return (
                      <div key={compId} style={{ ...S.card, marginBottom:"1.5rem" }}>
                        {/* Competency title bar */}
                        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, paddingBottom:12, borderBottom:"1px solid #f0f0f0" }}>
                          <div style={{ width:34, height:34, borderRadius:"50%", background:CCM_RED, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:15, flexShrink:0 }}>
                            {idx + 1}
                          </div>
                          <div>
                            <h3 style={{ margin:0, fontSize:17, fontWeight:700 }}>{comp?.name || compId}</h3>
                            {comp?.category && <span style={{ fontSize:11, color:"#888" }}>{comp.category}</span>}
                          </div>
                          {!guide && (
                            <span style={{ marginLeft:"auto", fontSize:11, color:"#f59e0b", background:"#fffbeb", border:"1px solid #fde68a", padding:"3px 10px", borderRadius:20 }}>⚠ No guide generated yet</span>
                          )}
                        </div>

                        {!guide && (
                          <div style={{ padding:"1rem", background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, fontSize:13, color:"#92400e", marginBottom: compQs.length ? 16 : 0 }}>
                            No assessor guide for this competency yet. Go to the Questions &amp; Guide tab to generate one.
                          </div>
                        )}

                        {guide && (
                          <>
                            {guide.definition && (
                              <div style={{ marginBottom:20, padding:"14px 16px", background:"#f8f7ff", border:"1px solid #e9d5ff", borderRadius:8 }}>
                                <div style={{ fontSize:11, fontWeight:700, color:"#6d28d9", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Competency Definition</div>
                                <p style={{ fontSize:13, lineHeight:1.65, margin:0 }}>{guide.definition}</p>
                              </div>
                            )}

                            {Array.isArray(guide.score_descriptors) && guide.score_descriptors.length > 0 && (
                              <div style={{ marginBottom:20 }}>
                                <div style={{ fontSize:13, fontWeight:700, marginBottom:10, color:"#333" }}>Score Descriptors</div>
                                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                  {guide.score_descriptors.map((sd, i) => {
                                    const col = scoreColors[sd.score] || scoreColors[0];
                                    return (
                                      <div key={i} style={{ display:"flex", gap:14, padding:"12px 14px", background:col.bg, border:`1px solid ${col.border}`, borderRadius:8 }}>
                                        <div style={{ flexShrink:0, width:60, textAlign:"center" }}>
                                          <div style={{ fontSize:22, fontWeight:900, color:col.color }}>{sd.score}</div>
                                          <div style={{ fontSize:10, fontWeight:600, color:col.color, lineHeight:1.2 }}>{sd.label}</div>
                                        </div>
                                        <div style={{ flex:1 }}>
                                          <p style={{ fontSize:13, lineHeight:1.6, margin:0, color:"#333" }}>{sd.description}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
                              {[
                                { label:"Strong Behavioral Indicators", key:"strong_indicators", color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
                                { label:"Weak Behavioral Indicators",   key:"weak_indicators",   color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
                              ].map(({ label, key, color, bg, border }) => {
                                const items = Array.isArray(guide[key]) ? guide[key] : (typeof guide[key]==="string" ? guide[key].split("\n").filter(Boolean) : []);
                                return (
                                  <div key={key}>
                                    <div style={{ fontSize:12, fontWeight:700, color, marginBottom:8 }}>{label}</div>
                                    {items.length === 0
                                      ? <p style={{ fontSize:12, color:"#bbb" }}>None set.</p>
                                      : (
                                        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                                          {items.map((item, i) => (
                                            <div key={i} style={{ fontSize:12, padding:"6px 10px", background:bg, border:`1px solid ${border}`, borderRadius:6 }}>● {item}</div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {/* Questions under this competency */}
                        {compQs.length > 0 && (
                          <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:16, marginTop: guide ? 0 : 0 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"#333", marginBottom:10 }}>
                              Questions ({compQs.length})
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                              {compQs.map((q, qi) => (
                                <div key={q.id} style={{ padding:"12px 14px", background:"#f9f9f9", border:"1px solid #eee", borderRadius:8 }}>
                                  <div style={{ fontSize:11, fontWeight:700, color:"#888", marginBottom:8 }}>Q{qi + 1}</div>
                                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                    {q.text_advanced && (
                                      <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                                        <span style={{ ...tierBadge("advanced"), flexShrink:0, marginTop:1 }}>advanced</span>
                                        <span style={{ fontSize:13, lineHeight:1.5, color:"#222" }}>{q.text_advanced}</span>
                                      </div>
                                    )}
                                    {q.text_standard && (
                                      <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                                        <span style={{ ...tierBadge("standard"), flexShrink:0, marginTop:1 }}>standard</span>
                                        <span style={{ fontSize:13, lineHeight:1.5, color:"#555" }}>{q.text_standard}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
        {adminTab==="live-panel" && <Placeholder title="Live Panel" description="Real-time question bank for use during live interviews." />}

        {adminTab==="reports" && (() => {
          const SCORE_LABELS = {1:"Ineffective",2:"Inconsistent",3:"Effective",4:"Strong",5:"Exceptional"};
          const SCORE_COLORS = {1:"#dc2626",2:"#ea580c",3:"#ca8a04",4:"#16a34a",5:"#0369a1"};

          const participantMap = Object.fromEntries(participants.map(p => [p.id, p]));
          const levelMap       = Object.fromEntries(allLevels.map(l => [l.id, l]));
          const cohortMap      = Object.fromEntries(cohorts.map(c => [c.id, c]));
          const moduleMap      = Object.fromEntries(rpModules.map(m => [m.id, m]));

          const resultRows = rpResults.map(r => {
            const part = participantMap[r.participant_id] || null;
            return {
              ...r,
              participant: part,
              level:  part ? levelMap[part.level_id]   || null : null,
              cohort: part ? cohortMap[part.cohort_id] || null : null,
              module: moduleMap[r.module_id] || null,
            };
          }).filter(r => r.participant);

          const selResult = rpSelKey ? resultRows.find(r => r.participant_id + "|" + r.module_id === rpSelKey) : null;

          // Index questions by competency_id for O(1) lookup
          const qsByComp = {};
          rpQuestions.forEach(q => {
            const cId = q.competency_id || "none";
            if (!qsByComp[cId]) qsByComp[cId] = [];
            qsByComp[cId].push(q);
          });
          // Only show competencies whose IDs actually appear in this module's questions.
          // This is the authoritative filter — nothing outside this set should appear.
          const usedCompIds = new Set(rpQuestions.map(q => q.competency_id).filter(Boolean));
          const baseComps = rpCompetencies.length > 0
            ? rpCompetencies.filter(c => usedCompIds.has(c.id))
            : Object.values(rpQuestions.reduce((acc, q) => {
                const cId = q.competency_id || "none";
                if (!acc[cId]) acc[cId] = { id: cId, name: q.competency?.name || "Unknown Competency" };
                return acc;
              }, {}));
          const compList = baseComps.map(c => ({ ...c, questions: qsByComp[c.id] || [] }));

          function p1Avg(cId) {
            const qs = (compList.find(c => c.id === cId) || {}).questions || [];
            const scores = qs.map(q => rpScores.part1[q.id]).filter(s => s && !s.not_attempted && s.score);
            if (!scores.length) return null;
            return scores.reduce((a, s) => a + s.score, 0) / scores.length;
          }
          function p2Score(cId) {
            const s = rpScores.part2[cId];
            return (s && !s.not_attempted && s.score) ? s.score : null;
          }
          function compOverall(cId) {
            const a = p1Avg(cId), b = p2Score(cId);
            if (a !== null && b !== null) return (a + b) / 2;
            return a ?? b ?? null;
          }
          const grandOverall = (() => {
            const vals = compList.map(c => compOverall(c.id)).filter(v => v !== null);
            return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          })();
          const fmt   = v => v === null ? "–" : v.toFixed(1);
          const clamp = n => Math.min(5, Math.max(1, Math.round(n)));

          function scoreInput(part, key) {
            const s  = rpScores[part][key] || {};
            const na = s.not_attempted || false;
            const sc = s.score || null;
            return (
              <div>
                <div style={{ display:"flex", gap:4, alignItems:"center", marginBottom:6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n}
                      onClick={() => setRpScores(prev => ({
                        ...prev, [part]: { ...prev[part], [key]: { ...(prev[part][key]||{}), score:n, not_attempted:false } }
                      }))}
                      disabled={na}
                      style={{
                        width:50, height:34, borderRadius:6,
                        border:`1.5px solid ${sc===n&&!na ? SCORE_COLORS[n] : "#ddd"}`,
                        background: sc===n&&!na ? SCORE_COLORS[n] : "#fff",
                        color: sc===n&&!na ? "#fff" : "#555",
                        cursor: na ? "default" : "pointer",
                        fontSize:12, fontWeight:700, opacity: na ? 0.35 : 1,
                      }}
                      title={SCORE_LABELS[n]}
                    >{n}</button>
                  ))}
                  {sc && !na && (
                    <span style={{ fontSize:11, color:SCORE_COLORS[sc], fontWeight:700, marginLeft:4 }}>
                      {SCORE_LABELS[sc]}
                    </span>
                  )}
                </div>
                <label style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#888", cursor:"pointer" }}>
                  <input type="checkbox" checked={na}
                    onChange={e => setRpScores(prev => ({
                      ...prev, [part]: { ...prev[part], [key]: { ...(prev[part][key]||{}), not_attempted:e.target.checked, score:null } }
                    }))} />
                  Not Attempted
                </label>
              </div>
            );
          }

          // ── Report helpers ─────────────────────────────────────────────────────
          function doPrint() {
            const src = document.getElementById("rp-print-src");
            if (!src) return;
            const prev = document.getElementById("rp-print-inject");
            if (prev) document.body.removeChild(prev);
            // Clone the live DOM so we can replace form elements with static content
            const srcClone = src.cloneNode(true);
            // Replace textareas: read live .value, substitute a <p> in the clone
            const liveTAs   = Array.from(src.querySelectorAll("textarea"));
            const cloneTAs  = Array.from(srcClone.querySelectorAll("textarea"));
            liveTAs.forEach((liveTA, idx) => {
              const p = document.createElement("p");
              p.style.cssText = "font-size:13px;color:#222;line-height:1.8;margin:0 0 0.75rem;white-space:pre-wrap;";
              p.textContent = liveTA.value.trim() || "—";
              cloneTAs[idx].replaceWith(p);
            });
            // Replace selects: read live selected text, substitute a <span>
            const liveSels  = Array.from(src.querySelectorAll("select"));
            const cloneSels = Array.from(srcClone.querySelectorAll("select"));
            liveSels.forEach((liveSel, idx) => {
              const span = document.createElement("span");
              span.style.cssText = "font-size:14px;font-weight:700;color:#e8251a;";
              span.textContent = liveSel.options[liveSel.selectedIndex]?.text || liveSel.value || "—";
              cloneSels[idx].replaceWith(span);
            });
            const inj = document.createElement("div");
            inj.id = "rp-print-inject";
            while (srcClone.firstChild) inj.appendChild(srcClone.firstChild);
            document.body.appendChild(inj);
            document.body.classList.add("rp-printing");
            window.print();
            document.body.removeChild(inj);
            document.body.classList.remove("rp-printing");
          }

          async function doGenerateReport(type) {
            if (!selResult) return;
            setRpReportLoading(true);
            setRpReportType(type);
            setRpReport(null);
            try {
              const base = {
                participant: selResult.participant,
                level:       selResult.level,
                cohort:      selResult.cohort,
                module:      selResult.module,
                questions:   rpQuestions,
                compList,
                scores:      rpScores,
                answers:     selResult.answers,
                part2Answers: selResult.part2_answers,
                completedAt: selResult.completed_at,
                assessorName: "CCM Consultancy",
              };
              let content;
              if (type === "individual") {
                content = await ai.generateIndividualReport(base);
              } else if (type === "client") {
                content = await ai.generateClientReport(base);
              } else if (type === "cohort") {
                const SCORE_LBL = {1:"Ineffective",2:"Inconsistent",3:"Effective",4:"Strong",5:"Exceptional"};
                const scoreLbl = v => v===null ? "–" : (SCORE_LBL[Math.min(5,Math.max(1,Math.round(v)))]||"–");
                const cohortRows = resultRows.filter(r =>
                  r.module_id === selResult.module_id &&
                  r.participant?.cohort_id === selResult.participant?.cohort_id
                );
                const cohortData = cohortRows.map(r => {
                  const sc = r.participant_id === selResult.participant_id ? rpScores : (r.scores || {part1:{},part2:{}});
                  const cs = compList.map(comp => {
                    const qs2 = rpQuestions.filter(q => q.competency_id === comp.id);
                    const p1s = qs2.map(q => sc.part1?.[q.id]).filter(s => s && !s.not_attempted && s.score);
                    const p1a = p1s.length ? p1s.reduce((a,s)=>a+s.score,0)/p1s.length : null;
                    const p2e = sc.part2?.[comp.id];
                    const p2v = p2e && !p2e.not_attempted && p2e.score ? p2e.score : null;
                    const ov  = p1a!==null && p2v!==null ? (p1a+p2v)/2 : (p1a??p2v??null);
                    return { name: comp.name, overall: ov };
                  });
                  const vals = cs.map(c=>c.overall).filter(v=>v!==null);
                  return {
                    name:  r.participant?.name || "Unknown",
                    role:  r.participant?.role || "",
                    level: r.level?.name || "",
                    overall: vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null,
                    compScores: cs,
                  };
                });
                content = await ai.generateCohortReport({
                  cohortName:  selResult.cohort?.name || "Cohort",
                  moduleName:  selResult.module?.name || selResult.module?.title || "Module",
                  cohortData,
                  compList,
                  assessorName: "CCM Consultancy",
                });
                content._cohortData   = cohortData;
                content._compList     = compList.map(c=>c.name);
                content._scoreLbl     = scoreLbl;
              }
              setRpReport({ type, content, selResult: { ...selResult }, compList, rpScores, rpQuestions, completedAt: selResult.completed_at });
            } catch(e) { notify("Report generation failed: " + e.message); }
            setRpReportLoading(false);
            setRpReportType(null);
          }

          // ── Report rendering helpers ───────────────────────────────────────────
          const RPT_RED   = "#e8251a";
          const RPT_GRAY  = "#555";
          const SCORE_COLORS_RP = {1:"#dc2626",2:"#ea580c",3:"#ca8a04",4:"#16a34a",5:"#0369a1"};
          const SCORE_LBL_RP = {1:"Ineffective",2:"Inconsistent",3:"Effective",4:"Strong",5:"Exceptional"};
          const fmtRp = v => v===null||v===undefined ? "–" : Number(v).toFixed(1);
          const scoreColor = v => v===null ? "#bbb" : (SCORE_COLORS_RP[Math.min(5,Math.max(1,Math.round(v)))]||"#555");
          const scoreLblRp = v => v===null ? "Not Scored" : (SCORE_LBL_RP[Math.min(5,Math.max(1,Math.round(v)))]||"Not Scored");
          const rpDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) : new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

          const rptH = (title) => (
            <div style={{ marginTop:"2rem", marginBottom:"0.5rem", borderBottom:`2px solid ${RPT_RED}`, paddingBottom:6 }}>
              <span style={{ fontSize:13, fontWeight:700, color:RPT_RED, textTransform:"uppercase", letterSpacing:"0.07em" }}>{title}</span>
            </div>
          );
          const rptPara = (text, style={}) => (
            <p style={{ fontSize:13, color:"#222", lineHeight:1.8, margin:"0 0 0.75rem", ...style }}>{text}</p>
          );
          const rptCoverHeader = (title, participant, level, cohort, module, completedAt, extra) => (
            <div>
              <div style={{ background:RPT_RED, padding:"18px 28px", display:"flex", alignItems:"center", gap:16 }}>
                <div>
                  <div style={{ color:"#fff", fontWeight:900, fontSize:22, letterSpacing:-0.5 }}>CCM</div>
                  <div style={{ color:"#fff", fontSize:9, letterSpacing:2.2, opacity:0.9 }}>CONSULTANCY</div>
                </div>
                <div style={{ flex:1 }} />
                <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11 }}>CONFIDENTIAL</div>
              </div>
              <div style={{ padding:"28px 28px 20px", borderBottom:"1px solid #eee" }}>
                <div style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:6 }}>{title}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 24px", fontSize:13 }}>
                  <div><span style={{ color:"#888" }}>Participant: </span><strong>{participant?.name}</strong></div>
                  <div><span style={{ color:"#888" }}>Level: </span><strong>{level?.name || "–"}</strong></div>
                  <div><span style={{ color:"#888" }}>Role: </span><strong>{participant?.role || "Not specified"}</strong></div>
                  <div><span style={{ color:"#888" }}>Cohort: </span><strong>{cohort?.name || "–"}</strong></div>
                  <div><span style={{ color:"#888" }}>Module: </span><strong>{module?.name || module?.title || "–"}</strong></div>
                  <div><span style={{ color:"#888" }}>Date: </span><strong>{rpDate(completedAt)}</strong></div>
                  {extra}
                </div>
              </div>
            </div>
          );

          function renderIndividualReport(content, sr) {
            const cl = rpReport?.compList || compList;
            const sc = rpReport?.rpScores || rpScores;
            const qs = rpReport?.rpQuestions || rpQuestions;
            const compScoreMap = {};
            cl.forEach(comp => {
              const p1s = qs.filter(q=>q.competency_id===comp.id).map(q=>sc.part1?.[q.id]).filter(s=>s&&!s.not_attempted&&s.score);
              const p1a = p1s.length ? p1s.reduce((a,s)=>a+s.score,0)/p1s.length : null;
              const p2e = sc.part2?.[comp.id];
              const p2v = p2e&&!p2e.not_attempted&&p2e.score ? p2e.score : null;
              compScoreMap[comp.name] = p1a!==null&&p2v!==null ? (p1a+p2v)/2 : (p1a??p2v??null);
            });
            return (
              <div style={{ padding:"0 0 40px" }}>
                {rptCoverHeader("Individual Assessment Report", sr.participant, sr.level, sr.cohort, sr.module, sr.completed_at)}
                <div style={{ padding:"0 28px" }}>
                  {rptH("1. Executive Summary")}{rptPara(content.executiveSummary)}
                  {rptH("2. Assessment Methodology")}{rptPara(content.assessmentMethodology)}
                  {rptH("3. How to Use This Report")}{rptPara(content.howToUse)}
                  {rptH("4. Competencies Measured and Scores")}
                  {(content.competencies||[]).map((comp,i) => {
                    const sc2 = compScoreMap[comp.name];
                    return (
                      <div key={i} className="rp-avoid-break" style={{ marginBottom:"1.25rem", padding:"16px", background:"#fafafa", borderRadius:8, border:"1px solid #eee" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <span style={{ fontWeight:700, fontSize:14 }}>{comp.name}</span>
                          <span style={{ fontWeight:700, fontSize:14, color: scoreColor(sc2) }}>{fmtRp(sc2)} / 5 &nbsp;<span style={{ fontSize:11, fontWeight:400 }}>{scoreLblRp(sc2)}</span></span>
                        </div>
                        {comp.measures && <p style={{ fontSize:12, color:"#666", marginBottom:6, lineHeight:1.7, fontStyle:"italic" }}>{comp.measures}</p>}
                        <p style={{ fontSize:12, color:"#333", marginBottom:6, lineHeight:1.7 }}><strong>What the candidate demonstrated: </strong>{comp.demonstrated || comp.evidence}</p>
                        <p style={{ fontSize:12, color:"#333", marginBottom:4, lineHeight:1.7 }}><strong style={{ color:"#16a34a" }}>Strength: </strong>{comp.strength}</p>
                        <p style={{ fontSize:12, color:"#333", lineHeight:1.7 }}><strong style={{ color:"#9a3412" }}>Development opportunity: </strong>{comp.developmentOpportunity}</p>
                      </div>
                    );
                  })}
                  {rptH("5. Overall Strengths and Areas for Development")}
                  {rptPara(content.overallStrengths)}
                  {rptPara(content.areasForDevelopment)}
                  <div className="rp-page-break" />
                  {rptH("6. Individual Development Plan — 70-20-10 Framework")}
                  <div className="rp-avoid-break" style={{ marginBottom:"1.25rem" }}>
                    {[["70% — On the Job", content.devPlan?.on70],["20% — Learning from Others", content.devPlan?.social20],["10% — Formal Learning", content.devPlan?.formal10]].map(([label, items]) => (
                      <div key={label} style={{ marginBottom:10 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:RPT_GRAY, marginBottom:4 }}>{label}</div>
                        <ul style={{ margin:0, paddingLeft:18 }}>
                          {(items||[]).map((item,j) => <li key={j} style={{ fontSize:12, color:"#444", lineHeight:1.7, marginBottom:2 }}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {rptH("7. Result of Assessment")}
                  <div className="rp-avoid-break" style={{ background:"#f8f9fb", border:`2px solid ${RPT_RED}`, borderRadius:8, padding:"16px 20px", marginBottom:"1rem" }}>
                    <div style={{ fontSize:16, fontWeight:700, color:RPT_RED, marginBottom:8 }}>{content.recommendation}</div>
                    {rptPara(content.recommendationNarrative, { margin:0 })}
                  </div>
                </div>
              </div>
            );
          }

          function renderClientReport(content, sr) {
            const cl = rpReport?.compList || compList;
            const sc = rpReport?.rpScores || rpScores;
            const qs = rpReport?.rpQuestions || rpQuestions;
            const compScoreMap = {};
            cl.forEach(comp => {
              const p1s = qs.filter(q=>q.competency_id===comp.id).map(q=>sc.part1?.[q.id]).filter(s=>s&&!s.not_attempted&&s.score);
              const p1a = p1s.length ? p1s.reduce((a,s)=>a+s.score,0)/p1s.length : null;
              const p2e = sc.part2?.[comp.id];
              const p2v = p2e&&!p2e.not_attempted&&p2e.score ? p2e.score : null;
              compScoreMap[comp.name] = p1a!==null&&p2v!==null ? (p1a+p2v)/2 : (p1a??p2v??null);
            });
            return (
              <div style={{ padding:"0 0 40px" }}>
                {rptCoverHeader("Client Assessment Report", sr.participant, sr.level, sr.cohort, sr.module, sr.completed_at)}
                <div style={{ padding:"0 28px" }}>
                  {rptH("1. Executive Summary")}{rptPara(content.executiveSummary)}
                  {rptH("2. Assessor Declaration")}{rptPara(content.assessorDeclaration)}
                  {rptH("3. Assessment Methodology")}
                  {rptPara("This assessment was conducted using CCM Consultancy's Assessment Centre methodology, combining structured behavioural interviews and case study analysis. Competencies were assessed against standardised criteria across two parts: Part 1 (behavioural questions) and Part 2 (case study tasks).")}
                  {rptH("4. Competencies Measured and Scores")}
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginBottom:"1rem" }}>
                    <thead>
                      <tr style={{ background:"#f5f5f5" }}>
                        {["Competency","Score","Evidence","Development Priority"].map(h=>(
                          <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontWeight:700, color:"#555", borderBottom:"2px solid #ddd" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(content.competencies||[]).map((comp,i)=>{
                        const sc2 = compScoreMap[comp.name];
                        return (
                          <tr key={i} style={{ background:i%2===0?"#fafafa":"#fff" }}>
                            <td style={{ padding:"8px 10px", fontWeight:600, borderBottom:"1px solid #f0f0f0" }}>{comp.name}</td>
                            <td style={{ padding:"8px 10px", fontWeight:700, color:scoreColor(sc2), borderBottom:"1px solid #f0f0f0", whiteSpace:"nowrap" }}>{fmtRp(sc2)} — {scoreLblRp(sc2)}</td>
                            <td style={{ padding:"8px 10px", color:"#333", borderBottom:"1px solid #f0f0f0" }}>{comp.evidence}</td>
                            <td style={{ padding:"8px 10px", color:"#555", borderBottom:"1px solid #f0f0f0" }}>{comp.developmentPriority}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {rptH("5. Overall Strengths and Areas for Development")}
                  {rptPara(content.overallStrengths)}{rptPara(content.areasForDevelopment)}
                  {rptH("6. Summary of Individual Development Plan")}
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginBottom:"1rem" }}>
                    <thead>
                      <tr style={{ background:"#f5f5f5" }}>
                        {["Competency","Recommended Action"].map(h=>(
                          <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontWeight:700, color:"#555", borderBottom:"2px solid #ddd" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(content.devSummary||[]).map((row,i)=>(
                        <tr key={i} style={{ background:i%2===0?"#fafafa":"#fff" }}>
                          <td style={{ padding:"8px 10px", fontWeight:600, borderBottom:"1px solid #f0f0f0" }}>{row.competency}</td>
                          <td style={{ padding:"8px 10px", color:"#333", borderBottom:"1px solid #f0f0f0" }}>{row.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rptH("7. Summary and Recommendation")}
                  <div className="rp-avoid-break" style={{ background:"#f8f9fb", border:`2px solid ${RPT_RED}`, borderRadius:8, padding:"16px 20px" }}>
                    <div style={{ fontSize:16, fontWeight:700, color:RPT_RED, marginBottom:8 }}>{content.recommendation}</div>
                    {rptPara(content.recommendationNarrative, { margin:0 })}
                  </div>
                </div>
              </div>
            );
          }

          function renderCohortReport(content, sr) {
            const cd    = content._cohortData || [];
            const names = content._compList   || [];
            const sLbl  = content._scoreLbl   || (v => v===null ? "–" : Number(v).toFixed(1));
            return (
              <div style={{ padding:"0 0 40px" }}>
                <div>
                  <div style={{ background:RPT_RED, padding:"18px 28px", display:"flex", alignItems:"center", gap:16 }}>
                    <div>
                      <div style={{ color:"#fff", fontWeight:900, fontSize:22, letterSpacing:-0.5 }}>CCM</div>
                      <div style={{ color:"#fff", fontSize:9, letterSpacing:2.2, opacity:0.9 }}>CONSULTANCY</div>
                    </div>
                    <div style={{ flex:1 }} />
                    <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11 }}>CONFIDENTIAL</div>
                  </div>
                  <div style={{ padding:"28px 28px 20px", borderBottom:"1px solid #eee" }}>
                    <div style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:6 }}>Cohort Assessment Report</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 24px", fontSize:13 }}>
                      <div><span style={{ color:"#888" }}>Cohort: </span><strong>{sr.cohort?.name || "–"}</strong></div>
                      <div><span style={{ color:"#888" }}>Module: </span><strong>{sr.module?.name || sr.module?.title || "–"}</strong></div>
                      <div><span style={{ color:"#888" }}>Participants: </span><strong>{cd.length}</strong></div>
                      <div><span style={{ color:"#888" }}>Date: </span><strong>{rpDate(sr.completed_at)}</strong></div>
                    </div>
                  </div>
                </div>
                <div style={{ padding:"0 28px" }}>
                  {rptH("1. Executive Summary")}{rptPara(content.executiveSummary)}
                  {rptH("2. Assessor Declaration")}{rptPara(content.assessorDeclaration)}
                  {rptH("3. Assessment Methodology")}
                  {rptPara("This cohort assessment was conducted using CCM Consultancy's Assessment Centre methodology. All participants completed standardised behavioural interview questions (Part 1) and case study tasks (Part 2), assessed against consistent competency criteria.")}
                  {rptH("4. Competencies Measured and Cohort Scores")}
                  {(content.competencyInsights||[]).map((ci,i) => {
                    const vals = cd.map(p=>(p.compScores.find(c=>c.name===ci.name)||{}).overall).filter(v=>v!==null&&v!==undefined);
                    const avg  = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
                    return (
                      <div key={i} className="rp-avoid-break" style={{ marginBottom:"1rem", padding:"14px 16px", background:"#fafafa", borderRadius:8, border:"1px solid #eee" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                          <span style={{ fontWeight:700, fontSize:13 }}>{ci.name}</span>
                          <span style={{ fontWeight:700, color:scoreColor(avg) }}>{fmtRp(avg)} / 5 — {scoreLblRp(avg)}</span>
                        </div>
                        {rptPara(ci.cohortObs, { margin:0, fontSize:12 })}
                      </div>
                    );
                  })}
                  {rptH("5. Competency Heatmap")}
                  <div style={{ overflowX:"auto", marginBottom:"1rem" }}>
                    <table style={{ borderCollapse:"collapse", fontSize:11, minWidth:400 }}>
                      <thead>
                        <tr>
                          <th style={{ padding:"6px 10px", textAlign:"left", fontWeight:700, borderBottom:"2px solid #ddd", whiteSpace:"nowrap" }}>Participant</th>
                          <th style={{ padding:"6px 8px", textAlign:"left", fontWeight:700, borderBottom:"2px solid #ddd", whiteSpace:"nowrap" }}>Level</th>
                          {names.map(n=><th key={n} style={{ padding:"6px 8px", textAlign:"center", fontWeight:600, borderBottom:"2px solid #ddd", fontSize:10, whiteSpace:"nowrap" }}>{n}</th>)}
                          <th style={{ padding:"6px 8px", textAlign:"center", fontWeight:700, borderBottom:"2px solid #ddd" }}>Overall</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cd.map((p,i)=>(
                          <tr key={i} style={{ background:i%2===0?"#fafafa":"#fff" }}>
                            <td style={{ padding:"6px 10px", fontWeight:600, borderBottom:"1px solid #f0f0f0", whiteSpace:"nowrap" }}>{p.name}</td>
                            <td style={{ padding:"6px 8px", color:"#666", borderBottom:"1px solid #f0f0f0", whiteSpace:"nowrap" }}>{p.level}</td>
                            {names.map(n=>{
                              const v=(p.compScores.find(c=>c.name===n)||{}).overall;
                              return <td key={n} style={{ padding:"6px 8px", textAlign:"center", fontWeight:700, color:scoreColor(v), borderBottom:"1px solid #f0f0f0" }}>{fmtRp(v)}</td>;
                            })}
                            <td style={{ padding:"6px 8px", textAlign:"center", fontWeight:700, color:scoreColor(p.overall), borderBottom:"1px solid #f0f0f0" }}>{fmtRp(p.overall)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rptH("6. Overall Strengths and Development Themes")}
                  {rptPara(content.overallStrengths)}{rptPara(content.developmentThemes)}
                  {rptH(`7. Top Development Priorities — ${sr.cohort?.name || "Cohort"}`)}
                  {(content.devPriorities||[]).map((dp,i)=>(
                    <div key={i} className="rp-avoid-break" style={{ marginBottom:"1rem", padding:"14px 16px", background:"#fafafa", borderRadius:8, border:"1px solid #eee" }}>
                      <div style={{ fontWeight:700, fontSize:13, color:RPT_RED, marginBottom:4 }}>Priority {i+1}: {dp.priority || dp.competency}</div>
                      {dp.rationale && <p style={{ fontSize:12, color:"#555", fontStyle:"italic", margin:"0 0 8px", lineHeight:1.6 }}>{dp.rationale}</p>}
                      {[["70% — On the Job", dp.on70],["20% — Learning from Others", dp.social20],["10% — Formal Learning", dp.formal10]].map(([lbl,txt])=>(
                        <p key={lbl} style={{ fontSize:12, color:"#333", margin:"0 0 4px" }}><strong>{lbl}: </strong>{txt}</p>
                      ))}
                    </div>
                  ))}
                  <div className="rp-page-break" />
                  {rptH("8. Individual Participant Summaries")}
                  {(content.participantSummaries||[]).map((ps,i)=>(
                    <div key={i} className="rp-avoid-break" style={{ marginBottom:"1.25rem", padding:"14px 16px", background:"#fafafa", borderRadius:8, border:"1px solid #eee" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontWeight:700 }}>{ps.name}</span>
                        {ps.recommendation && <span style={{ fontSize:11, fontWeight:600, color:RPT_RED, background:"#fff7f7", border:"1px solid #fecaca", borderRadius:6, padding:"2px 8px" }}>{ps.recommendation}</span>}
                      </div>
                      {rptPara(ps.summary, { margin:0, fontSize:12 })}
                    </div>
                  ))}
                  {rptH("9. Summary of Recommendations")}
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ background:"#f5f5f5" }}>
                        {["Name","Level","Overall Score","Recommendation"].map(h=>(
                          <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontWeight:700, color:"#555", borderBottom:"2px solid #ddd" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cd.map((p,i)=>{
                        const psum = (content.participantSummaries||[]).find(s=>s.name===p.name);
                        return (
                          <tr key={i} style={{ background:i%2===0?"#fafafa":"#fff" }}>
                            <td style={{ padding:"8px 10px", fontWeight:600, borderBottom:"1px solid #f0f0f0" }}>{p.name}</td>
                            <td style={{ padding:"8px 10px", color:"#555", borderBottom:"1px solid #f0f0f0" }}>{p.level}</td>
                            <td style={{ padding:"8px 10px", fontWeight:700, color:scoreColor(p.overall), borderBottom:"1px solid #f0f0f0" }}>{fmtRp(p.overall)}</td>
                            <td style={{ padding:"8px 10px", color:"#333", borderBottom:"1px solid #f0f0f0" }}>{psum?.recommendation || "–"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          // ── Edit mode helpers ──────────────────────────────────────────────────
          function makeEmptyContent(type) {
            if (type === "individual") return {
              executiveSummary:"", assessmentMethodology:"", howToUse:"",
              competencies: compList.map(c => ({ name:c.name, measures:"", demonstrated:"", strength:"", developmentOpportunity:"" })),
              overallStrengths:"", areasForDevelopment:"",
              devPlan: { on70:[""], social20:[""], formal10:[""] },
              recommendation:"Recommended", recommendationNarrative:"",
            };
            if (type === "client") return {
              executiveSummary:"", assessorDeclaration:"",
              competencies: compList.map(c => ({ name:c.name, evidence:"", developmentPriority:"" })),
              overallStrengths:"", areasForDevelopment:"",
              devSummary: compList.map(c => ({ competency:c.name, action:"" })),
              recommendation:"Recommended", recommendationNarrative:"",
            };
            return {
              executiveSummary:"", assessorDeclaration:"",
              competencyInsights: compList.map(c => ({ name:c.name, cohortObs:"" })),
              overallStrengths:"", developmentThemes:"",
              devPriorities: [{priority:"",rationale:"",on70:"",social20:"",formal10:""},{priority:"",rationale:"",on70:"",social20:"",formal10:""},{priority:"",rationale:"",on70:"",social20:"",formal10:""}],
              participantSummaries: [],
              _cohortData:[], _compList:compList.map(c=>c.name), _scoreLbl: v=>v===null?"–":Number(v).toFixed(1),
            };
          }
          function closeReport() { setRpReport(null); setRpEditMode(false); setRpEditContent(null); setRpOrigContent(null); }
          function enterEditMode() {
            const copy = JSON.parse(JSON.stringify(rpReport.content));
            setRpEditContent(copy);
            if (!rpOrigContent) setRpOrigContent(JSON.parse(JSON.stringify(rpReport.content)));
            setRpEditMode(true);
          }
          function saveEdits() { setRpReport(prev => ({ ...prev, content: JSON.parse(JSON.stringify(rpEditContent)) })); setRpEditMode(false); }
          function resetToOriginal() { setRpEditContent(JSON.parse(JSON.stringify(rpOrigContent))); }
          function openManualReport(type) {
            if (!selResult) return;
            const empty = makeEmptyContent(type);
            setRpReport({ type, content: empty, selResult: { ...selResult }, compList, rpScores, rpQuestions, completedAt: selResult.completed_at });
            setRpOrigContent(null);
            setRpEditContent(JSON.parse(JSON.stringify(empty)));
            setRpEditMode(true);
          }

          // ── Edit-mode render functions ─────────────────────────────────────────
          const TA_STYLE = { width:"100%", padding:"8px 10px", fontSize:13, border:"1px solid #c0c0c0", borderRadius:6, resize:"vertical", lineHeight:1.6, fontFamily:"inherit", marginBottom:8, boxSizing:"border-box" };
          const LBL = (text, color="#555") => <label style={{ fontSize:11, fontWeight:700, color, display:"block", marginBottom:4 }}>{text}</label>;
          const REC_OPTS = ["Recommended","Recommended with Development","Deferred","Not Recommended"];
          function ta(val, onChange, rows=3) {
            return <textarea value={val||""} onChange={e=>onChange(e.target.value)} rows={rows} style={TA_STYLE} />;
          }

          function renderIndividualEdit() {
            const ec = rpEditContent || {};
            const upd = (f,v) => setRpEditContent(p=>({...p,[f]:v}));
            const updComp = (i,f,v) => setRpEditContent(p=>{ const cs=[...(p.competencies||[])]; cs[i]={...cs[i],[f]:v}; return {...p,competencies:cs}; });
            const updPlanArr = (f,v) => setRpEditContent(p=>({ ...p, devPlan:{ ...(p.devPlan||{}), [f]:v.split("\n").map(s=>s.trim()).filter(Boolean) } }));
            const sr = rpReport?.selResult;
            const dp = ec.devPlan || {};
            return (
              <div style={{ padding:"0 0 40px" }}>
                {rptCoverHeader("Individual Assessment Report", sr?.participant, sr?.level, sr?.cohort, sr?.module, sr?.completed_at)}
                <div style={{ padding:"0 28px" }}>
                  {rptH("1. Executive Summary")}{ta(ec.executiveSummary, v=>upd("executiveSummary",v), 4)}
                  {rptH("2. Assessment Methodology")}{ta(ec.assessmentMethodology, v=>upd("assessmentMethodology",v), 3)}
                  {rptH("3. How to Use This Report")}{ta(ec.howToUse, v=>upd("howToUse",v), 2)}
                  {rptH("4. Competencies Measured and Scores")}
                  {(ec.competencies||[]).map((comp,i) => (
                    <div key={i} style={{ marginBottom:"1.5rem", padding:"16px", background:"#fafafa", borderRadius:8, border:"1px solid #ddd" }}>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>{comp.name}</div>
                      {LBL("What this competency measures (1 sentence)")}{ta(comp.measures, v=>updComp(i,"measures",v), 1)}
                      {LBL("What the candidate demonstrated (2 sentences)")}{ta(comp.demonstrated||comp.evidence, v=>updComp(i,"demonstrated",v), 3)}
                      {LBL("Strength","#16a34a")}{ta(comp.strength, v=>updComp(i,"strength",v), 2)}
                      {LBL("Development Opportunity","#9a3412")}{ta(comp.developmentOpportunity, v=>updComp(i,"developmentOpportunity",v), 2)}
                    </div>
                  ))}
                  {rptH("5. Overall Strengths and Areas for Development")}
                  {LBL("Overall Strengths")}{ta(ec.overallStrengths, v=>upd("overallStrengths",v), 3)}
                  {LBL("Areas for Development")}{ta(ec.areasForDevelopment, v=>upd("areasForDevelopment",v), 3)}
                  {rptH("6. Individual Development Plan — 70-20-10 Framework")}
                  {LBL("70% — On the Job (one action per line)")}{ta((dp.on70||[]).join("\n"), v=>updPlanArr("on70",v), 4)}
                  {LBL("20% — Learning from Others (one per line)")}{ta((dp.social20||[]).join("\n"), v=>updPlanArr("social20",v), 3)}
                  {LBL("10% — Formal Learning (one per line)")}{ta((dp.formal10||[]).join("\n"), v=>updPlanArr("formal10",v), 3)}
                  {rptH("7. Result of Assessment")}
                  {LBL("Recommendation")}
                  <select value={ec.recommendation||"Recommended"} onChange={e=>upd("recommendation",e.target.value)}
                    style={{ width:"100%", padding:"8px 10px", fontSize:13, border:"1px solid #c0c0c0", borderRadius:6, marginBottom:8 }}>
                    {REC_OPTS.map(o=><option key={o}>{o}</option>)}
                  </select>
                  {LBL("Recommendation Narrative")}{ta(ec.recommendationNarrative, v=>upd("recommendationNarrative",v), 3)}
                </div>
              </div>
            );
          }

          function renderClientEdit() {
            const ec = rpEditContent || {};
            const upd = (f,v) => setRpEditContent(p=>({...p,[f]:v}));
            const updComp = (i,f,v) => setRpEditContent(p=>{ const cs=[...(p.competencies||[])]; cs[i]={...cs[i],[f]:v}; return {...p,competencies:cs}; });
            const updDev = (i,f,v) => setRpEditContent(p=>{ const ds=[...(p.devSummary||[])]; ds[i]={...ds[i],[f]:v}; return {...p,devSummary:ds}; });
            const sr = rpReport?.selResult;
            return (
              <div style={{ padding:"0 0 40px" }}>
                {rptCoverHeader("Client Assessment Report", sr?.participant, sr?.level, sr?.cohort, sr?.module, sr?.completed_at)}
                <div style={{ padding:"0 28px" }}>
                  {rptH("1. Executive Summary")}{ta(ec.executiveSummary, v=>upd("executiveSummary",v), 4)}
                  {rptH("2. Assessor Declaration")}{ta(ec.assessorDeclaration, v=>upd("assessorDeclaration",v), 3)}
                  {rptH("4. Competencies Measured and Scores")}
                  {(ec.competencies||[]).map((comp,i) => (
                    <div key={i} style={{ marginBottom:"1.25rem", padding:"14px", background:"#fafafa", borderRadius:8, border:"1px solid #ddd" }}>
                      <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>{comp.name}</div>
                      {LBL("Evidence (one sentence)")}{ta(comp.evidence, v=>updComp(i,"evidence",v), 2)}
                      {LBL("Development Priority (one line)")}{ta(comp.developmentPriority, v=>updComp(i,"developmentPriority",v), 1)}
                    </div>
                  ))}
                  {rptH("5. Overall Strengths and Areas for Development")}
                  {LBL("Overall Strengths")}{ta(ec.overallStrengths, v=>upd("overallStrengths",v), 3)}
                  {LBL("Areas for Development")}{ta(ec.areasForDevelopment, v=>upd("areasForDevelopment",v), 3)}
                  {rptH("6. Summary of Individual Development Plan")}
                  {(ec.devSummary||[]).map((row,i) => (
                    <div key={i} style={{ marginBottom:8 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"#555", marginBottom:4 }}>{row.competency}</div>
                      {ta(row.action, v=>updDev(i,"action",v), 1)}
                    </div>
                  ))}
                  {rptH("7. Summary and Recommendation")}
                  {LBL("Recommendation")}
                  <select value={ec.recommendation||"Recommended"} onChange={e=>upd("recommendation",e.target.value)}
                    style={{ width:"100%", padding:"8px 10px", fontSize:13, border:"1px solid #c0c0c0", borderRadius:6, marginBottom:8 }}>
                    {REC_OPTS.map(o=><option key={o}>{o}</option>)}
                  </select>
                  {LBL("Recommendation Narrative")}{ta(ec.recommendationNarrative, v=>upd("recommendationNarrative",v), 3)}
                </div>
              </div>
            );
          }

          function renderCohortEdit() {
            const ec = rpEditContent || {};
            const upd = (f,v) => setRpEditContent(p=>({...p,[f]:v}));
            const updCI = (i,f,v) => setRpEditContent(p=>{ const cs=[...(p.competencyInsights||[])]; cs[i]={...cs[i],[f]:v}; return {...p,competencyInsights:cs}; });
            const updDP = (i,f,v) => setRpEditContent(p=>{ const ds=[...(p.devPriorities||[])]; ds[i]={...ds[i],[f]:v}; return {...p,devPriorities:ds}; });
            const updPS = (i,f,v) => setRpEditContent(p=>{ const ps=[...(p.participantSummaries||[])]; ps[i]={...ps[i],[f]:v}; return {...p,participantSummaries:ps}; });
            const sr = rpReport?.selResult;
            return (
              <div style={{ padding:"0 0 40px" }}>
                <div>
                  <div style={{ background:RPT_RED, padding:"18px 28px", display:"flex", alignItems:"center", gap:16 }}>
                    <div>
                      <div style={{ color:"#fff", fontWeight:900, fontSize:22, letterSpacing:-0.5 }}>CCM</div>
                      <div style={{ color:"#fff", fontSize:9, letterSpacing:2.2, opacity:0.9 }}>CONSULTANCY</div>
                    </div>
                    <div style={{ flex:1 }} />
                    <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11 }}>CONFIDENTIAL</div>
                  </div>
                  <div style={{ padding:"28px 28px 20px", borderBottom:"1px solid #eee" }}>
                    <div style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:6 }}>Cohort Assessment Report</div>
                    <div style={{ fontSize:13, color:"#666" }}>Cohort: {sr?.cohort?.name} | Module: {sr?.module?.name||sr?.module?.title}</div>
                  </div>
                </div>
                <div style={{ padding:"0 28px" }}>
                  {rptH("1. Executive Summary")}{ta(ec.executiveSummary, v=>upd("executiveSummary",v), 4)}
                  {rptH("2. Assessor Declaration")}{ta(ec.assessorDeclaration, v=>upd("assessorDeclaration",v), 2)}
                  {rptH("4. Competencies Measured and Cohort Scores")}
                  {(ec.competencyInsights||[]).map((ci,i) => (
                    <div key={i} style={{ marginBottom:"1rem", padding:"14px", background:"#fafafa", borderRadius:8, border:"1px solid #ddd" }}>
                      <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>{ci.name}</div>
                      {ta(ci.cohortObs, v=>updCI(i,"cohortObs",v), 3)}
                    </div>
                  ))}
                  {rptH("6. Overall Strengths and Development Themes")}
                  {LBL("Overall Strengths")}{ta(ec.overallStrengths, v=>upd("overallStrengths",v), 3)}
                  {LBL("Development Themes")}{ta(ec.developmentThemes, v=>upd("developmentThemes",v), 3)}
                  {rptH("7. Top Development Priorities")}
                  {(ec.devPriorities||[]).map((dp,i) => (
                    <div key={i} style={{ marginBottom:"1rem", padding:"14px", background:"#fafafa", borderRadius:8, border:"1px solid #ddd" }}>
                      <div style={{ fontWeight:700, fontSize:13, color:RPT_RED, marginBottom:8 }}>Priority {i+1}</div>
                      {LBL("Priority Theme")}{ta(dp.priority||dp.competency||"", v=>updDP(i,"priority",v), 1)}
                      {LBL("Rationale (1 sentence)")}{ta(dp.rationale||"", v=>updDP(i,"rationale",v), 1)}
                      {LBL("70% — On the Job")}{ta(dp.on70, v=>updDP(i,"on70",v), 1)}
                      {LBL("20% — Learning from Others")}{ta(dp.social20, v=>updDP(i,"social20",v), 1)}
                      {LBL("10% — Formal Learning")}{ta(dp.formal10, v=>updDP(i,"formal10",v), 1)}
                    </div>
                  ))}
                  {rptH("8. Individual Participant Summaries")}
                  {(ec.participantSummaries||[]).map((ps,i) => (
                    <div key={i} style={{ marginBottom:"1.25rem", padding:"14px", background:"#fafafa", borderRadius:8, border:"1px solid #ddd" }}>
                      <div style={{ fontWeight:700, marginBottom:6 }}>{ps.name}</div>
                      {LBL("Recommendation")}
                      <select value={ps.recommendation||"Recommended"} onChange={e=>updPS(i,"recommendation",e.target.value)}
                        style={{ width:"100%", padding:"8px 10px", fontSize:13, border:"1px solid #c0c0c0", borderRadius:6, marginBottom:8 }}>
                        {REC_OPTS.map(o=><option key={o}>{o}</option>)}
                      </select>
                      {LBL("Summary")}{ta(ps.summary, v=>updPS(i,"summary",v), 4)}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div style={{ display:"flex", height:"100%" }}>

              {/* Report modal overlay */}
              {rpReport && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.65)" }} />
                  {/* Toolbar */}
                  <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:1001, background:"#1a1a1a", padding:"10px 20px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <div style={{ color:"#fff", fontWeight:700, fontSize:13 }}>
                      {rpReport.type === "individual" ? "Individual Report" : rpReport.type === "client" ? "Client Report" : "Cohort Report"}
                      {" — "}{rpReport.selResult?.participant?.name || ""}
                      {rpEditMode && <span style={{ marginLeft:8, fontSize:11, color:"#f59e0b", fontWeight:400 }}>✏ Editing</span>}
                    </div>
                    <div style={{ flex:1 }} />
                    <button onClick={doPrint}
                      style={{ background:"#fff", color:"#111", border:"none", borderRadius:6, padding:"6px 14px", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                      🖨 Print / Save as PDF
                    </button>
                    {!rpEditMode ? (
                      <button onClick={enterEditMode}
                        style={{ background:"#374151", color:"#fff", border:"1px solid #6b7280", borderRadius:6, padding:"6px 14px", fontSize:12, cursor:"pointer" }}>
                        ✏ Edit Report
                      </button>
                    ) : (
                      <>
                        <button onClick={saveEdits}
                          style={{ background:"#16a34a", color:"#fff", border:"none", borderRadius:6, padding:"6px 14px", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                          ✓ Save Edits
                        </button>
                        {rpOrigContent && (
                          <button onClick={resetToOriginal}
                            style={{ background:"#374151", color:"#e5e7eb", border:"1px solid #6b7280", borderRadius:6, padding:"6px 14px", fontSize:12, cursor:"pointer" }}>
                            ↺ Reset to AI Draft
                          </button>
                        )}
                        <button onClick={() => setRpEditMode(false)}
                          style={{ background:"transparent", color:"#9ca3af", border:"1px solid #555", borderRadius:6, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>
                          ← View
                        </button>
                      </>
                    )}
                    <button onClick={closeReport}
                      style={{ background:"transparent", color:"#aaa", border:"1px solid #555", borderRadius:6, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>
                      ✕ Close
                    </button>
                  </div>
                  {/* Content */}
                  <div id="rp-print-src" style={{ position:"fixed", top:50, left:"50%", transform:"translateX(-50%)", width:"min(794px, 97vw)", bottom:0, overflowY:"auto", background:"#fff", zIndex:1000 }}>
                    {rpEditMode ? (
                      <>
                        {rpReport.type === "individual" && renderIndividualEdit()}
                        {rpReport.type === "client"     && renderClientEdit()}
                        {rpReport.type === "cohort"     && renderCohortEdit()}
                      </>
                    ) : (
                      <>
                        {rpReport.type === "individual" && renderIndividualReport(rpReport.content, rpReport.selResult)}
                        {rpReport.type === "client"     && renderClientReport(rpReport.content,     rpReport.selResult)}
                        {rpReport.type === "cohort"     && renderCohortReport(rpReport.content,     rpReport.selResult)}
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Left sidebar — submission list */}
              <div style={{ width:300, borderRight:"1px solid #e5e5e5", background:"#fafafa", overflowY:"auto", flexShrink:0 }}>
                <div style={{ padding:"14px 16px", borderBottom:"1px solid #e5e5e5", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>Submissions</span>
                  <span style={{ fontSize:11, color:"#888" }}>{resultRows.length} result{resultRows.length!==1?"s":""}</span>
                </div>
                {rpLoading && <p style={{ padding:"1rem", fontSize:13, color:"#888" }}>Loading…</p>}
                {!rpLoading && resultRows.length === 0 && (
                  <p style={{ padding:"1rem", fontSize:13, color:"#888" }}>No submissions yet.</p>
                )}
                {resultRows.map(r => {
                  const key = r.participant_id + "|" + r.module_id;
                  const sel = rpSelKey === key;
                  const hasScores = r.scores && (Object.keys(r.scores.part1||{}).length || Object.keys(r.scores.part2||{}).length);
                  return (
                    <div key={key} onClick={() => selectRpResult(r)}
                      style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0", cursor:"pointer",
                        background: sel ? "#fff7f7" : "transparent",
                        borderLeft: sel ? `3px solid ${CCM_RED}` : "3px solid transparent" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div style={{ fontWeight:600, fontSize:13 }}>{r.participant?.name || "Unknown"}</div>
                        {hasScores && (
                          <span style={{ fontSize:10, background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", borderRadius:10, padding:"2px 7px", whiteSpace:"nowrap" }}>Scored</span>
                        )}
                      </div>
                      <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{r.module?.title || r.module_id}</div>
                      <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>
                        {[r.level?.name, r.cohort?.name].filter(Boolean).join(" · ")}
                      </div>
                      {r.participant?.role && (
                        <div style={{ fontSize:11, color:"#bbb", marginTop:1 }}>{r.participant.role}</div>
                      )}
                      {r.completed_at && (
                        <div style={{ fontSize:10, color:"#ccc", marginTop:3 }}>
                          {new Date(r.completed_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right — scoring panel */}
              <div style={{ flex:1, overflowY:"auto" }}>
                {!selResult && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", flexDirection:"column", gap:10, color:"#aaa" }}>
                    <div style={{ fontSize:36 }}>📋</div>
                    <div style={{ fontSize:15, color:"#888" }}>Select a submission to begin scoring</div>
                  </div>
                )}

                {selResult && (() => {
                  const p      = selResult.participant;
                  const useAdv = selResult.level?.complexity_tier === "advanced";
                  const p2     = selResult.part2_answers || null;

                  return (
                    <div style={{ padding:"1.5rem 2rem" }}>

                      {/* Header */}
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.5rem" }}>
                        <div>
                          <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:700 }}>{p?.name}</h2>
                          <div style={{ fontSize:13, color:"#666" }}>
                            {[p?.role, selResult.level?.name, selResult.cohort?.name].filter(Boolean).join(" · ")}
                          </div>
                          <div style={{ fontSize:12, color:"#aaa", marginTop:4 }}>
                            Module: <strong style={{ color:"#555" }}>{selResult.module?.title || selResult.module_id}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Part 1 — behavioural questions */}
                      <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:CCM_RED, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"1.25rem" }}>
                          Part 1 — Behavioural Questions
                        </div>
                        {compList.length === 0 && (
                          <p style={{ fontSize:13, color:"#888", margin:0 }}>No questions found for this module.</p>
                        )}
                        {compList.map((comp, ci) => (
                          <div key={comp.id} style={{ marginBottom: ci < compList.length-1 ? "2rem" : 0 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#555", textTransform:"uppercase",
                              letterSpacing:"0.05em", marginBottom:"0.75rem", paddingBottom:8, borderBottom:"1px solid #f0f0f0" }}>
                              {comp.name}
                            </div>
                            {comp.questions.map((q, qi) => {
                              const ans   = (selResult.answers?.questions || {})[q.id] || "";
                              const qText = useAdv ? (q.text_advanced || q.text_standard) : (q.text_standard || q.text_advanced);
                              return (
                                <div key={q.id} style={{
                                  marginBottom: qi < comp.questions.length-1 ? "1.5rem" : 0,
                                  paddingBottom: qi < comp.questions.length-1 ? "1.5rem" : 0,
                                  borderBottom: qi < comp.questions.length-1 ? "1px dashed #f0f0f0" : "none",
                                }}>
                                  <div style={{ fontSize:13, fontWeight:600, color:"#111", marginBottom:8, lineHeight:1.5 }}>
                                    Q{qi+1}. {qText}
                                  </div>
                                  {ans ? (
                                    <div style={{ fontSize:13, color:"#333", background:"#f8f9fb", border:"1px solid #e8e8e8",
                                      borderRadius:8, padding:"12px 14px", lineHeight:1.75, marginBottom:10, whiteSpace:"pre-wrap" }}>
                                      {ans}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize:12, color:"#bbb", fontStyle:"italic", marginBottom:10 }}>No answer recorded</div>
                                  )}
                                  {scoreInput("part1", q.id)}
                                  <div style={{ marginTop:8 }}>
                                    <input style={{ ...S.input, fontSize:12 }}
                                      placeholder="Assessor notes (optional)"
                                      value={(rpScores.part1[q.id]||{}).notes || ""}
                                      onChange={e => setRpScores(prev => ({
                                        ...prev, part1: { ...prev.part1, [q.id]: { ...(prev.part1[q.id]||{}), notes:e.target.value } }
                                      }))}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      {/* Part 2 */}
                      <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:CCM_RED, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"1.25rem" }}>
                          Part 2 — Case Study Tasks
                        </div>
                        {!p2 ? (
                          <p style={{ fontSize:13, color:"#aaa", margin:0 }}>No Part 2 submission recorded.</p>
                        ) : (<>
                          {p2.written_response && (
                            <div style={{ marginBottom:"1.25rem" }}>
                              <div style={S.label}>Written Response</div>
                              <div style={{ fontSize:13, color:"#333", background:"#f8f9fb", border:"1px solid #e8e8e8",
                                borderRadius:8, padding:"12px 14px", lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                                {p2.written_response}
                              </div>
                            </div>
                          )}
                          {p2.uploaded_file_url && (
                            <div style={{ marginBottom:"1.25rem" }}>
                              <div style={S.label}>Uploaded Document</div>
                              <a href={p2.uploaded_file_url} target="_blank" rel="noreferrer"
                                style={{ fontSize:13, color:CCM_RED, fontWeight:600, textDecoration:"none" }}>
                                📎 View uploaded file ↗
                              </a>
                            </div>
                          )}
                          <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:"1rem" }}>
                            <div style={{ ...S.label, marginBottom:"0.75rem" }}>Score by Competency</div>
                            {compList.map((comp, ci) => (
                              <div key={comp.id} style={{
                                marginBottom: ci < compList.length-1 ? "1.25rem" : 0,
                                paddingBottom: ci < compList.length-1 ? "1.25rem" : 0,
                                borderBottom: ci < compList.length-1 ? "1px dashed #f0f0f0" : "none",
                              }}>
                                <div style={{ fontSize:12, fontWeight:600, color:"#555", marginBottom:8 }}>{comp.name}</div>
                                {scoreInput("part2", comp.id)}
                                <div style={{ marginTop:8 }}>
                                  <input style={{ ...S.input, fontSize:12 }}
                                    placeholder="Assessor notes (optional)"
                                    value={(rpScores.part2[comp.id]||{}).notes || ""}
                                    onChange={e => setRpScores(prev => ({
                                      ...prev, part2: { ...prev.part2, [comp.id]: { ...(prev.part2[comp.id]||{}), notes:e.target.value } }
                                    }))}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </>)}
                      </div>

                      {/* Score summary table */}
                      <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:CCM_RED, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"1rem" }}>
                          Score Summary
                        </div>
                        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                          <thead>
                            <tr style={{ borderBottom:"2px solid #e5e5e5" }}>
                              {["Competency","Part 1 Avg","Part 2 Score","Overall"].map(h => (
                                <th key={h} style={{ padding:"8px 12px", textAlign:h==="Competency"?"left":"center",
                                  fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {compList.map((comp, i) => {
                              const a = p1Avg(comp.id), b = p2Score(comp.id), ov = compOverall(comp.id);
                              return (
                                <tr key={comp.id} style={{ background: i%2===0?"#fafafa":"#fff" }}>
                                  <td style={{ padding:"10px 12px", fontWeight:600 }}>{comp.name}</td>
                                  <td style={{ padding:"10px 12px", textAlign:"center",
                                    color:a!==null?SCORE_COLORS[clamp(a)]:"#ccc", fontWeight:a!==null?600:400 }}>{fmt(a)}</td>
                                  <td style={{ padding:"10px 12px", textAlign:"center",
                                    color:b!==null?SCORE_COLORS[b]:"#ccc", fontWeight:b!==null?600:400 }}>{fmt(b)}</td>
                                  <td style={{ padding:"10px 12px", textAlign:"center", fontWeight:700,
                                    color:ov!==null?SCORE_COLORS[clamp(ov)]:"#ccc" }}>{fmt(ov)}</td>
                                </tr>
                              );
                            })}
                            <tr style={{ borderTop:"2px solid #e5e5e5" }}>
                              <td style={{ padding:"10px 12px", fontWeight:700 }}>OVERALL</td>
                              <td /><td />
                              <td style={{ padding:"10px 12px", textAlign:"center", fontWeight:700, fontSize:16,
                                color:grandOverall!==null?SCORE_COLORS[clamp(grandOverall)]:"#ccc" }}>
                                {fmt(grandOverall)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Bottom save */}
                      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1.5rem" }}>
                        <button onClick={saveRpScores} disabled={rpSaving}
                          style={S.btn(CCM_RED,"#fff",{ opacity:rpSaving?0.6:1, padding:"11px 28px" })}>
                          {rpSaving ? "Saving…" : "Save Scores"}
                        </button>
                      </div>

                      {/* Generate Reports */}
                      <div style={{ ...S.card, marginBottom:"2rem" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:CCM_RED, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.75rem" }}>
                          Generate Reports
                        </div>
                        <p style={{ fontSize:12, color:"#888", marginBottom:"0.75rem" }}>
                          Save scores before generating. AI reports take 15–30 seconds.
                        </p>
                        {/* AI-generated row */}
                        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:"0.75rem" }}>
                          {[
                            { type:"individual", label:"Individual Report", desc:"Full AI report for participant" },
                            { type:"client",     label:"Client Report",     desc:"Concise AI report for client" },
                            { type:"cohort",     label:"Cohort Report",     desc:"AI group report for cohort" },
                          ].map(({ type, label, desc }) => (
                            <button key={type}
                              onClick={() => doGenerateReport(type)}
                              disabled={rpReportLoading}
                              style={{
                                flex:1, minWidth:130, padding:"11px 12px", borderRadius:8, cursor: rpReportLoading ? "default" : "pointer",
                                border: rpReportLoading && rpReportType===type ? `2px solid ${CCM_RED}` : "1.5px solid #ddd",
                                background: rpReportLoading && rpReportType===type ? "#fff7f7" : "#fff",
                                opacity: rpReportLoading && rpReportType!==type ? 0.45 : 1,
                                textAlign:"left",
                              }}>
                              <div style={{ fontWeight:700, fontSize:13, color:CCM_RED, marginBottom:2 }}>
                                {rpReportLoading && rpReportType===type ? "Generating…" : label}
                              </div>
                              <div style={{ fontSize:11, color:"#888" }}>{desc}</div>
                            </button>
                          ))}
                        </div>
                        {rpReportLoading && (
                          <p style={{ fontSize:11, color:"#888", marginBottom:"0.5rem", fontStyle:"italic" }}>
                            Claude is writing the report — this usually takes 15–30 seconds…
                          </p>
                        )}
                        {/* Write Manually row */}
                        <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:"0.75rem" }}>
                          <div style={{ fontSize:11, color:"#aaa", marginBottom:6 }}>Write Manually — fill in each section yourself</div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            {[
                              { type:"individual", label:"Individual" },
                              { type:"client",     label:"Client" },
                              { type:"cohort",     label:"Cohort" },
                            ].map(({ type, label }) => (
                              <button key={type}
                                onClick={() => openManualReport(type)}
                                disabled={rpReportLoading}
                                style={{ padding:"7px 14px", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", border:"1.5px solid #e0e7ef", background:"#f8fafc", color:"#374151" }}>
                                ✏ {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}
        {adminTab==="settings"        && <Placeholder title="Settings"           description="Assessor name, client logo, and score weightings." />}

        {/* ── Case Studies tab ────────────────────────────────────────────────── */}
        {adminTab==="case-studies" && <>

        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <div style={{ width:260, borderRight:"1px solid #e5e5e5", background:"#fafafa", display:"flex", flexDirection:"column", overflowY:"auto", flexShrink:0 }}>
          <div style={{ padding:"1rem", borderBottom:"1px solid #e5e5e5" }}>
            <button onClick={() => selectCs("new")} style={S.btn(CCM_RED,"#fff",{ width:"100%", fontSize:13 })}>+ New Case Study</button>
          </div>
          {caseStudies.length === 0 && (
            <p style={{ padding:"1rem", fontSize:13, color:"#888" }}>No case studies yet.</p>
          )}
          {caseStudies.map(cs => (
            <div
              key={cs.id}
              style={{
                borderBottom:"1px solid #f0f0f0",
                background: selectedId===cs.id ? "#fff7f7" : "transparent",
                borderLeft: selectedId===cs.id ? `3px solid ${CCM_RED}` : "3px solid transparent",
              }}
            >
              <div style={{ padding:"12px 16px 4px" }}>
                <div style={{ fontWeight:600, fontSize:13, color:"#111" }}>{cs.name}</div>
                <div style={{ fontSize:11, color:"#888", marginTop:2 }}>
                  {cs.industry || "No industry"} · {cs.is_active ? "🟢 Assignable" : "⚪ Draft"}
                </div>
              </div>
              <div style={{ padding:"4px 16px 10px" }}>
                <button
                  onClick={() => selectCs(cs.id)}
                  style={{ fontSize:11, color: CCM_RED, background:"none", border:"none", cursor:"pointer", padding:0, fontWeight:600 }}
                >
                  Edit →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main panel ──────────────────────────────────────────────────────── */}
        <div style={{ flex:1, overflowY:"auto", padding:"1.5rem" }}>
          {!selectedId && (
            <div style={{ textAlign:"center", marginTop:"5rem", color:"#aaa", fontSize:14 }}>
              Select a case study or create a new one.
            </div>
          )}

          {selectedId && (
            <div style={{ maxWidth:760 }}>

              {/* Case study info card */}
              <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                <h2 style={{ margin:"0 0 1.25rem", fontSize:17 }}>{isNew ? "New Case Study" : "Case Study Info"}</h2>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                  <div>
                    <label style={S.label}>Name *</label>
                    <input style={S.input} value={csForm.name} onChange={e => setCsForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. Boeing Aviation Assessment" />
                  </div>
                  <div>
                    <label style={S.label}>Industry</label>
                    <input style={S.input} value={csForm.industry} onChange={e => setCsForm(f => ({ ...f, industry:e.target.value }))} placeholder="e.g. Aviation" />
                  </div>
                </div>

                <div style={{ marginBottom:14 }}>
                  <label style={S.label}>Description</label>
                  <textarea
                    style={{ ...S.textarea, height:80 }}
                    value={csForm.description}
                    onChange={e => setCsForm(f => ({ ...f, description:e.target.value }))}
                    placeholder="Brief overview of this assessment engagement…"
                  />
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer" }}>
                    <input type="checkbox" checked={csForm.is_active} onChange={e => setCsForm(f => ({ ...f, is_active:e.target.checked }))} />
                    Available for cohort assignment
                  </label>
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={saveCsInfo} disabled={saving} style={S.btn(CCM_RED,"#fff",{ opacity:saving?0.6:1 })}>
                    {saving ? "Saving…" : isNew ? "Create Case Study" : "Save Changes"}
                  </button>
                  {!isNew && (
                    <button onClick={() => deleteCs(selectedId)} style={S.btn("#fff","#dc2626",{ border:"1px solid #fca5a5" })}>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {isNew && (
                <p style={{ fontSize:13, color:"#888" }}>Save the case study above to unlock levels and competencies.</p>
              )}

              {!isNew && csLoading && (
                <p style={{ fontSize:13, color:"#888" }}>Loading…</p>
              )}

              {!isNew && !csLoading && (
                <>
                  {/* Levels card */}
                  <div style={{ ...S.card, marginBottom:"1.5rem" }}>
                    <h3 style={{ margin:"0 0 0.5rem", fontSize:15 }}>Levels</h3>
                    <p style={{ fontSize:12, color:"#888", marginBottom:14, marginTop:0 }}>
                      Each level gets a complexity tier — <strong>standard</strong> (simpler scenario/questions) or <strong>advanced</strong> (full version).
                    </p>

                    {levels.length === 0 && <p style={{ fontSize:13, color:"#aaa", marginBottom:12 }}>No levels yet.</p>}

                    <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                      {levels.map(lv => (
                        <div key={lv.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"#f8f8f8", borderRadius:8, border:"1px solid #eee" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontWeight:600, fontSize:13 }}>{lv.name}</span>
                            <span style={{
                              fontSize:11,
                              background: lv.complexity_tier==="advanced" ? "#eff6ff" : "#f0fdf4",
                              color:      lv.complexity_tier==="advanced" ? "#0369a1" : "#16a34a",
                              padding:"2px 8px", borderRadius:20,
                              border:`1px solid ${lv.complexity_tier==="advanced"?"#bfdbfe":"#bbf7d0"}`,
                            }}>
                              {lv.complexity_tier}
                            </span>
                          </div>
                          <button onClick={() => removeLevel(lv.id)} style={{ background:"none", border:"none", color:"#dc2626", cursor:"pointer", fontSize:12 }}>Remove</button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                      <div style={{ flex:1 }}>
                        <label style={S.label}>Level Name</label>
                        <input style={S.input} value={levelForm.name} onChange={e => setLevelForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. Manager" onKeyDown={e => e.key==="Enter" && addLevel()} />
                      </div>
                      <div>
                        <label style={S.label}>Complexity Tier</label>
                        <select style={{ ...S.input, width:140 }} value={levelForm.complexity_tier} onChange={e => setLevelForm(f => ({ ...f, complexity_tier:e.target.value }))}>
                          <option value="standard">Standard</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <button onClick={addLevel} style={S.btn(CCM_RED,"#fff")}>Add Level</button>
                    </div>
                  </div>

                  {/* Assign Competencies card */}
                  {(() => {
                    const CATCOLORS = {
                      "Leadership":             { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" },
                      "Cognitive":              { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0" },
                      "Interpersonal":          { bg:"#fdf4ff", color:"#7e22ce", border:"#e9d5ff" },
                      "Personal Effectiveness": { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa" },
                      "Functional & Executive": { bg:"#fef2f2", color:"#b91c1c", border:"#fecaca" },
                    };
                    const assignedIds = new Set(csAssignedComps.map(a => a.competency_id));
                    const CATS = ["Leadership","Cognitive","Interpersonal","Personal Effectiveness","Functional & Executive"];
                    return (
                      <div style={{ ...S.card }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.5rem" }}>
                          <h3 style={{ margin:0, fontSize:15 }}>Assign Competencies</h3>
                          <span style={{ fontSize:12, fontWeight:700, background: csAssignedComps.length > 0 ? CCM_RED : "#e5e7eb", color: csAssignedComps.length > 0 ? "#fff" : "#666", borderRadius:20, padding:"2px 10px", minWidth:24, textAlign:"center" }}>
                            {csAssignedComps.length} {csAssignedComps.length === 1 ? "competency" : "competencies"} assigned
                          </span>
                        </div>
                        <p style={{ fontSize:12, color:"#888", marginBottom:14, marginTop:0 }}>
                          Tick competencies from the library to apply them to this case study. These drive the assessor guide and question alignment.
                        </p>
                        {csAssignedLoading && <p style={{ fontSize:13, color:"#aaa" }}>Saving…</p>}
                        {libComps.length === 0 && (
                          <p style={{ fontSize:13, color:"#aaa" }}>No competencies in the library yet. Add some in the Competencies tab first.</p>
                        )}
                        {CATS.map(cat => {
                          const items = libComps.filter(c => c.category === cat);
                          if (!items.length) return null;
                          const col = CATCOLORS[cat] || { bg:"#f5f5f5", color:"#333", border:"#ddd" };
                          return (
                            <div key={cat} style={{ marginBottom:16 }}>
                              <div style={{ fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20, background:col.bg, color:col.color, border:`1px solid ${col.border}`, display:"inline-block", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.06em" }}>{cat}</div>
                              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                {items.map(comp => {
                                  const checked = assignedIds.has(comp.id);
                                  return (
                                    <label key={comp.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background: checked ? "#fff7f7" : "#f9f9f9", border:`1px solid ${checked ? "#fca5a5" : "#eee"}`, borderRadius:8, cursor:"pointer" }}>
                                      <input type="checkbox" checked={checked} onChange={() => toggleCsComp(comp.id, checked)} style={{ marginTop:2, flexShrink:0 }} />
                                      <div>
                                        <div style={{ fontWeight:600, fontSize:13 }}>{comp.name}</div>
                                        {comp.definition && <div style={{ fontSize:11, color:"#888", marginTop:2, lineHeight:1.4 }}>{comp.definition.length > 120 ? comp.definition.slice(0,120)+"…" : comp.definition}</div>}
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {libComps.length > 0 && (
                          <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:8, paddingTop:12, borderTop:"1px solid #f0f0f0" }}>
                            <button
                              onClick={() => { setCsCompSaved(true); setTimeout(() => setCsCompSaved(false), 2000); }}
                              style={S.btn("#16a34a","#fff",{ fontSize:13 })}
                            >
                              {csCompSaved ? "✓ Saved" : "✓ Save Competency Selection"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}
        </div>
        </>}
      </div>

      <Toast msg={toast} />
    </div>
  );
}
