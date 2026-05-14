import { useState, useEffect } from "react";
import { CCM_RED, S } from "./lib/constants";
import * as db from "./lib/db";

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

// ─── Keyword chip editor ───────────────────────────────────────────────────────
function KeywordEditor({ keywords, onChange }) {
  const [input, setInput] = useState("");
  function add() {
    const kw = input.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) onChange([...keywords, kw]);
    setInput("");
  }
  function remove(kw) { onChange(keywords.filter(k => k !== kw)); }
  return (
    <div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
        {keywords.map(kw => (
          <span key={kw} style={{ background:"#f0f0f0", border:"1px solid #ddd", borderRadius:20, padding:"2px 10px", fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
            {kw}
            <button onClick={() => remove(kw)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:14, lineHeight:1, padding:0 }}>×</button>
          </span>
        ))}
        {keywords.length === 0 && <span style={{ fontSize:12, color:"#aaa" }}>No keywords yet</span>}
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Type keyword, press Enter"
          style={{ ...S.input, width:220, fontSize:12 }}
        />
        <button onClick={add} style={S.btn("#111","#fff",{ fontSize:12, padding:"6px 14px" })}>Add</button>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
  if (screen === "admin") loadLibComps();
}, [screen]);
  const [screen, setScreen]         = useState("login");
  const [role,   setRole]           = useState(null);       // "admin" | "participant"
  const [session, setSession]       = useState(null);       // loaded participant session
  const [loginForm, setLoginForm]   = useState({ username:"", password:"" });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading]       = useState(false);

  const [caseStudies, setCaseStudies] = useState([]);
  const [selectedId, setSelectedId]   = useState(null); // null | "new" | uuid

  const [csData, setCsData]       = useState(null);
  const [csLoading, setCsLoading] = useState(false);

  const [csForm, setCsForm]       = useState({ name:"", industry:"", description:"", is_active:false });
  const [levelForm, setLevelForm] = useState({ name:"", complexity_tier:"standard" });
  const [compForm, setCompForm]   = useState({ name:"", keywords:[] });

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
  const [mbModForm,      setMbModForm]      = useState({ name:"" });
  const emptyScenForm = { case_study_text:"", appendix_text:"", image_1_url:"", image_1_caption:"", image_2_url:"", image_2_caption:"", image_3_url:"", image_3_caption:"", file_url:"", file_name:"", file_type:"" };
  const [mbScenForm,     setMbScenForm]     = useState({ ...emptyScenForm });
  const [mbLevelIds,     setMbLevelIds]     = useState([]);
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
  const [guideSaving, setGuideSaving] = useState(false);
  // AI question suggestions
  const [aiPanelOpen,   setAiPanelOpen]   = useState(false); // controlled separately from load state
  const [aiSuggestions, setAiSuggestions] = useState([]); // [{advanced, standard}]
  const [aiError,       setAiError]       = useState(null);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiSelected,    setAiSelected]    = useState(new Set());
  const [aiAdding,      setAiAdding]      = useState(false);

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
      return;
    }
    setSelectedId(id);
    setCsLoading(true);
    try {
      const data = await db.getFullCaseStudy(id);
      setCsData(data);
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
  async function addCompetency() {
    if (!compForm.name.trim()) { notify("Competency name required."); return; }
    if (!selectedId || selectedId === "new") { notify("Save the case study first."); return; }
    try {
      await db.saveCompetency({
        case_study_id: selectedId,
        name:          compForm.name.trim(),
        keywords:      compForm.keywords,
        display_order: (csData?.competencies?.length || 0),
      });
      setCompForm({ name:"", keywords:[] });
      await reloadCsData();
      notify("Competency added.");
    } catch { notify("Failed to add competency."); }
  }

  async function removeCompetency(id) {
    if (!window.confirm("Delete this competency? Questions linked to it will break.")) return;
    try {
      await db.deleteCompetency(id);
      await reloadCsData();
      notify("Competency removed.");
    } catch { notify("Cannot delete — questions may reference this competency."); }
  }

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
        setSession(sess); setRole("participant"); setScreen("participant");
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
      setMbModForm({ name:"", description:"" });
      setMbScenForm({ standard:"", advanced:"" });
      setMbLevelIds([]);
    } catch(e) { notify(`Failed to load: ${e.message}`); }
    setMbLoading(false);
  }

  function selectMbModule(moduleId) {
    setMbSelModId(moduleId);
    setMbScenEditing(false);
    const mod = mbModules.find(m => m.id === moduleId);
    setMbModForm({ name: mod?.title || "" });
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
      });
      const newMods = [...mbModules, mod];
      setMbModules(newMods);
      setMbNewName("");
      // Select the new module
      setMbSelModId(mod.id);
      setMbModForm({ name: mod.title || "" });
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
    async function loadLibComps() {
  setLibLoading(true);
  try { setLibComps(await db.getLibraryCompetencies()); }
  catch(e) { notify(`Failed to load competencies: ${e.message}`); }
  setLibLoading(false);
}

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
    setQgCsId(csId); setQgModuleId(""); setQFormOpen(false); setGuideOpen(null);
    setQForm({ ...emptyQForm }); closeAiPanel();
    if (!csId) { setQgData(null); return; }
    setQgLoading(true);
    try { setQgData(await db.getFullCaseStudy(csId)); }
    catch(e) { notify(`Failed to load: ${e.message}`); }
    setQgLoading(false);
  }

  async function reloadQgData() {
    if (!qgCsId) return;
    try { setQgData(await db.getFullCaseStudy(qgCsId)); }
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
    const csName   = qgData?.caseStudy?.name || "the case study";
    const compName = (qgData?.competencies || []).find(c => c.id === compId)?.name || compId;
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
    setGuideSaving(true);
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
    setGuideSaving(false);
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
      <div style={{ display: (adminTab==="case-studies"||adminTab==="module-builder"||adminTab==="questions-guide") ? "flex" : "block", height:"calc(100vh - 98px)", overflow: (adminTab==="case-studies"||adminTab==="module-builder"||adminTab==="questions-guide") ? "hidden" : "auto" }}>

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
                                    <img src={url} alt={`Image ${n}`} style={{ height:52, width:88, objectFit:"cover", borderRadius:6, border:"1px solid #ddd" }} />
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

                  <button onClick={saveMbModule} disabled={mbSaving} style={S.btn(CCM_RED,"#fff",{ opacity:mbSaving?0.6:1 })}>
                    {mbSaving ? "Saving…" : "Save Module"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {adminTab==="questions-guide" && (() => {
          const qgModules      = qgData?.modules      || [];
          const qgCompetencies = qgData?.competencies || [];
          const qgQuestions    = (qgData?.questions   || []).filter(q => q.module_id === qgModuleId);
          const qgGuides       = qgData?.guide        || [];

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
                      <div>No competencies defined for this case study. Add competencies first in the Case Studies tab.</div>
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

                          <div style={{ display:"grid", gridTemplateColumns:"1fr 120px", gap:12, marginBottom: aiSuggestions.length || aiLoading ? 0 : 14 }}>
                            <div>
                              <label style={S.label}>Competency *</label>
                              <select
                                style={S.input}
                                value={qForm.competency_id}
                                onChange={e => {
                                  const id = e.target.value;
                                  setQForm(f => ({ ...f, competency_id:id }));
                                  if (!qForm.id) openAiPanel(id); // open synchronously, fetch async
                                }}
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
                        const guide   = qgGuides.find(g => g.question_id === question.id);
                        const isEditingQ = qFormOpen && qForm.id === question.id;
                        const isEditingG = guideOpen === question.id;

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
                            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                              {[["advanced","text_advanced"],["standard","text_standard"]].map(([tier, field]) => (
                                <div key={tier} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                                  <span style={{ ...tierBadge(tier), flexShrink:0, marginTop:1 }}>{tier}</span>
                                  <span style={{ fontSize:13, lineHeight:1.55, color:"#222" }}>{question[field] || <em style={{ color:"#bbb" }}>Not set</em>}</span>
                                </div>
                              ))}
                            </div>

                            {/* ── Assessor Guide section ───────────────── */}
                            <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:12 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: isEditingG ? 14 : 0 }}>
                                <span style={{ fontSize:12, fontWeight:600, color:"#555" }}>Assessor Guide</span>
                                {!isEditingG && (
                                  <span style={{ fontSize:11, color: guide ? "#16a34a" : "#f59e0b" }}>
                                    {guide ? "✓ Set" : "⚠ Not set"}
                                  </span>
                                )}
                                <div style={{ flex:1 }} />
                                <button
                                  onClick={() => isEditingG ? setGuideOpen(null) : openGuideEdit(question.id)}
                                  style={isEditingG
                                    ? S.btn("#111","#fff",{ fontSize:11, padding:"4px 10px" })
                                    : S.btn("#fff","#555",{ fontSize:11, padding:"4px 10px", border:"1px solid #ddd" })}
                                >
                                  {isEditingG ? "✕ Close" : guide ? "Edit Guide" : "+ Add Guide"}
                                </button>
                              </div>

                              {/* Guide read-only summary */}
                              {!isEditingG && guide && (
                                <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:10 }}>
                                  {guide.model_answer && (
                                    <div style={{ fontSize:12, color:"#555" }}>
                                      <span style={{ fontWeight:600 }}>Model answer: </span>
                                      <span style={{ color:"#777" }}>{guide.model_answer.length > 140 ? guide.model_answer.slice(0,140)+"…" : guide.model_answer}</span>
                                    </div>
                                  )}
                                  {[["Strong", guide.strong_indicators, "#16a34a", "#f0fdf4", "#bbf7d0"],
                                    ["Weak",   guide.weak_indicators,   "#dc2626", "#fef2f2", "#fca5a5"]
                                  ].map(([label, text, color, bg, border]) => {
                                    const lines = (typeof text === "string" ? text : (Array.isArray(text) ? text.join("\n") : "")).split("\n").filter(Boolean);
                                    if (!lines.length) return null;
                                    return (
                                      <div key={label}>
                                        <div style={{ fontSize:11, fontWeight:600, color, marginBottom:4 }}>{label} Indicators</div>
                                        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                          {lines.map((ln, i) => (
                                            <div key={i} style={{ fontSize:12, padding:"4px 10px", background:bg, border:`1px solid ${border}`, borderRadius:5, color:"#222" }}>● {ln}</div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Guide edit form */}
                              {isEditingG && (
                                <div style={{ marginTop:4 }}>
                                  <div style={{ marginBottom:14 }}>
                                    <label style={S.label}>Model Answer</label>
                                    <textarea
                                      style={{ ...S.textarea, height:100 }}
                                      value={guideForm.model_answer}
                                      onChange={e => setGuideForm(f => ({ ...f, model_answer:e.target.value }))}
                                      placeholder="The overall model answer an assessor should look for…"
                                    />
                                  </div>
                                  <div style={{ marginBottom:16 }}>
                                    <label style={S.label}>Best Answer — Score 5</label>
                                    <textarea
                                      style={{ ...S.textarea, height:80 }}
                                      value={guideForm.best_answer}
                                      onChange={e => setGuideForm(f => ({ ...f, best_answer:e.target.value }))}
                                      placeholder="What a score of 5 looks like — specific, observable behaviours…"
                                    />
                                  </div>
                                  {[
                                    { key:"strong_indicators", label:"Strong Indicators", placeholder:"One indicator per line…\ne.g. Clearly articulates a structured approach\nIdentifies key stakeholders proactively", color:"#16a34a" },
                                    { key:"weak_indicators",   label:"Weak Indicators",   placeholder:"One indicator per line…\ne.g. Gives only generic or vague responses\nFails to consider impact on others",       color:"#dc2626" },
                                  ].map(({ key, label, placeholder, color }) => (
                                    <div key={key} style={{ marginBottom:16 }}>
                                      <label style={{ ...S.label, color }}>{label}</label>
                                      <p style={{ fontSize:11, color:"#aaa", margin:"0 0 6px" }}>One indicator per line. Type or paste all at once.</p>
                                      <textarea
                                        style={{ ...S.textarea, height:110, fontSize:12 }}
                                        value={guideForm[key]}
                                        onChange={e => setGuideForm(f => ({ ...f, [key]:e.target.value }))}
                                        placeholder={placeholder}
                                      />
                                    </div>
                                  ))}
                                  <button onClick={() => saveQgGuide(question.id)} disabled={guideSaving} style={S.btn(CCM_RED,"#fff",{ opacity:guideSaving?0.6:1 })}>
                                    {guideSaving ? "Saving…" : "Save Guide"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
        {adminTab==="dashboard"       && <Placeholder title="Dashboard"          description="Per-cohort completion grid showing all participants and modules." />}
        {adminTab==="assessor-guide"  && <Placeholder title="Assessor Guide"     description="Dynamic guide pulled from the active case study." />}
        {adminTab==="live-panel"      && <Placeholder title="Live Panel"         description="Real-time question bank for use during live interviews." />}
        {adminTab==="reports"         && <Placeholder title="Reports"            description="AI rating, manual override, PDF download, and report approval." />}
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

                  {/* Competencies card */}
                  <div style={{ ...S.card }}>
                    <h3 style={{ margin:"0 0 0.5rem", fontSize:15 }}>Competencies</h3>
                    <p style={{ fontSize:12, color:"#888", marginBottom:14, marginTop:0 }}>
                      Keywords are matched against interview transcripts to detect which competency is being demonstrated.
                    </p>

                    {competencies.length === 0 && <p style={{ fontSize:13, color:"#aaa", marginBottom:12 }}>No competencies yet.</p>}

                    <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
                      {competencies.map(comp => (
                        <div key={comp.id} style={{ padding:"12px 14px", background:"#f8f8f8", borderRadius:8, border:"1px solid #eee" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                            <span style={{ fontWeight:600, fontSize:13 }}>{comp.name}</span>
                            <button onClick={() => removeCompetency(comp.id)} style={{ background:"none", border:"none", color:"#dc2626", cursor:"pointer", fontSize:12 }}>Remove</button>
                          </div>
                          <label style={S.label}>Detection Keywords</label>
                          <KeywordEditor keywords={comp.keywords || []} onChange={kws => updateKeywords(comp.id, kws)} />
                        </div>
                      ))}
                    </div>

                    <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                      <div style={{ flex:1 }}>
                        <label style={S.label}>Competency Name</label>
                        <input
                          style={S.input}
                          value={compForm.name}
                          onChange={e => setCompForm(f => ({ ...f, name:e.target.value }))}
                          placeholder="e.g. Strategic Thinking"
                          onKeyDown={e => e.key==="Enter" && addCompetency()}
                        />
                      </div>
                      <button onClick={addCompetency} style={S.btn(CCM_RED,"#fff")}>Add Competency</button>
                    </div>
                  </div>
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
