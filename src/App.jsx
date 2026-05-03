import { useState, useEffect, useRef, useCallback } from "react";

const CCM_RED = "#E8251A";
const SB_URL = "https://exqpnofliridwdrcyien.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cXBub2ZsaXJpZHdkcmN5aWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDYwODgsImV4cCI6MjA5MTk4MjA4OH0.xVkvptHGnTDAoQ288uQiAHSct2qpREMzY-2dRdGwt8M";

async function sb(table, method = "GET", body = null, query = "") {
  const res = await fetch(`${SB_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "resolution=merge-duplicates,return=representation" : "return=representation",
    },
    body: body ? JSON.stringify(body) : null,
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Load jsPDF from CDN
function loadJsPDF() {
  return new Promise((resolve) => {
    if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(script);
  });
}

function CCMLogo({ small }) {
  const s = small ? 0.6 : 1;
  return (
    <svg width={Math.round(88 * s)} height={Math.round(38 * s)} viewBox="0 0 88 38" fill="none">
      <text x="0" y="27" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="30" fill={CCM_RED} letterSpacing="-1">CCM</text>
      <text x="1" y="36" fontFamily="Arial,sans-serif" fontWeight="400" fontSize="8.5" fill="#111" letterSpacing="2.2">CONSULTANCY</text>
    </svg>
  );
}

const RUBRIC = [
  { score: 1, label: "Well below expectation", color: "#dc2626", bg: "#fef2f2", desc: "Little to no evidence of the competency." },
  { score: 2, label: "Below expectation", color: "#ea580c", bg: "#fff7ed", desc: "Some evidence but significant gaps." },
  { score: 3, label: "Meeting expectation", color: "#ca8a04", bg: "#fefce8", desc: "Clear evidence, structured and relevant." },
  { score: 4, label: "Above expectation", color: "#16a34a", bg: "#f0fdf4", desc: "Strong evidence with depth and insight." },
  { score: 5, label: "Exceptional", color: "#0369a1", bg: "#eff6ff", desc: "Outstanding - significantly exceeded expectations." },
];

const PROMOTION_OPTIONS = [
  { value: "", label: "Select a recommendation..." },
  { value: "ready_now", label: "Ready now - Recommend for promotion or target role" },
  { value: "ready_development", label: "Ready with development - Recommend with 6-month plan" },
  { value: "not_yet", label: "Not yet ready - Recommend further time in current role" },
  { value: "further_assessment", label: "Further assessment needed - Recommend additional evaluation" },
];

const DEFAULT_PRESET_QUESTIONS = {
  Communication: ["How did you decide who to communicate with first and why?", "How would you adapt your message for different audience levels?", "How do you ensure your message was received and understood?", "Walk me through how you handle conflicting information in a crisis.", "What would you do differently in your communication approach if you had more time?", "How do you tailor your style when dealing with senior stakeholders versus frontline staff?"],
  Accountability: ["Who ultimately owns this situation and why?", "How do you hold others accountable without damaging relationships?", "What systemic changes would prevent this from recurring?", "How do you balance accountability with psychological safety?", "Can you give an example of a time you had to take accountability for something that went wrong?", "How do you distinguish between a performance issue and a systemic failure?"],
  "Strategic Thinking": ["What data would most change your strategic recommendation?", "How do you balance short-term survival with long-term positioning?", "What risks have you not accounted for?", "How would you know if your strategy is working at 12 months?", "How do you prioritise when everything feels equally urgent?", "What external factors could most disrupt your strategy and how would you respond?"],
  "Decision Making": ["What would make you reverse this decision?", "How did you weigh the competing priorities?", "What information were you missing?", "How do you make decisions under time pressure?", "Walk me through a decision that did not go as planned and what you learned.", "How do you involve others in your decision-making without losing momentum?"],
  "People Leadership": ["How do you lead people who are actively resistant?", "How do you maintain your own resilience while supporting others?", "What does psychological safety mean to you in practice?", "Describe your approach when someone is underperforming but experienced.", "How do you build trust quickly with a team that does not know you yet?", "What is your approach to recognising and developing talent in your team?"],
};

const MODULES = [
  {
    id: "M1", title: "Module 1: Operational Crisis",
    competencies: ["Communication", "Accountability"], duration: 20,
    levels: ["frontline", "supervisor", "manager", "senior"],
    caseStudy: {
      background: "GlobalAir is a major international airline headquartered in the Gulf region, operating since 2001. The airline has grown from a regional carrier serving 12 destinations to a full-service international operation connecting 94 cities across 45 countries. With a fleet of 186 aircraft including wide-body long-haul jets and narrow-body regional aircraft, GlobalAir employs over 14,000 people across operations, cabin services, ground handling, engineering, and commercial functions. The airline has built a strong reputation for on-time performance, consistently ranking in the top quartile regionally and winning the Gulf Carrier Reliability Award in three of the last five years. Revenue for the most recent financial year was USD 3.2 billion, with ground operations accounting for approximately 18% of total operating costs. The organisation has recently undergone a senior leadership transition, with a new Chief Operating Officer joining six months ago from a European carrier, bringing a mandate to modernise operations and improve cost efficiency.",
      currentState: "Terminal 2 at GlobalAir's primary hub handles 60% of daily departures, processing approximately 112 flights and 28,000 passengers every day. The terminal's baggage handling infrastructure was last upgraded seven years ago, and internal engineering reports from the past 18 months have flagged increasing mechanical strain on the primary conveyor system during peak morning operations between 06:00 and 09:00. A formal maintenance warning was raised and logged in the system three days ago by a junior engineer but was not escalated to supervisory level as required by protocol. At 06:45 this morning, the primary baggage conveyor system in Terminal 2 suffered a complete mechanical failure. As of 07:00, 3,200 bags are unprocessed, 47 flights are scheduled to depart within the next four hours, passengers are beginning to gather at collection carousels, and two local television crews have arrived at the terminal. The airport authority's duty manager has called twice requesting a formal update, and three airline partner representatives have already emailed escalating concerns about delays to their aircraft.",
      challenge: "This failure creates a cascading operational, reputational, and commercial risk for GlobalAir at its most critical morning peak. Manual baggage handling capacity across the available ground crew is estimated at no more than 40% of the volume required to clear the backlog before the first wave of departures. Every minute without a structured response increases the likelihood of flight delays, missed connections, passenger compensation claims, and negative media coverage. Simultaneously, the discovery of an unescalated maintenance warning creates an internal accountability question that must be managed carefully without allowing blame to distract from the immediate operational response. Airline partner agreements contain penalty clauses that activate after 45 minutes of delay attributable to ground handling failure, and three aircraft are already approaching that threshold. A coordinated, clear-headed, and rapid response across operations, communications, and stakeholder management is required immediately.",
      yourRole: "You are the Head of Ground Operations for GlobalAir at this hub, appointed 14 months ago after 12 years in ground operations roles across the region. You are responsible for all ground handling, baggage, ramp, and turnaround operations across both terminals, leading a team of 120 ground staff, four shift supervisors, and two operations coordinators. You report directly to the VP of Airport Operations and have full authority to activate emergency protocols, redirect resources, and communicate on behalf of ground operations. This situation requires your immediate leadership.",
    },
    caseStudySimple: {
      background: "QuickAir is a regional airline that has been flying for 12 years, connecting passengers across 20 destinations in the Gulf and wider region. The airline is known for being reliable and on time and has built a loyal passenger base among business travellers and families. QuickAir employs around 2,400 people and operates from two main terminals at its home airport. The airline has recently invested in new aircraft and is in a period of growth, with three new routes launching in the coming quarter. Customer satisfaction scores have been strong, and the airline's leadership team has set a clear goal of maintaining its on-time performance reputation as it grows.",
      currentState: "This morning the primary baggage machine in Terminal 2 stopped working completely at 06:45. Over 3,000 bags are stuck and cannot be processed. Many flights are due to leave within the next four hours and passengers are already gathering at the carousels and becoming frustrated. A warning about the machine was filed three days ago but nobody followed it up or told a supervisor. Two television news crews have arrived at the terminal and the airport authority is asking for an immediate update on what is happening.",
      challenge: "Flights may be delayed if the bags are not processed quickly. Passengers are unhappy and the situation is attracting media attention. There are not enough staff to move all the bags by hand quickly enough. An internal process was not followed when the warning was ignored three days ago and this needs to be addressed. Your team needs clear direction on what to do right now, and partner airlines are asking when their aircraft will be ready to depart.",
      yourRole: "You are a Ground Operations Supervisor at QuickAir, responsible for managing the ground handling team on your shift across baggage, ramp, and turnaround activities. You lead a team of 18 ground agents and report to the Ground Operations Manager. Your manager is currently in a briefing and has asked you to take charge and provide a full update within 15 minutes.",
    },
    questions: [
      { id: "Q1", text: "Describe your immediate actions in the first 15 minutes of this crisis. Who do you contact, in what order, and what do you communicate to each? How do you prioritise between managing the operation and managing stakeholders simultaneously?", textSimple: "What would you do in the first 15 minutes after finding out about the baggage system failure? Who would you contact first, and what would you tell them? How would you decide what to do first when everything feels urgent?", competency: "Communication" },
      { id: "Q2", text: "You have now confirmed that a junior engineer logged a maintenance warning three days ago that was not escalated. The engineer is currently on shift and is part of the team you need to resolve today's crisis. How do you handle the accountability for this failure while keeping the operation moving? What process do you follow, and what are your immediate and longer-term actions?", textSimple: "You find out that a team member filed a warning three days ago that nobody acted on, and that this caused today's failure. That person is still on shift and you need them working. How do you handle this? What do you do now and what do you do later?", competency: "Accountability" },
      { id: "Q3", text: "Draft a public-facing statement of no more than five sentences that you would release immediately to passengers in the terminal and to the media crews present. Then explain the communication principles behind your choices - what you included, what you deliberately left out, and why.", textSimple: "Write a short message of two to three sentences that you would display on screens in the terminal and give to the news cameras. Then explain why you chose those words and what you decided not to say.", competency: "Communication" },
    ],
    guide: [
      { qId: "Q1", competency: "Communication", modelAnswer: "The first action is to activate the ground operations emergency protocol and notify the Operations Control Centre, Terminal Manager, VP of Airport Operations, and airline partner liaisons simultaneously - not sequentially. A dedicated incident commander role should be assigned immediately so the Head of Ground Operations can coordinate rather than react. Ground staff should receive a three-minute stand-up briefing with clear task allocation: prioritise bags for the three aircraft approaching penalty thresholds first, then work through departures by schedule time. A passenger communication point should be established at each carousel with a committed update schedule every 10 to 15 minutes. The airport authority should receive a formal written update within the first 10 minutes, and a holding statement for media should be issued before the 15-minute mark.", strongIndicators: ["Activates formal crisis protocol immediately rather than improvising", "Contacts all critical stakeholders simultaneously not sequentially", "Assigns an incident commander to separate coordination from response", "Prioritises by commercial impact - penalty threshold flights first", "Establishes a passenger communication cadence with specific timing"], weakIndicators: ["Contacts stakeholders one by one losing critical time", "Attempts to personally manage every workstream simultaneously", "Waits to fully understand the problem before communicating anything", "Has no structured prioritisation framework"], bestAnswer: "A score of 5 response would activate the emergency protocol in the first sentence, assign an incident commander, contact all five stakeholder groups within the first three minutes, prioritise by penalty threshold, commit to a 10-minute update cadence, and reference the post-incident review process.", rolePlayGuide: "A strong candidate will open by acknowledging the representative's frustration before providing any information. They will state the specific actions being taken for that representative's aircraft, give a realistic timeline, and offer a named point of contact." },
      { qId: "Q2", competency: "Accountability", modelAnswer: "The immediate priority is operational: the engineer remains on shift and is needed. A brief private conversation - no more than two minutes - should acknowledge that the situation will be reviewed formally but that the focus right now is on resolution. The failure should be logged immediately as a formal incident report with a timestamp. After the crisis, a structured accountability process should be initiated within 24 hours: a formal meeting with HR present, a review of whether the non-escalation was a training gap, a process gap, or a conduct issue, and a systemic review of whether the escalation protocol itself is clear and accessible.", strongIndicators: ["Separates the immediate operational need from the accountability process", "Has a brief private conversation - does not ignore or publicly address it", "Logs the incident formally in real time", "Initiates a structured post-crisis accountability process within 24 hours", "Distinguishes between a training gap, a process gap, and a conduct issue"], weakIndicators: ["Publicly addresses or reprimands the engineer in front of colleagues", "Ignores the accountability issue entirely to focus on the crisis", "Assumes malicious intent without evidence"], bestAnswer: "A score of 5 response demonstrates emotional intelligence by keeping the engineer engaged and dignified while still taking the accountability issue seriously. The candidate references a specific HR or conduct process and distinguishes between systemic and individual failure.", rolePlayGuide: "Not applicable for this question." },
      { qId: "Q3", competency: "Communication", modelAnswer: "Sample statement: We are aware of a technical issue affecting baggage processing in Terminal 2 and our teams are working urgently to resolve it. We apologise sincerely for the disruption this is causing to your journey and we are doing everything possible to minimise delays to your flight. Our team will provide an update at every information desk and on departure screens every 15 minutes. Communication principles: the statement opens with acknowledgement not explanation, uses plain language, makes a specific and credible commitment on update timing, and deliberately omits the cause of the failure and any estimate of resolution time that cannot be guaranteed.", strongIndicators: ["Opens with acknowledgement rather than explanation", "Uses plain language appropriate for an international passenger audience", "Makes a specific and credible commitment on update frequency", "Deliberately omits unconfirmed information"], weakIndicators: ["Opens with an explanation of what went wrong before acknowledging impact", "Makes vague commitments such as as soon as possible", "Mentions the maintenance warning publicly"], bestAnswer: "A score of 5 response produces a polished, empathetic, and specific statement. The candidate articulates a clear framework for their choices, referencing audience awareness and the risk of over-promising.", rolePlayGuide: "A strong candidate will listen first, acknowledge the commercial impact specifically, and not make financial commitments without authority." },
    ],
    rolePlay: { title: "Role Play: Angry Airline Partner Representative", setup: "An airline partner account representative calls you directly at 07:10. Three of their aircraft are at risk of triggering the contractual penalty clause that activates after 45 minutes of ground handling delay. They are furious, threatening to escalate to GlobalAir's CEO and to raise a formal contractual penalty claim worth USD 180,000. You must manage this call while your team is still resolving the crisis on the ground.", setupSimple: "A manager from a partner airline calls you at 07:10, very unhappy that three of their flights are going to be delayed because of the baggage failure. They are threatening to complain to your CEO and are talking about financial penalties.", aiRole: "You are an angry airline partner representative. Three of your aircraft are approaching the penalty clause threshold. You are furious and threatening to escalate to the CEO and raise a USD 180,000 penalty claim. Open with strong frustration. Probe firmly on: what caused this, what is being done specifically for your aircraft, what compensation will be offered, and when normal operations will resume. Do not accept vague assurances. After four to five exchanges, begin to soften if the candidate demonstrates genuine empathy, gives specific information about your aircraft, and commits to a named contact person. Stay in character. Keep responses to three to four sentences.", competencies: ["Communication", "Accountability"] },
    simPrompt: "You are a senior aviation operations assessor conducting a structured competency interview on behalf of CCM Consultancy. Never repeat a question. Rotate across: depth of thinking, specific examples, lessons learned, stakeholder awareness, and future application. Keep each response to two to three sentences. Do not give feedback or praise. Ask only questions.",
  },
  {
    id: "M2", title: "Module 2: Strategic Turnaround",
    competencies: ["Strategic Thinking", "Decision Making"], duration: 25,
    levels: ["manager", "senior"],
    caseStudy: {
      background: "MidReach Airlines is a mid-sized full-service carrier headquartered in the region, operating since 2009 following a government-backed launch intended to stimulate regional connectivity and tourism. The airline grew rapidly during its first decade, expanding from 8 to 58 aircraft and from 6 to 34 routes, largely funded by a combination of state equity and commercial debt. For its first ten years of operation, MidReach posted profits in eight of those years, building a loyal corporate travel base and a reputation for consistent service quality in the premium economy and business class segments. The airline's cost base was structured for a period of low fuel prices and limited regional competition, and its commercial strategy relied heavily on a small number of high-yield routes connecting the capital to major European and Asian hubs. Over the past three years, the competitive environment has shifted fundamentally: two well-capitalised low-cost carriers have entered the market, a major regional full-service competitor has launched a loyalty programme that has captured significant corporate accounts, and global fuel prices have surged. The airline's shareholder structure now includes a 34% government stake, a 41% institutional investor stake, and 25% public float, creating a complex governance environment in which commercial decisions have political as well as financial dimensions.",
      currentState: "MidReach has recorded three consecutive quarterly losses totalling USD 94 million. Fuel costs have risen 28% year on year and now represent 38% of total operating costs compared to an industry benchmark of 29%. Two low-cost carriers have captured an estimated 18% of MidReach's former domestic and short-haul market share in less than 24 months. Passenger load factors have dropped from 84% to 71%, with the sharpest decline on six routes that now operate below 60% load. Staff morale is under significant pressure following a 14-month pay freeze, and the airline's union has issued a formal notice of intent to negotiate. The CFO has issued an internal advisory note flagging that at the current rate of cash consumption, the airline has a 14-month operating runway before requiring additional capital injection or restructuring.",
      challenge: "The situation requires a credible, evidence-based recovery strategy that addresses cost, revenue, and people dimensions simultaneously without triggering a loss of confidence among investors, staff, or regulators. The government stake creates political sensitivity around any route suspension that affects regional connectivity. The institutional investor bloc is pushing for rapid restructuring. Staff morale is fragile and any perception of unfair treatment during the recovery process risks accelerating attrition of experienced crew and engineers. The recovery plan must be realistic, sequenced, and financially credible while preserving the airline's long-term competitive positioning.",
      yourRole: "You are the newly appointed Director of Network Strategy at MidReach Airlines, joining three weeks ago from a strategy consulting background with specific experience in airline turnarounds in Southeast Asia and Europe. You report directly to the CEO and will present your recovery plan to the full Board at the end of the 90-day period. You have been allocated a USD 50 million strategic investment budget and have authority to commission analysis, engage external advisors, and make recommendations across network, fleet, commercial, and people strategy.",
    },
    caseStudySimple: {
      background: "MidReach Airlines has been operating for 15 years and was originally set up with government support to improve regional air connections. The airline grew quickly and made profits for most of its early years. It built a good reputation among business travellers and was known for reliable service in business and premium economy class. However, the airline's cost structure was built for a time when fuel was cheap and there was less competition in the market. Over the past three years, two new low-cost airlines have entered the same routes and a larger competitor has launched a loyalty programme that has attracted many of MidReach's regular customers. The airline now faces a serious financial challenge that requires urgent and well-considered action.",
      currentState: "MidReach has lost money for three consecutive quarters, with total losses of USD 94 million. Fuel costs have risen sharply and are now significantly above the industry average as a proportion of total costs. Two competitor airlines have taken away around 18% of the customers who used to fly with MidReach. Seat occupancy on flights has dropped from 84% to 71%, with some routes now less than 60% full. Staff have not received a pay rise in over a year and the union has formally requested negotiations.",
      challenge: "The airline needs a credible recovery plan that tackles costs, revenue, and staff morale at the same time. Some routes may need to be stopped to reduce losses, but the government shareholder has concerns about cutting routes that serve smaller regional destinations. Institutional investors want to see a specific and realistic plan within 90 days. Staff are worried about their jobs and their pay, and losing experienced people would make recovery even harder.",
      yourRole: "You are a Strategy Manager at MidReach Airlines, recently appointed to support the Director of Network Strategy in developing the 90-day recovery plan. You have been asked to prepare and present a strategic overview covering priorities, resource allocation, and sequencing. You report to the Director of Network Strategy and your work will feed directly into the Board presentation.",
    },
    questions: [
      { id: "Q1", text: "Drawing on the information provided, identify the three most critical strategic priorities for MidReach's recovery and explain the evidence base for each. Then describe how you would sequence these priorities across a three-year recovery horizon, distinguishing between what must happen in Year 1 to stabilise the business, Year 2 to reposition it, and Year 3 to drive selective growth.", textSimple: "Looking at the information provided, what are the three most important things MidReach needs to focus on to recover? Why did you choose each one and what evidence from the case supports your choice? How would you spread these priorities across three years?", competency: "Strategic Thinking" },
      { id: "Q2", text: "The CFO has presented you with two immediate options: Option A is to suspend the six routes operating below 60% load factor, generating estimated annual savings of USD 8 million but resulting in the redundancy of approximately 340 operational staff and triggering political sensitivity given the government shareholder's regional connectivity mandate. Option B is to invest USD 12 million from the strategic budget in a fleet efficiency upgrade programme projected to reduce fuel costs by 11% over 18 months. You cannot pursue both simultaneously given the cash runway constraint. Walk through your complete decision-making process, including what additional information you would seek, what framework you would apply, and what recommendation you would make and why.", textSimple: "The finance team has given you two choices. Option A: stop six low-performing routes and save USD 8 million a year, but 340 staff would lose their jobs and the government shareholder may object. Option B: spend USD 12 million on improving the aircraft engines to save fuel costs, but this takes 18 months to show results. You cannot do both at once. How do you decide?", competency: "Decision Making" },
      { id: "Q3", text: "Prepare a detailed allocation of the USD 50 million strategic investment budget across the key initiatives in your recovery plan. For each allocation, state the amount, the strategic rationale, the expected outcome, and the timeline for results. Your total must equal USD 50 million.", textSimple: "You have USD 50 million to invest in the airline's recovery. How would you divide this money across different areas of the business? For each area, state how much you would spend, why you would spend it there, what you expect it to achieve, and when you expect to see results. Your total must add up to exactly USD 50 million.", competency: "Strategic Thinking" },
    ],
    guide: [
      { qId: "Q1", competency: "Strategic Thinking", modelAnswer: "Priority 1 is cash stabilisation in Year 1: the 14-month runway is the single most urgent constraint and all other strategic choices must be sequenced around it. This means exiting the six sub-60% load factor routes within 30 days, renegotiating fuel procurement contracts, and freezing all non-essential capital expenditure. Priority 2 is competitive repositioning in Year 2: with the cash position stabilised, the airline must define what it stands for against the low-cost entrants. Priority 3 is selective growth in Year 3: once the cost base is restructured and competitive position is clarified, limited route expansion into underserved markets becomes viable.", strongIndicators: ["Identifies the cash runway as the primary constraint", "Uses specific data from the case to support each priority", "Applies a clear Year 1/2/3 phasing framework", "Acknowledges the political dimension of route suspension", "Connects the competitive analysis to a specific strategic positioning choice"], weakIndicators: ["Lists generic priorities not grounded in the specific case data", "Ignores the 14-month cash runway as the binding constraint", "Proposes growth initiatives in Year 1 before stabilisation", "Does not sequence priorities"], bestAnswer: "A score of 5 response will name all three priorities with specific case evidence, apply a clear sequencing logic tied to the cash runway, acknowledge the political and people dimensions, and demonstrate that recovery strategy is about sequencing and trade-offs.", rolePlayGuide: "The Board member role play tests composure and evidence-based reasoning. A strong candidate will not capitulate to scepticism but will engage with it specifically, referencing data." },
      { qId: "Q2", competency: "Decision Making", modelAnswer: "The decision cannot be made responsibly without first confirming the exact cash position, the legal and contractual obligations around route suspension redundancies, and whether the government shareholder has any veto rights under the shareholder agreement. A binary choice between Options A and B is a false framing. A recommended approach: implement a partial route suspension of the three worst-performing routes immediately to generate approximately USD 4 million in annual savings, use this to extend the runway and create space for the fleet efficiency analysis to be completed rigorously, then make the fleet upgrade decision with better data at the 60-day mark.", strongIndicators: ["Immediately identifies the binary framing as a false choice", "Seeks specific additional information before recommending", "Checks legal and shareholder agreement obligations", "Proposes a sequenced hybrid approach", "Distinguishes between reversible and irreversible decisions"], weakIndicators: ["Makes a firm recommendation without seeking additional information", "Accepts the binary framing without challenging it", "Ignores the political dimension", "Does not consider a phased or hybrid approach"], bestAnswer: "A score of 5 response challenges the binary framing in the first sentence, seeks three to four specific pieces of additional information, proposes a sequenced hybrid approach with specific numbers, and recommends a governance process for the final decision.", rolePlayGuide: "The sceptical Board member will push hardest on the realism of financial projections and the candidate's credibility. A strong candidate will engage each challenge with specific evidence." },
      { qId: "Q3", competency: "Strategic Thinking", modelAnswer: "A well-structured allocation: USD 15 million for fleet efficiency upgrade. USD 12 million for route restructuring and market analysis. USD 10 million for loyalty programme rebuild and digital commercial capability. USD 8 million for people investment including retention payments and change management. USD 5 million held as a contingency reserve. Total: USD 50 million.", strongIndicators: ["Allocations add exactly to USD 50 million", "Each allocation has a stated rationale", "Includes a contingency reserve", "Addresses the people dimension explicitly"], weakIndicators: ["Allocations do not add to USD 50 million", "No rationale provided", "No contingency reserve included"], bestAnswer: "A score of 5 response presents a fully costed allocation that adds to exactly USD 50 million, connects each line to strategic priorities, includes a contingency reserve, and acknowledges the phasing of returns.", rolePlayGuide: "The sceptical Board member will challenge the fleet upgrade allocation and the contingency reserve. A strong candidate will defend both with specific reasoning." },
    ],
    rolePlay: { title: "Role Play: Sceptical Board Member", setup: "You are presenting your 90-day recovery strategy to the MidReach Board. A non-executive Board member with a background in private equity has significant doubts about your plan. They are pushing back hard on the realism of your financial assumptions, the credibility of your USD 50 million allocation, and your personal credibility as someone who joined the organisation only three weeks ago.", setupSimple: "You are presenting your recovery plan to the MidReach leadership team. One senior leader is sceptical and does not believe the plan will work. They are questioning your financial assumptions, your proposed spending, and your experience.", aiRole: "You are a non-executive Board member with a private equity background. Challenge the candidate firmly on: the realism of the 14-month runway figure, the USD 12 million fleet upgrade allocation given the cash constraint, and the candidate's credibility as a three-week hire making USD 50 million decisions. Ask sharp and specific questions. Do not accept vague or generic answers. Keep responses to three to four sentences. Be professional but demanding.", competencies: ["Strategic Thinking", "Decision Making"] },
    simPrompt: "You are a senior aviation strategy assessor on behalf of CCM Consultancy. Never ask the same question twice. Rotate across: evidence base for decisions, risks not mentioned, stakeholder considerations, how they would course-correct if the plan fails, and what success looks like at 12 months. Keep each response to two to three sentences. Do not give feedback. Ask only questions.",
  },
  {
    id: "M3", title: "Module 3: People and Stakeholder Challenge",
    competencies: ["People Leadership", "Communication"], duration: 20,
    levels: ["supervisor", "manager", "senior"],
    caseStudy: {
      background: "SkyServe Airlines is a growing full-service regional carrier operating 62 aircraft across 28 routes, employing 1,400 cabin crew across four bases located in different cities. The airline was founded 18 years ago and has doubled its fleet in the past five years as part of an aggressive regional expansion strategy. Cabin crew are the most visible representation of the SkyServe brand and their conduct, demeanour, and service delivery directly influence passenger loyalty scores and the airline's Net Promoter Score, which sits at 42 compared to a full-service regional benchmark of 58. During the period of rapid growth, the airline's HR and people management infrastructure did not scale at the same pace as the operation. There is no formal performance development framework for cabin crew, appraisals are conducted inconsistently across the four bases, the recognition and reward programme has not been reviewed in six years, and rostering practices vary significantly between bases, creating a persistent perception of unfairness among crew. The Cabin Services leadership team has seen significant turnover at the VP level, with three VPs in four years, each leaving within 18 months of appointment, which has created a leadership vacuum and contributed to a culture of mistrust between frontline crew and senior management.",
      currentState: "An internal engagement survey conducted last quarter reveals that only 38% of cabin crew feel valued by the organisation, down from 61% two years ago. Sickness absence is running at 14% against a full-service airline industry average of 6%, costing the airline an estimated USD 4.2 million annually in sick pay, disruption costs, and overtime. Three of SkyServe's most experienced base managers, each with more than ten years of service, have resigned in the past month. A high-profile passenger complaint about cabin crew conduct on a flagship route was shared on social media eight days ago, has now been viewed 50,000 times, and has generated 340 comments, the majority of which are negative. The union representing cabin crew is due to open formal negotiations in six weeks, and the union representative has publicly stated that the membership's confidence in airline management is at an all-time low.",
      challenge: "You have inherited a team in crisis on your third day in post, with no time to conduct a structured listening exercise before the most urgent issues demand your attention. The viral social media complaint must be addressed publicly in a way that does not inflame the situation further or undermine the cabin crew team. The union negotiation in six weeks must not be allowed to escalate into industrial action that would ground flights. The three base manager vacancies create an immediate leadership gap at the most critical level of the organisation. The underlying causes of low engagement, high absence, and poor retention must be addressed through a credible and specific plan that demonstrates to crew that this VP appointment is different from the previous three.",
      yourRole: "You are the newly appointed VP of Cabin Services at SkyServe Airlines, responsible for the strategic leadership, performance, wellbeing, and development of 1,400 cabin crew across four bases. You report directly to the CEO and have a seat on the airline's executive committee. You have a dedicated HR business partner, a training and standards team of eight, and four base managers (one position currently vacant with two more at risk). This is your third day in the role.",
    },
    caseStudySimple: {
      background: "SkyServe Airlines has been operating for 18 years and has grown quickly over the past five, doubling the number of aircraft in its fleet. The airline has 1,400 cabin crew working from four different bases in different cities. Cabin crew are the most important face of the airline for passengers, and how they perform directly affects whether passengers choose to fly with SkyServe again. As the airline grew, it did not always invest in the tools and systems needed to manage and support its people well. There is no structured way to review or develop cabin crew performance, the recognition programme has not been updated in six years, and different bases treat crew differently when it comes to rosters, which has created a strong feeling of unfairness. Three VPs of Cabin Services have left in the past four years, which means the team has had little consistent leadership and has lost trust in senior management.",
      currentState: "A recent staff survey shows that only 38% of cabin crew feel valued by the airline, compared to 61% two years ago. Many staff are calling in sick, with absence running at more than double the industry average, costing the airline around USD 4.2 million every year. Three experienced base managers have resigned in the past month. A passenger complaint about crew behaviour on a popular route was posted on social media eight days ago and has now been seen by 50,000 people with hundreds of negative comments. The cabin crew union is due to begin formal negotiations in six weeks.",
      challenge: "You have arrived into a very difficult situation on only your third day in the role and there is no time to wait before acting. The social media complaint needs a response that does not make things worse. The union negotiation must be handled carefully so it does not lead to strike action. Three base manager positions need to be filled or covered immediately. The team needs to see and hear from you quickly and to believe that your appointment will make a real difference.",
      yourRole: "You are the newly appointed VP of Cabin Services at SkyServe Airlines. You are responsible for leading, developing, and supporting 1,400 cabin crew across four bases. You report directly to the CEO and are a member of the executive team. This is your third day in the role and the CEO has asked you to stabilise the team and show measurable improvement in engagement and performance within 12 months.",
    },
    questions: [
      { id: "Q1", text: "You are scheduled to address all 1,400 cabin crew across four bases in a series of all-hands sessions beginning in 48 hours. Describe in detail: the key messages you will deliver, the specific commitments you will make, how you will structure the session to create dialogue rather than monologue, and the tone and style you will adopt to begin rebuilding trust with a team that has seen three VPs come and go in four years.", textSimple: "In 48 hours you will speak to all 1,400 of your cabin crew across four bases for the first time as their new leader. What will you say to them? What specific promises will you make? How will you make it a two-way conversation? What tone will you use to help a team that has lost trust in leaders to start trusting you?", competency: "Communication" },
      { id: "Q2", text: "The union representative has contacted you directly requesting an urgent pre-negotiation meeting before the formal talks begin in six weeks. Describe your approach to this meeting: what is your opening position, what are your three non-negotiable red lines, what are the areas where you have genuine flexibility, and how do you build a productive relationship with the union representative given that their members' confidence in management is at an all-time low?", textSimple: "The union representative has asked to meet you before the formal negotiations start in six weeks. How do you prepare for and approach this meeting? What are the things you absolutely will not agree to? Where are you willing to be flexible? How do you start to build a better relationship with the union?", competency: "People Leadership" },
      { id: "Q3", text: "Design a detailed 90-day people leadership plan that specifically addresses the three core issues: low engagement at 38%, absence running at 14%, and the retention crisis among base managers and experienced crew. Your plan must include specific milestones at Day 30, Day 60, and Day 90, measurable targets for each milestone, and a clear description of how you will resource and govern the plan.", textSimple: "Create a detailed 90-day plan to address the three main problems: low engagement, very high absence rates, and experienced people leaving. What specific things will you do and by when? What would success look like at Day 30, Day 60, and Day 90?", competency: "People Leadership" },
    ],
    guide: [
      { qId: "Q1", competency: "Communication", modelAnswer: "The session should open with: I know the last four years have been difficult and I know that three VPs in four years has made it hard to believe that this time will be different. I am not going to ask you to trust me today. I am going to earn that trust. The three specific commitments: a visible leadership presence with each base visited within 30 days, a formal review of rostering fairness completed within 60 days with findings shared transparently, and the launch of a crew recognition programme within 30 days.", strongIndicators: ["Opens by acknowledging the team's specific experience", "Makes three specific and credible commitments with named deadlines", "Structures for dialogue - small group Q&A not open floor", "Distributes a written record of commitments", "Avoids corporate language and generic motivational statements"], weakIndicators: ["Opens with a biography or career history", "Makes generic commitments such as I will listen", "Structures the session as a one-way presentation"], bestAnswer: "A score of 5 response demonstrates understanding of the specific psychological and cultural context of a team that has lost trust. They open with acknowledgement not aspiration, make specific and testable commitments, and design a session format that creates genuine dialogue.", rolePlayGuide: "The resistant crew member role play tests emotional intelligence. A strong candidate will listen without interrupting, ask questions before providing answers, acknowledge the crew member's specific experience including the missed promotion, and make at least one specific commitment about their development." },
      { qId: "Q2", competency: "People Leadership", modelAnswer: "The pre-negotiation meeting should open with listening, not positioning. The VP should arrive with no formal proposal and spend the first 20 minutes asking the union representative what their members most need to feel heard and respected. The three non-negotiable red lines are: no blanket amnesty for verified conduct violations that compromise passenger safety, no pay commitments that exceed the approved budget envelope without Board authorisation, and no changes to safety-critical rostering standards without sign-off from the Director of Flight Operations.", strongIndicators: ["Opens the meeting by listening rather than presenting a position", "Clearly defines three specific non-negotiable red lines", "Identifies genuine areas of flexibility", "Proposes a partnership framing rather than adversarial positioning"], weakIndicators: ["Arrives with a formal opening position", "Cannot define any red lines", "Cannot identify any areas of genuine flexibility", "Treats the meeting as adversarial from the first exchange"], bestAnswer: "A score of 5 response demonstrates sophisticated stakeholder leadership: the ability to engage constructively with a party whose interests are not always aligned, while maintaining clear boundaries.", rolePlayGuide: "The resistant crew member role play specifically tests whether the candidate can move someone from resistance to cautious openness through the quality of their listening." },
      { qId: "Q3", competency: "People Leadership", modelAnswer: "Day 1 to 30: visit all four bases within 30 days, completing structured listening sessions. Appoint an interim base manager from the existing senior crew pool. Review absence data by base. Launch the crew recognition programme with nominations open in Week 2. Day 31 to 60: publish findings from listening sessions to all crew within 48 hours of the final session. Complete the rostering fairness audit with union involvement. Launch a structured absence support programme. Day 61 to 90: implement the top three changes identified in listening sessions. Confirm the permanent base manager appointment. Run a three-question pulse survey across all crew. Target: engagement improvement of at least 5 percentage points, absence below 11%.", strongIndicators: ["Clear and specific milestones at Day 30, 60, and 90 with measurable targets", "Addresses all three core issues: engagement, absence, and retention", "Listens before acting", "Publishes findings transparently"], weakIndicators: ["Milestones are vague with no specific actions or targets", "Jumps to solutions in the first 30 days without a structured listening phase", "No mechanism for closing the feedback loop with crew"], bestAnswer: "A score of 5 response presents a 90-day plan that is specific, sequenced, measurable, and realistic. The candidate demonstrates that listening must precede action.", rolePlayGuide: "The resistant crew member has 15 years of service, was informally promised a base manager role that went to an external hire, and has not had a meaningful development conversation in three years. A strong candidate will acknowledge all three grievances specifically." },
    ],
    rolePlay: { title: "Role Play: Resistant Long-Serving Crew Member", setup: "You are meeting one-to-one with a long-serving cabin crew member who has 15 years of service with SkyServe, holds a senior crew designation, and has been visibly disengaged for the past six months. You have been told this crew member was given an informal indication by a previous base manager that they would be considered for the next base manager vacancy, which was then filled by an external hire eight months ago. They have not had a formal development conversation in over three years.", setupSimple: "You are meeting one-to-one with a senior cabin crew member who has worked at SkyServe for 15 years. A previous manager informally promised them the next base manager job, which was then given to someone hired from outside. They have not had any career development conversation in over three years.", aiRole: "You are a long-serving cabin crew member with 15 years at SkyServe. You are defensive, guarded, and deeply sceptical of new leadership. You were informally promised a base manager role and it went to an external hire. You have not had a development conversation in three years. Open with minimal engagement. Reveal frustrations gradually only when pressed with genuine curiosity. If the candidate listens without interrupting, acknowledges each specific grievance, and makes at least one concrete commitment about your development, begin to soften. If dismissive or offering generic reassurance, become more resistant. Keep responses to two to four sentences.", competencies: ["People Leadership", "Communication"] },
    simPrompt: "You are a senior people and leadership assessor on behalf of CCM Consultancy. Never repeat a question. Rotate across: how they build trust quickly, how they handle resistance, their approach to the union relationship, how they prioritise competing demands, and their personal leadership style. Keep each response to two to three sentences. Do not give feedback. Ask only questions.",
  },
];

const DEVELOPMENT_ACTIVITIES = {
  Communication: {
    onJob: ["Volunteer to lead the next team briefing or operational update meeting and ask a colleague to give you feedback on clarity and audience awareness afterwards.", "Take on responsibility for drafting one stakeholder communication per week and review it with your line manager before sending.", "During your next crisis or high-pressure situation, keep a real-time log of every communication decision you make, including who you contacted, in what order, and why. Review this log in your next one-to-one."],
    social: ["Ask your line manager to observe one of your team briefings and provide structured feedback on your communication style and audience engagement.", "Request to be mentored by a senior communications or operations leader who manages regular high-stakes stakeholder communications. Ask to shadow them in at least two live situations."],
    formal: ["Complete the course Communication Foundations on LinkedIn Learning (approximately 1.5 hours) focusing on adapting style for different audiences.", "Complete Crisis Communication on Coursera offered by the University of Washington (approximately 8 hours) to build a structured framework for communicating under pressure."],
  },
  Accountability: {
    onJob: ["In your next team meeting, introduce a brief lessons learned segment where the team reviews one recent issue and identifies what systemic change would prevent recurrence.", "When something goes wrong in your area of responsibility, practice writing a one-page accountability memo to yourself that distinguishes between what you personally owned, what was a systemic failure, and what you would do differently.", "Set up a simple accountability tracker for your team that logs commitments made, deadlines, and outcomes. Review it weekly."],
    social: ["Ask your line manager to coach you on how to conduct a post-incident debrief that balances accountability with psychological safety.", "Request a mentoring conversation with a senior leader who has navigated a significant accountability challenge."],
    formal: ["Complete Developing a Culture of Accountability on LinkedIn Learning (approximately 1 hour).", "Complete Organizational Leadership on Coursera offered by Northwestern University (approximately 4 hours) with a focus on the accountability and governance modules."],
  },
  "Strategic Thinking": {
    onJob: ["Over the next 30 days, write a one-page strategic analysis of a challenge your team or department is facing. Include a SWOT analysis, at least three strategic options, and a recommended course of action with rationale.", "In your next planning cycle, deliberately take a three-year view before a three-month view. Write down what success looks like in three years and work backwards to identify what must happen in the next 90 days.", "Identify one decision you are involved in over the next month and map out the second and third-order consequences of each option before making a recommendation."],
    social: ["Ask your line manager to include you in one strategic planning or business review meeting above your current level as a learning opportunity.", "Request a mentoring relationship with a senior leader who has experience in strategic planning."],
    formal: ["Complete Strategic Planning and Execution on Coursera offered by the University of Virginia Darden School (approximately 10 hours).", "Complete Business Strategy on LinkedIn Learning (approximately 2 hours)."],
  },
  "Decision Making": {
    onJob: ["For the next four weeks, document every significant decision you make using a simple framework: what was the question, what options did you consider, what information did you have and what were you missing, and what was your rationale.", "In your next team challenge, deliberately pause before deciding and ask two colleagues for their perspective before forming your recommendation.", "Identify a recent decision that did not go as planned. Write a one-page retrospective."],
    social: ["Ask your line manager to coach you on how they approach high-stakes decisions under time pressure.", "Request to be included in a decision-making process above your current level as an observer. Prepare your own recommendation in advance and debrief with your manager."],
    formal: ["Complete Decision Making and Scenarios on Coursera offered by the University of Cape Town (approximately 6 hours).", "Complete Making Evidence-Based Management Decisions on LinkedIn Learning (approximately 1 hour)."],
  },
  "People Leadership": {
    onJob: ["In your next one-to-one with each team member, ask three questions you have never asked before: what is one thing about your role that you find most meaningful, what is one thing that gets in the way of your best work, and what would help you grow in the next six months.", "Over the next 30 days, make a deliberate effort to recognise one team member per day for a specific contribution.", "Identify one team member who is underperforming and schedule a structured conversation using the SBI feedback model (Situation, Behaviour, Impact)."],
    social: ["Ask your line manager to coach you on how they have managed a resistant or disengaged team member.", "Request a mentoring relationship with an experienced people leader who has led through a significant team challenge such as a restructure or culture change."],
    formal: ["Complete Leading with Emotional Intelligence on LinkedIn Learning (approximately 2.5 hours).", "Complete Inspiring and Motivating Individuals on Coursera offered by the University of Michigan (approximately 6 hours)."],
  },
};

const COMPETENCY_KEYWORDS = {
  Communication: ["communicated", "message", "stakeholder", "informed", "briefed", "transparent", "listen", "audience", "clarity", "update", "told", "shared", "announced", "tone", "channel", "statement", "media"],
  Accountability: ["responsible", "own", "accountable", "consequence", "learn", "mistake", "system", "process", "prevent", "fault", "review", "debrief", "ownership", "escalate", "protocol"],
  "Strategic Thinking": ["long-term", "priority", "horizon", "competitive", "position", "invest", "trend", "data", "framework", "align", "vision", "roadmap", "sequence", "phase", "restructure", "reposition"],
  "Decision Making": ["decided", "weighed", "trade-off", "risk", "evidence", "criteria", "option", "chose", "rationale", "impact", "analysed", "assessed", "modelled", "recommend", "framework"],
  "People Leadership": ["team", "morale", "trust", "engage", "motivate", "culture", "coach", "empower", "recognition", "support", "listen", "development", "wellbeing", "union", "retention", "absence"],
};

function detectCompetency(text) {
  if (!text) return "General Leadership";
  const lower = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const [comp, kws] of Object.entries(COMPETENCY_KEYWORDS)) {
    const score = kws.filter(k => lower.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = comp; }
  }
  return best || "General Leadership";
}

function formatTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function isSimple(level) { return level === "frontline" || level === "supervisor"; }
const LEVEL_LABELS = { frontline: "Front-line", supervisor: "Supervisor", manager: "Manager", senior: "Senior Leader" };

const S = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "Arial,sans-serif" },
  header: { background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1.25rem" },
  btn: (bg, color, extra = {}) => ({ padding: "9px 18px", background: bg, color, border: `1px solid ${bg === "#fff" ? "#ddd" : bg}`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, ...extra }),
  input: { padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, color: "#111", outline: "none", background: "#fff", width: "100%", boxSizing: "border-box" },
  badge: (bg, color) => ({ fontSize: 11, background: bg, color, padding: "3px 10px", borderRadius: 20, border: `1px solid ${color}22`, fontWeight: 500, display: "inline-block" }),
  label: { fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px", display: "block" },
};

function buildDevPlanHTML(comps) {
  return comps.map(comp => {
    const acts = DEVELOPMENT_ACTIVITIES[comp];
    if (!acts) return "";
    return `<div style="margin-bottom:2rem;padding:1.25rem;border:1px solid #e5e5e5;border-radius:10px">
      <h3 style="color:#E8251A;margin:0 0 1rem;font-size:16px">${comp}</h3>
      <div style="margin-bottom:1rem"><p style="font-weight:700;font-size:13px;color:#555;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 0.5rem">70% - On the job</p><ol style="padding-left:1.25rem;margin:0">${acts.onJob.map(a => `<li style="margin-bottom:8px;font-size:13px;line-height:1.7;color:#333">${a}</li>`).join("")}</ol></div>
      <div style="margin-bottom:1rem"><p style="font-weight:700;font-size:13px;color:#555;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 0.5rem">20% - Learning from others</p><ol style="padding-left:1.25rem;margin:0">${acts.social.map(a => `<li style="margin-bottom:8px;font-size:13px;line-height:1.7;color:#333">${a}</li>`).join("")}</ol></div>
      <div><p style="font-weight:700;font-size:13px;color:#555;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 0.5rem">10% - Formal learning</p><ol style="padding-left:1.25rem;margin:0">${acts.formal.map(a => `<li style="margin-bottom:8px;font-size:13px;line-height:1.7;color:#333">${a}</li>`).join("")}</ol></div>
    </div>`;
  }).join("");
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState({});
  const [ratings, setRatings] = useState({});
  const [reportData, setReportData] = useState({});
  const [reportRequests, setReportRequests] = useState({});
  const [promotionRecs, setPromotionRecs] = useState({});
  const [settings, setSettings] = useState({ assessor_name: "", client_name: "", weight_written: "30", weight_interview: "40", weight_roleplay: "30" });
  const [clientLogo, setClientLogo] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [modulePhase, setModulePhase] = useState("intro");
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timer, setTimer] = useState(0);
  const [simMessages, setSimMessages] = useState([]);
  const [simInput, setSimInput] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [simPhase, setSimPhase] = useState("interview");
  const [exchangeCount, setExchangeCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedMod, setSelectedMod] = useState(null);
  const [assessorInput, setAssessorInput] = useState("");
  const [assessorMessages, setAssessorMessages] = useState([]);
  const [assessorLoading, setAssessorLoading] = useState(false);
  const [livePart, setLivePart] = useState(null);
  const [liveMod, setLiveMod] = useState(null);
  const [presetCat, setPresetCat] = useState("Communication");
  const [presetQuestions, setPresetQuestions] = useState(DEFAULT_PRESET_QUESTIONS);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionComp, setNewQuestionComp] = useState("Communication");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [guideModule, setGuideModule] = useState(null);
  const [expandedGuideQ, setExpandedGuideQ] = useState(null);
  const [aiRatings, setAiRatings] = useState({});
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showRubric, setShowRubric] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: "", level: "manager", role: "", username: "", password: "" });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [ratingNotes, setRatingNotes] = useState({});
  const [notification, setNotification] = useState(null);
  const [approvalSaved, setApprovalSaved] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const simEndRef = useRef(null);
  const assessorEndRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const refreshRef = useRef(null);

  useEffect(() => { simEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [simMessages]);
  useEffect(() => { assessorEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [assessorMessages]);
  useEffect(() => {
    if (modulePhase === "written") { timerRef.current = setInterval(() => setTimer(t => t + 1), 1000); }
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [modulePhase]);
  useEffect(() => { loadSettings(); loadParticipants(); }, []);

  // Auto-refresh for participant portal every 30 seconds
  useEffect(() => {
    if (screen === "participant" && user) {
      refreshRef.current = setInterval(() => loadUserData(user.id), 30000);
    }
    return () => clearInterval(refreshRef.current);
  }, [screen, user]);

  async function loadSettings() {
    try {
      const data = await sb("ac_settings", "GET", null, "?select=key,value");
      if (data) { const s = {}; data.forEach(r => { s[r.key] = r.value; }); setSettings(prev => ({ ...prev, ...s })); }
    } catch { }
  }

  async function loadParticipants() {
    try { const data = await sb("ac_participants", "GET", null, "?select=*&order=created_at.asc"); if (data) setParticipants(data); } catch { }
  }

  async function loadUserData(pid) {
    try {
      const [res, rat, req] = await Promise.all([
        sb("ac_results", "GET", null, `?participant_id=eq.${pid}&select=*`),
        sb("ac_ratings", "GET", null, `?participant_id=eq.${pid}&select=*`),
        sb("ac_report_requests", "GET", null, `?participant_id=eq.${pid}&select=*`),
      ]);
      const nr = {};
      (res || []).forEach(r => { nr[r.module_id] = { answers: r.answers || {}, timeSpent: r.time_spent || 0, completedAt: r.completed_at, simMessages: r.sim_messages || [] }; });
      setResults(prev => ({ ...prev, [pid]: nr }));
      const nRat = {}, nRd = {}, nAi = {};
      (rat || []).forEach(r => { nRat[`${pid}-${r.module_id}`] = r.ratings || {}; nRd[`${pid}-${r.module_id}`] = r.report_data || {}; nAi[`${pid}-${r.module_id}`] = r.ai_ratings || {}; });
      setRatings(prev => ({ ...prev, ...nRat })); setReportData(prev => ({ ...prev, ...nRd })); setAiRatings(prev => ({ ...prev, ...nAi }));
      const nReq = {};
      (req || []).forEach(r => { nReq[`${pid}-${r.module_id}`] = r.status; });
      const prevReqs = { ...reportRequests };
      setReportRequests(prev => ({ ...prev, ...nReq }));
      // Check for newly approved reports and show notification
      Object.entries(nReq).forEach(([key, status]) => {
        if (status === "approved" && prevReqs[key] !== "approved") {
          setNotification({ type: "success", message: "Your development report has been approved and is ready to download!" });
          setTimeout(() => setNotification(null), 8000);
        }
      });
    } catch { }
  }

  async function loadAllData() {
    try {
      const [res, rat, req] = await Promise.all([
        sb("ac_results", "GET", null, "?select=*"),
        sb("ac_ratings", "GET", null, "?select=*"),
        sb("ac_report_requests", "GET", null, "?select=*"),
      ]);
      const nr = {};
      (res || []).forEach(r => { if (!nr[r.participant_id]) nr[r.participant_id] = {}; nr[r.participant_id][r.module_id] = { answers: r.answers || {}, timeSpent: r.time_spent || 0, completedAt: r.completed_at, simMessages: r.sim_messages || [] }; });
      setResults(nr);
      const nRat = {}, nRd = {}, nAi = {};
      (rat || []).forEach(r => { nRat[`${r.participant_id}-${r.module_id}`] = r.ratings || {}; nRd[`${r.participant_id}-${r.module_id}`] = r.report_data || {}; nAi[`${r.participant_id}-${r.module_id}`] = r.ai_ratings || {}; });
      setRatings(nRat); setReportData(nRd); setAiRatings(nAi);
      const nReq = {};
      (req || []).forEach(r => { nReq[`${r.participant_id}-${r.module_id}`] = r.status; });
      setReportRequests(nReq);
    } catch { }
  }

  async function handleLogin() {
    setLoading(true); setLoginError("");
    try {
      if (loginForm.username === "admin" && loginForm.password === "ccm2024") {
        setRole("admin"); setUser({ name: "Administrator" }); await loadAllData(); await loadParticipants(); setScreen("admin");
      } else {
        const data = await sb("ac_participants", "GET", null, `?username=eq.${loginForm.username}&password=eq.${loginForm.password}&select=*`);
        if (data && data.length > 0) {
          const p = data[0]; setRole("participant"); setUser(p); await loadUserData(p.id); setScreen("participant");
        } else setLoginError("Incorrect username or password. Please try again.");
      }
    } catch { setLoginError("Connection error. Please try again."); }
    setLoading(false);
  }

  async function saveResult(pid, mid, answersData, timeSpent, msgs) {
    try { await sb("ac_results", "POST", { participant_id: pid, module_id: mid, answers: answersData, time_spent: timeSpent, completed_at: new Date().toISOString(), sim_messages: msgs || [], updated_at: new Date().toISOString() }, ""); } catch (e) { console.error(e); }
  }

  async function saveRatings(pid, mid, ratingData, aiData, rdData) {
    try { await sb("ac_ratings", "POST", { participant_id: pid, module_id: mid, ratings: ratingData, ai_ratings: aiData || {}, report_data: rdData || {}, updated_at: new Date().toISOString() }, ""); } catch (e) { console.error(e); }
  }

  async function saveReportRequest(pid, mid, status) {
    try {
      await sb("ac_report_requests", "POST", { participant_id: pid, module_id: mid, status, requested_at: new Date().toISOString(), approved_at: status === "approved" ? new Date().toISOString() : null }, "");
      setReportRequests(r => ({ ...r, [`${pid}-${mid}`]: status }));
      if (status === "approved") {
        setApprovalSaved(prev => ({ ...prev, [`${pid}-${mid}`]: true }));
        setTimeout(() => setApprovalSaved(prev => ({ ...prev, [`${pid}-${mid}`]: false })), 3000);
      }
    } catch (e) { console.error(e); }
  }

  async function saveAllSettings() {
    setSavingSettings(true);
    try {
      await Promise.all(Object.entries({ assessor_name: settings.assessor_name, client_name: settings.client_name, weight_written: settings.weight_written, weight_interview: settings.weight_interview, weight_roleplay: settings.weight_roleplay }).map(([k, v]) => sb("ac_settings", "POST", { key: k, value: v, updated_at: new Date().toISOString() }, "")));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch { }
    setSavingSettings(false);
  }

  async function deleteParticipant(pid) {
    try {
      await Promise.all([
        sb("ac_results", "DELETE", null, `?participant_id=eq.${pid}`),
        sb("ac_ratings", "DELETE", null, `?participant_id=eq.${pid}`),
        sb("ac_report_requests", "DELETE", null, `?participant_id=eq.${pid}`),
        sb("ac_participants", "DELETE", null, `?id=eq.${pid}`),
      ]);
      await loadParticipants();
      setConfirmDelete(null);
    } catch (e) { alert("Could not remove participant. Please try again."); }
  }

  function getModules(u) {
    const map = { frontline: ["M1"], supervisor: ["M1", "M3"], manager: ["M1", "M2", "M3"], senior: ["M1", "M2", "M3"] };
    return MODULES.filter(m => (map[u.level] || []).includes(m.id));
  }

  function startModule(mod) {
    setActiveModule(mod); setAnswers({}); setCurrentQ(0); setTimer(0);
    setSimMessages([]); setSimPhase("interview"); setExchangeCount(0); setModulePhase("intro"); setScreen("module");
  }

  function getCS(mod) { return isSimple(user?.level) ? mod.caseStudySimple : mod.caseStudy; }
  function getQ(q) { return isSimple(user?.level) ? (q.textSimple || q.text) : q.text; }

  async function submitWritten() {
    await saveResult(user.id, activeModule.id, answers, timer, []);
    setResults(r => ({ ...r, [user.id]: { ...(r[user.id] || {}), [activeModule.id]: { answers, timeSpent: timer, completedAt: new Date().toISOString(), simMessages: [] } } }));
    setModulePhase("sim"); setSimMessages([]); setSimPhase("interview"); setExchangeCount(0);
    const assessorN = settings.assessor_name || "the CCM Consultancy Assessor";
    const greeting = `Good morning, and welcome to today's competency-based interview. My name is ${assessorN} and I will be your assessor today. We will be exploring a number of competencies based on the scenario you have just completed. Please take your time with each response. Let us begin - could you start by walking me through your overall approach to the scenario you were presented with?`;
    setSimMessages([{ role: "assessor", text: greeting }]);
    speak(greeting);
    startCamera();
  }

  async function finishModule() {
    await saveResult(user.id, activeModule.id, answers, timer, simMessages);
    setResults(r => ({ ...r, [user.id]: { ...(r[user.id] || {}), [activeModule.id]: { ...(r[user.id]?.[activeModule.id] || {}), simMessages } } }));
    stopCamera(); setScreen("participant"); setActiveModule(null); setModulePhase("intro");
  }

  function startRolePlay() {
    setSimPhase("roleplay"); setSimMessages([]); setExchangeCount(0);
    const setup = isSimple(user?.level) ? activeModule.rolePlay.setupSimple : activeModule.rolePlay.setup;
    const opening = `We will now move into a role play exercise. ${setup} I will now begin in character. Please respond as you would in the real situation.`;
    setSimMessages([{ role: "assessor", text: opening }]); speak(opening);
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.rate = 0.92; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }

  async function callSimAI(userMsg, phase) {
    if (!userMsg.trim()) return;
    setSimMessages(m => [...m, { role: "participant", text: userMsg, competency: detectCompetency(userMsg) }]);
    setSimInput(""); setSimLoading(true);
    const currentCount = exchangeCount + 1; setExchangeCount(currentCount);
    try {
      const assessorN = settings.assessor_name || "the CCM Consultancy Assessor";
      const systemPrompt = phase === "roleplay"
        ? activeModule.rolePlay.aiRole
        : `${activeModule.simPrompt} Your name is ${assessorN}. Never repeat a question. Vary across: specific examples, challenging assumptions, lessons learned, stakeholder impact, and what they would do differently. You have had ${currentCount} exchanges. After 8 exchanges begin to wrap up naturally. Do not use em dashes.`;
      const history = [{ role: "user", content: "Begin." }, ...simMessages.map(m => ({ role: m.role === "assessor" ? "assistant" : "user", content: m.text })), { role: "user", content: userMsg }];
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, system: systemPrompt, messages: history }) });
      const data = await res.json();
      const text = data.content?.[0]?.text || "Could you give me a specific example of that from your experience?";
      setSimMessages(m => [...m, { role: "assessor", text }]); speak(text);
    } catch {
      const f = "Could you walk me through a specific example of how you would approach that?";
      setSimMessages(m => [...m, { role: "assessor", text: f }]); speak(f);
    }
    setSimLoading(false);
  }

  function sendSimMessage() { if (simInput.trim()) callSimAI(simInput.trim(), simPhase); }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input requires Google Chrome."); return; }
    const r = new SR(); r.continuous = false; r.interimResults = false; r.lang = "en-US";
    r.onresult = e => { setSimInput(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false); r.onend = () => setIsListening(false);
    recognitionRef.current = r; r.start(); setIsListening(true);
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream; setCameraActive(true); setCameraError("");
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } }, 300);
    } catch { setCameraError("Camera access denied. Please allow camera access in your browser settings."); }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null; setCameraActive(false);
  }

  async function sendAssessorQ(text) {
    if (!text.trim() || !livePart || !liveMod) return;
    const mod = MODULES.find(m => m.id === liveMod);
    setAssessorMessages(m => [...m, { role: "assessor", text }]); setAssessorLoading(true); setAssessorInput("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 400, system: "You are an expert assessment centre analyst for CCM Consultancy. Do not use em dashes. Use hyphens or commas instead.", messages: [{ role: "user", content: `Question: "${text}"\nModule: ${mod?.title}\nCompetencies: ${mod?.competencies?.join(", ")}\n\nProvide:\n1. Competency being probed\n2. Strong answer indicators (3 bullets)\n3. Red flags (2 bullets)` }] }) });
      const data = await res.json();
      setAssessorMessages(m => [...m, { role: "ai_feedback", text: data.content?.[0]?.text || "Analysis unavailable." }]);
    } catch { setAssessorMessages(m => [...m, { role: "ai_feedback", text: "Unable to generate feedback." }]); }
    setAssessorLoading(false);
  }

  async function generateAIRatings(pid, mid) {
    const p = participants.find(x => x.id === pid);
    const mod = MODULES.find(m => m.id === mid);
    const r = results[pid]?.[mid];
    if (!p || !mod) { alert("No participant or module data found."); return; }
    setGeneratingReport(true);
    try {
      const answersText = mod.questions.map(q => `[${q.competency}] Q: ${q.text}\nA: ${r?.answers?.[q.id] || "No answer provided"}`).join("\n\n");
      const transcriptText = (r?.simMessages || []).filter(m => m.text).map(m => `${m.role === "assessor" ? "Assessor" : "Candidate"}: ${m.text}`).join("\n").substring(0, 3000);
      const prompt = `You are an expert assessment centre analyst for CCM Consultancy. Do not use em dashes. Use hyphens or commas instead.\n\nParticipant: ${p.name}\nRole: ${p.role || "Not specified"}\nLevel: ${LEVEL_LABELS[p.level] || p.level}\nModule: ${mod.title}\nCompetencies: ${mod.competencies.join(", ")}\n\nAnswers:\n${answersText}\n\nTranscript:\n${transcriptText || "No interview transcript available."}\n\nRate each competency 1-5. Return valid JSON only:\n{"ratings":{"${mod.competencies[0]}":3${mod.competencies[1] ? `,"${mod.competencies[1]}":3` : ""}},"interpretations":{"${mod.competencies[0]}":"2-3 sentence third person interpretation"${mod.competencies[1] ? `,"${mod.competencies[1]}":"interpretation"` : ""}},"strengths":{"${mod.competencies[0]}":"2-3 specific strengths"${mod.competencies[1] ? `,"${mod.competencies[1]}":"strengths"` : ""}},"improvements":{"${mod.competencies[0]}":"2-3 areas for improvement"${mod.competencies[1] ? `,"${mod.competencies[1]}":"improvements"` : ""}},"overallNarrative":"3-4 sentence summary","developmentPlan":["action 1","action 2","action 3"]}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system: "Return only valid JSON. No markdown. No em dashes.", messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      if (!data.content?.[0]?.text) throw new Error("No response");
      const parsed = JSON.parse(data.content[0].text.replace(/```json|```/g, "").replace(/\u2014/g, "-").trim());
      if (!parsed.ratings) throw new Error("Invalid structure");
      const key = `${pid}-${mid}`;
      setAiRatings(prev => ({ ...prev, [key]: parsed })); setRatings(prev => ({ ...prev, [key]: parsed.ratings || {} })); setReportData(prev => ({ ...prev, [key]: parsed }));
      await saveRatings(pid, mid, parsed.ratings || {}, parsed, parsed);
    } catch (e) {
      console.error(e);
      const mod2 = MODULES.find(m => m.id === mid);
      const fb = {}; mod2?.competencies.forEach(c => { fb[c] = 3; });
      const fallback = { ratings: fb, interpretations: {}, strengths: {}, improvements: {}, overallNarrative: "Please review the written responses and adjust the ratings manually.", developmentPlan: [] };
      const key = `${pid}-${mid}`;
      setAiRatings(prev => ({ ...prev, [key]: fallback })); setRatings(prev => ({ ...prev, [key]: fb })); setReportData(prev => ({ ...prev, [key]: fallback }));
      await saveRatings(pid, mid, fb, fallback, fallback);
      alert("AI ratings could not be generated automatically. Default scores of 3 have been applied. Please review and adjust manually.");
    }
    setGeneratingReport(false);
  }

  async function updateRating(pid, mid, comp, score) {
    const key = `${pid}-${mid}`;
    const newR = { ...(ratings[key] || {}), [comp]: score };
    setRatings(prev => ({ ...prev, [key]: newR }));
    await saveRatings(pid, mid, newR, aiRatings[key] || {}, reportData[key] || {});
  }

  function getWeightedScore(pid, mid) {
    const r = ratings[`${pid}-${mid}`] || {};
    const vals = Object.values(r);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10;
  }

  const weights = { written: parseInt(settings.weight_written) || 30, interview: parseInt(settings.weight_interview) || 40, roleplay: parseInt(settings.weight_roleplay) || 30 };
  const totalWeight = weights.written + weights.interview + weights.roleplay;

  async function downloadAssessorPDF(pid, mid) {
    const p = participants.find(x => x.id === pid);
    const mod = MODULES.find(m => m.id === mid);
    const r = results[pid]?.[mid];
    const rd = reportData[`${pid}-${mid}`];
    const rts = ratings[`${pid}-${mid}`] || {};
    const promRec = promotionRecs[`${pid}-${mid}`] || "";
    const promLabel = PROMOTION_OPTIONS.find(o => o.value === promRec)?.label || "Not yet selected";
    if (!p || !mod || !r) { alert("No completed assessment data available yet."); return; }

    const jsPDF = await loadJsPDF();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, margin = 20, cW = W - margin * 2;
    let y = margin;

    const addText = (text, x, fontSize = 11, bold = false, color = [17, 17, 17]) => {
      doc.setFontSize(fontSize); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text), cW - (x - margin));
      doc.text(lines, x, y); y += lines.length * (fontSize * 0.45) + 2; return lines.length;
    };

    const addSection = (title) => {
      if (y > 260) { doc.addPage(); y = margin; }
      y += 4; doc.setFillColor(232, 37, 26); doc.rect(margin, y, cW, 0.5, "F"); y += 4;
      addText(title, margin, 13, true, [232, 37, 26]); y += 2;
    };

    const checkPage = (needed = 20) => { if (y + needed > 275) { doc.addPage(); y = margin; } };

    // Header
    doc.setFillColor(232, 37, 26); doc.rect(0, 0, 210, 12, "F");
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("CCM CONSULTANCY", margin, 8);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("ASSESSMENT CENTRE - ASSESSOR REPORT (CONFIDENTIAL)", W - margin, 8, { align: "right" });
    y = 22;

    addText("Assessment Centre - Assessor Report", margin, 16, true, [17, 17, 17]); y += 2;
    addText(`Prepared by CCM Consultancy | ${new Date().toLocaleDateString()}`, margin, 9, false, [120, 120, 120]); y += 6;

    // Participant details table
    const rows = [["Participant", p.name, "Level", LEVEL_LABELS[p.level]], ["Role assessed", p.role || "Not specified", "Assessor", settings.assessor_name || "CCM Consultancy"], ["Module", mod.title, "Date", new Date().toLocaleDateString()], ["Time on written task", `${Math.round((r.timeSpent || 0) / 60)} minutes`, "Weightings", `Written ${weights.written}% / Interview ${weights.interview}% / Role play ${weights.roleplay}%`]];
    doc.setFillColor(245, 245, 245);
    rows.forEach((row, i) => {
      checkPage(10);
      if (i % 2 === 0) doc.setFillColor(249, 249, 249); else doc.setFillColor(255, 255, 255);
      doc.rect(margin, y - 4, cW, 9, "F");
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80); doc.text(row[0], margin + 2, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(17, 17, 17); doc.text(String(row[1]).substring(0, 40), margin + 45, y);
      doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80); doc.text(row[2], margin + 105, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(17, 17, 17); doc.text(String(row[3]).substring(0, 35), margin + 148, y);
      y += 9;
    });
    y += 4;

    // Confidential notice
    checkPage(12);
    doc.setFillColor(255, 241, 241); doc.rect(margin, y - 4, cW, 10, "F");
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(153, 27, 27);
    doc.text("CONFIDENTIAL - For the assessing team and authorised client representatives only.", margin + 2, y);
    y += 10;

    // Recommendation
    addSection("Assessor Recommendation");
    checkPage(12);
    doc.setFillColor(239, 246, 255); doc.rect(margin, y - 4, cW, 12, "F");
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(3, 105, 161);
    doc.text(promLabel, margin + 2, y + 2); y += 14;

    // Ratings
    addSection("Competency Ratings and Assessment");
    Object.entries(rts).forEach(([comp, score]) => {
      checkPage(40);
      const rb = RUBRIC.find(rb => rb.score === score) || RUBRIC[2];
      const rgb = { "#dc2626": [220, 38, 38], "#ea580c": [234, 88, 12], "#ca8a04": [202, 138, 4], "#16a34a": [22, 163, 74], "#0369a1": [3, 105, 161] };
      const col = rgb[rb.color] || [17, 17, 17];
      doc.setFillColor(...col); doc.rect(margin, y - 4, 2, 16, "F");
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(...col);
      doc.text(`${comp}: ${score}/5 - ${rb.label}`, margin + 5, y); y += 7;
      if (rd?.interpretations?.[comp]) { doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); const lines = doc.splitTextToSize(`Assessment: ${rd.interpretations[comp]}`, cW - 5); doc.text(lines, margin + 5, y); y += lines.length * 4 + 2; }
      if (rd?.strengths?.[comp]) { doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(22, 101, 52); doc.text("Strengths:", margin + 5, y); doc.setFont("helvetica", "normal"); const lines = doc.splitTextToSize(rd.strengths[comp], cW - 30); doc.text(lines, margin + 25, y); y += lines.length * 4 + 2; }
      if (rd?.improvements?.[comp]) { doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(153, 27, 27); doc.text("For development:", margin + 5, y); doc.setFont("helvetica", "normal"); const lines = doc.splitTextToSize(rd.improvements[comp], cW - 40); doc.text(lines, margin + 38, y); y += lines.length * 4 + 2; }
      const noteKey = `${pid}-${mid}-${comp}`;
      if (ratingNotes[noteKey]) { doc.setFontSize(9); doc.setFont("helvetica", "italic"); doc.setTextColor(80, 80, 80); const lines = doc.splitTextToSize(`Assessor notes: ${ratingNotes[noteKey]}`, cW - 5); doc.text(lines, margin + 5, y); y += lines.length * 4 + 2; }
      y += 4;
    });

    if (rd?.overallNarrative) { addSection("Overall Performance Summary"); checkPage(20); doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); const lines = doc.splitTextToSize(rd.overallNarrative, cW); doc.text(lines, margin, y); y += lines.length * 5 + 4; }

    // Written responses
    addSection("Written Responses");
    mod.questions.forEach((q, qi) => {
      checkPage(30);
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 120, 120);
      doc.text(`[${q.competency}] Question ${qi + 1}`, margin, y); y += 5;
      doc.setFont("helvetica", "normal"); doc.setTextColor(17, 17, 17);
      const qLines = doc.splitTextToSize(q.text, cW); doc.text(qLines, margin, y); y += qLines.length * 4 + 3;
      doc.setFillColor(249, 249, 249); checkPage(15);
      const ans = r.answers?.[q.id] || "No answer provided";
      const aLines = doc.splitTextToSize(ans, cW - 4);
      doc.rect(margin, y - 3, cW, aLines.length * 4.5 + 4, "F");
      doc.setFontSize(9); doc.text(aLines, margin + 2, y); y += aLines.length * 4.5 + 8;
    });

    // Development plan
    addSection("Development Recommendations (70-20-10)");
    mod.competencies.forEach(comp => {
      checkPage(20);
      const acts = DEVELOPMENT_ACTIVITIES[comp];
      if (!acts) return;
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(232, 37, 26); doc.text(comp, margin, y); y += 6;
      [["70% - On the job", acts.onJob], ["20% - Learning from others", acts.social], ["10% - Formal learning", acts.formal]].forEach(([label, items]) => {
        checkPage(10); doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80); doc.text(label, margin + 2, y); y += 5;
        items.forEach((item, i) => { checkPage(8); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50); const lines = doc.splitTextToSize(`${i + 1}. ${item}`, cW - 6); doc.text(lines, margin + 4, y); y += lines.length * 4 + 2; });
        y += 2;
      });
      y += 4;
    });

    doc.save(`CCM_Assessor_Report_${p.name.replace(/\s/g, "_")}_${mod.id}.pdf`);
  }

  async function downloadParticipantPDF(pid, mid) {
    const p = participants.find(x => x.id === pid);
    const mod = MODULES.find(m => m.id === mid);
    const rd = reportData[`${pid}-${mid}`];
    const rts = ratings[`${pid}-${mid}`] || {};
    if (!p || !mod) return;
    const hasRatings = Object.keys(rts).length > 0;

    const jsPDF = await loadJsPDF();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, margin = 20, cW = W - margin * 2;
    let y = margin;

    const addText = (text, x, fontSize = 11, bold = false, color = [17, 17, 17]) => {
      doc.setFontSize(fontSize); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text), cW - (x - margin));
      doc.text(lines, x, y); y += lines.length * (fontSize * 0.45) + 2;
    };

    const addSection = (title) => {
      if (y > 260) { doc.addPage(); y = margin; }
      y += 4; doc.setFillColor(232, 37, 26); doc.rect(margin, y, cW, 0.5, "F"); y += 4;
      addText(title, margin, 13, true, [232, 37, 26]); y += 2;
    };

    const checkPage = (needed = 20) => { if (y + needed > 275) { doc.addPage(); y = margin; } };

    // Header
    doc.setFillColor(232, 37, 26); doc.rect(0, 0, 210, 12, "F");
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("CCM CONSULTANCY", margin, 8);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("PERSONAL DEVELOPMENT REPORT", W - margin, 8, { align: "right" });
    y = 22;

    addText("Personal Development Report", margin, 16, true); y += 2;
    addText(`Prepared for: ${p.name} | ${p.role || ""} | ${new Date().toLocaleDateString()}`, margin, 9, false, [120, 120, 120]); y += 6;

    addSection("Introduction");
    checkPage(20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    const intro = `${p.name} participated in the CCM Consultancy Assessment Centre as part of a structured competency evaluation for the module ${mod.title}. This report summarises ${p.name}'s performance across the assessed competencies and provides a personalised development plan structured using the 70-20-10 learning framework to support continued professional growth.`;
    const introLines = doc.splitTextToSize(intro, cW); doc.text(introLines, margin, y); y += introLines.length * 5 + 6;

    addSection("Competency Performance");
    if (!hasRatings) {
      checkPage(15);
      doc.setFillColor(255, 251, 235); doc.rect(margin, y - 4, cW, 14, "F");
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 83, 0);
      doc.text("Assessment under review.", margin + 2, y + 2);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      const waitLines = doc.splitTextToSize("Your assessor is currently reviewing your responses. Your competency ratings and personalised development plan will be included in your final report once the review is complete.", cW - 4);
      doc.text(waitLines, margin + 2, y + 7); y += 20;
    } else {
      Object.entries(rts).forEach(([comp, score]) => {
        checkPage(25);
        const rb = RUBRIC.find(rb => rb.score === score) || RUBRIC[2];
        const rgb = { "#dc2626": [220, 38, 38], "#ea580c": [234, 88, 12], "#ca8a04": [202, 138, 4], "#16a34a": [22, 163, 74], "#0369a1": [3, 105, 161] };
        const col = rgb[rb.color] || [17, 17, 17];
        doc.setFillColor(...col); doc.rect(margin, y - 4, 2, 14, "F");
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...col);
        doc.text(`${comp}: ${score}/5 - ${rb.label}`, margin + 5, y); y += 6;
        if (rd?.interpretations?.[comp]) { doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); const lines = doc.splitTextToSize(rd.interpretations[comp], cW - 5); doc.text(lines, margin + 5, y); y += lines.length * 4 + 3; }
        y += 3;
      });
      if (rd?.overallNarrative) { addSection("Overall Summary"); checkPage(20); doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); const lines = doc.splitTextToSize(rd.overallNarrative, cW); doc.text(lines, margin, y); y += lines.length * 5 + 4; }

      addSection("Personalised Development Plan (70-20-10 Framework)");
      checkPage(20);
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
      const fwText = "The 70-20-10 framework reflects research evidence that most effective professional learning happens through on-the-job experience (70%), learning from others such as mentors and coaches (20%), and formal structured learning (10%).";
      const fwLines = doc.splitTextToSize(fwText, cW); doc.text(fwLines, margin, y); y += fwLines.length * 4 + 6;

      mod.competencies.forEach(comp => {
        checkPage(20);
        const acts = DEVELOPMENT_ACTIVITIES[comp];
        if (!acts) return;
        doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(232, 37, 26); doc.text(comp, margin, y); y += 6;
        [["70% - On the job (learning by doing)", acts.onJob], ["20% - Learning from others (mentoring and coaching)", acts.social], ["10% - Formal learning (courses and programmes)", acts.formal]].forEach(([label, items]) => {
          checkPage(10); doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 80, 80); doc.text(label, margin + 2, y); y += 5;
          items.forEach((item, i) => { checkPage(8); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50); const lines = doc.splitTextToSize(`${i + 1}. ${item}`, cW - 6); doc.text(lines, margin + 4, y); y += lines.length * 4 + 2; });
          y += 3;
        });
        y += 4;
      });

      addSection("Next Steps");
      checkPage(25);
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
      const ns = `${p.name} is encouraged to share this development plan with their line manager within the next two weeks and to agree on which activities to prioritise in the first 90 days. The recommended approach is to begin with one activity from each of the three 70-20-10 categories for each assessed competency, and to review progress monthly in a structured one-to-one conversation. CCM Consultancy recommends a formal follow-up review at 90 days to assess progress and adjust the plan as needed.`;
      const nsLines = doc.splitTextToSize(ns, cW); doc.text(nsLines, margin, y); y += nsLines.length * 5 + 4;
    }

    // Footer
    checkPage(15);
    y += 10; doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.setTextColor(150, 150, 150);
    doc.text("Prepared by CCM Consultancy. For queries please contact your HR representative or the CCM Consultancy team.", margin, y);

    doc.save(`CCM_Development_Report_${p.name.replace(/\s/g, "_")}.pdf`);
  }

  function exportCSV() {
    const headers = ["ID", "Name", "Level", "Role", "Module", "Competency", "Score", "Band", "Strengths", "For Development", "Time (min)", "Completed", "Written Answered", "Role Play Completed", "Interview Exchanges", "Overall Score", "Recommendation"];
    const rows = [headers];
    participants.forEach(p => {
      MODULES.forEach(mod => {
        const r = results[p.id]?.[mod.id];
        if (!r) return;
        const key = `${p.id}-${mod.id}`;
        const rts = ratings[key] || {};
        const rd = reportData[key];
        const rec = PROMOTION_OPTIONS.find(o => o.value === promotionRecs[key])?.label || "Pending";
        const score = getWeightedScore(p.id, mod.id);
        const band = score ? (RUBRIC.find(rb => rb.score === Math.round(score))?.label || "Pending") : "Pending";
        const rolePlayDone = (r.simMessages || []).some(m => m.role === "participant") ? "Yes" : "No";
        const exchanges = (r.simMessages || []).filter(m => m.role === "participant").length;

        if (Object.keys(rts).length === 0) {
          rows.push([p.id, p.name, LEVEL_LABELS[p.level], p.role || "", mod.title, "All competencies", "Pending", "Pending", "", "", Math.round((r.timeSpent || 0) / 60), r.completedAt?.substring(0, 10) || "", `${Object.keys(r.answers || {}).length}/${mod.questions.length}`, rolePlayDone, exchanges, score || "Pending", rec]);
        } else {
          mod.competencies.forEach(comp => {
            const compScore = rts[comp] || "Pending";
            const compBand = compScore !== "Pending" ? (RUBRIC.find(rb => rb.score === compScore)?.label || "") : "Pending";
            rows.push([p.id, p.name, LEVEL_LABELS[p.level], p.role || "", mod.title, comp, compScore, compBand, rd?.strengths?.[comp] || "", rd?.improvements?.[comp] || "", Math.round((r.timeSpent || 0) / 60), r.completedAt?.substring(0, 10) || "", `${Object.keys(r.answers || {}).length}/${mod.questions.length}`, rolePlayDone, exchanges, score || "Pending", rec]);
          });
        }
      });
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "ccm_assessment_results.csv"; a.click();
  }

  async function addParticipant() {
    if (!newParticipant.name || !newParticipant.username || !newParticipant.password) { alert("Please fill in name, username, and password."); return; }
    const id = `P${String(Date.now()).slice(-6)}`;
    try {
      await sb("ac_participants", "POST", { id, username: newParticipant.username, password: newParticipant.password, name: newParticipant.name, role: newParticipant.role, level: newParticipant.level, client_id: "aviation" }, "");
      await loadParticipants();
      setNewParticipant({ name: "", level: "manager", role: "", username: "", password: "" });
      setShowAddParticipant(false);
    } catch { alert("Could not add participant. The username may already exist."); }
  }

  function Header() {
    return (
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <CCMLogo small />
          {(clientLogo || settings.client_name) && <><div style={{ width: 1, height: 28, background: "#e5e5e5" }} />{clientLogo ? <img src={clientLogo} style={{ height: 28, objectFit: "contain" }} alt="Client" /> : <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{settings.client_name}</span>}</>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user && <span style={{ fontSize: 13, color: "#888" }}>{user.name}</span>}
          {user && <button onClick={() => { setScreen("login"); setUser(null); setRole(null); stopCamera(); setLoginForm({ username: "", password: "" }); }} style={S.btn("#fff", "#555")}>Sign out</button>}
        </div>
      </div>
    );
  }

  function CameraWidget() {
    return (
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 200, width: 144, borderRadius: 10, overflow: "hidden", border: `2px solid ${CCM_RED}`, background: "#000" }}>
        {cameraError ? <div style={{ padding: "0.75rem", fontSize: 11, color: "#f87171", textAlign: "center", lineHeight: 1.5 }}>{cameraError}</div> : <>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", display: "block", transform: "scaleX(-1)" }} />
          <div style={{ background: CCM_RED, padding: "3px 8px", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "blink 1.2s infinite" }} />
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 600, letterSpacing: "0.05em" }}>LIVE</span>
          </div>
        </>}
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    );
  }

  function Notification() {
    if (!notification) return null;
    return (
      <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", zIndex: 300, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", maxWidth: 480 }}>
        <span style={{ fontSize: 18 }}>✅</span>
        <p style={{ margin: 0, fontSize: 14, color: "#166534", fontWeight: 500 }}>{notification.message}</p>
        <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", fontSize: 16, marginLeft: 8 }}>x</button>
      </div>
    );
  }

  // LOGIN
  if (screen === "login") return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center" }}><CCMLogo /></div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ ...S.card, width: "100%", maxWidth: 380, padding: "2.5rem" }}>
          <h2 style={{ margin: "0 0 0.25rem", fontSize: 22, fontWeight: 700, color: "#111" }}>Assessment Centre</h2>
          <p style={{ color: "#888", fontSize: 14, margin: "0 0 2rem" }}>Please sign in to access your assessment session.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Username" value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} style={S.input} />
            <input type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} style={S.input} />
            {loginError && <p style={{ color: CCM_RED, fontSize: 13, margin: 0 }}>{loginError}</p>}
            <button onClick={handleLogin} disabled={loading} style={{ ...S.btn(CCM_RED, "#fff"), padding: "12px", fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}>{loading ? "Signing in..." : "Sign in"}</button>
          </div>
        </div>
      </div>
    </div>
  );

  // PARTICIPANT HOME
  if (screen === "participant") {
    const mods = getModules(user);
    const done = mods.filter(m => results[user.id]?.[m.id]);
    const hasNewApproval = Object.entries(reportRequests).some(([key, status]) => key.startsWith(user.id) && status === "approved");
    return (
      <div style={S.page}>
        <Header />
        <Notification />
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111" }}>Welcome, {user.name}</h2>
          <p style={{ color: "#888", fontSize: 14, margin: "0 0 1.5rem" }}>{user.role} - {LEVEL_LABELS[user.level]} - {done.length}/{mods.length} modules complete</p>
          {hasNewApproval && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <p style={{ margin: 0, fontSize: 14, color: "#166534", fontWeight: 500 }}>Your development report has been approved and is ready to download below.</p>
            </div>
          )}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem", fontSize: 13, color: "#78350f", lineHeight: 1.7 }}>
            <strong>Before you begin:</strong> Each module has three parts - a written assessment, a live interview simulation, and a role play exercise. Your camera will be requested during the interview for identity verification. Voice input works best in Google Chrome.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mods.map(mod => {
              const modResult = results[user.id]?.[mod.id];
              const reqKey = `${user.id}-${mod.id}`;
              return (
                <div key={mod.id} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{mod.title}</span>
                        {modResult && <span style={S.badge("#f0fdf4", "#16a34a")}>Complete</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        {mod.competencies.map(c => <span key={c} style={S.badge("#fff1f1", CCM_RED)}>{c}</span>)}
                      </div>
                      <p style={{ fontSize: 13, color: "#888", margin: 0 }}>{mod.duration} min written - Interview simulation - Role play</p>
                    </div>
                    <button onClick={() => startModule(mod)} style={{ ...S.btn(modResult ? "#f5f5f5" : CCM_RED, modResult ? "#777" : "#fff"), marginLeft: 12, whiteSpace: "nowrap" }}>{modResult ? "Revisit" : "Begin"}</button>
                  </div>
                  {modResult && (
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "#888" }}>Development report:</span>
                      {reportRequests[reqKey] === "approved"
                        ? <button onClick={() => downloadParticipantPDF(user.id, mod.id)} style={{ ...S.btn("#f0fdf4", "#16a34a"), border: "1px solid #86efac" }}>Download my report (PDF)</button>
                        : reportRequests[reqKey] === "pending"
                          ? <span style={{ fontSize: 13, color: "#ca8a04", fontStyle: "italic" }}>Request sent - awaiting assessor approval</span>
                          : <button onClick={() => saveReportRequest(user.id, mod.id, "pending")} style={S.btn(CCM_RED, "#fff")}>Request my report</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // MODULE
  if (screen === "module" && activeModule) {
    const cs = getCS(activeModule);
    if (modulePhase === "intro") return (
      <div style={S.page}>
        <Header />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <button onClick={() => setScreen("participant")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: "1.25rem" }}>Back to modules</button>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 0.5rem", color: "#111" }}>{activeModule.title}</h2>
          <p style={{ fontSize: 14, color: "#888", margin: "0 0 1.25rem" }}>Competencies assessed: <strong style={{ color: "#111" }}>{activeModule.competencies.join(" and ")}</strong></p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1.5rem" }}>
            {[{ label: "Background", content: cs.background }, { label: "Current state", content: cs.currentState }, { label: "The challenge", content: cs.challenge }, { label: "Your role", content: cs.yourRole, accent: true }].map(sec => (
              <div key={sec.label} style={{ ...S.card, borderLeft: sec.accent ? `4px solid ${CCM_RED}` : "1px solid #e5e5e5" }}>
                <p style={S.label}>{sec.label}</p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.9, color: "#222" }}>{sec.content}</p>
              </div>
            ))}
          </div>
          <div style={{ ...S.card, background: "#f9f9f9", marginBottom: "1.5rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: 14, fontWeight: 600, color: "#111" }}>What to expect</p>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#666" }}>Part 1 - Written questions ({activeModule.duration} minutes, timed)</p>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#666" }}>Part 2 - Live interview with the CCM Consultancy Assessor</p>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Part 3 - Role play: {activeModule.rolePlay.title}</p>
            <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#fffbeb", borderRadius: 8, fontSize: 12, color: "#92400e" }}>Your camera will be activated during the interview for identity verification. Please be in a quiet, well-lit space.</div>
          </div>
          <button onClick={() => setModulePhase("written")} style={{ ...S.btn(CCM_RED, "#fff"), width: "100%", padding: "13px", fontSize: 15 }}>Begin written assessment</button>
        </div>
      </div>
    );

    if (modulePhase === "written") return (
      <div style={S.page}>
        <Header />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>{activeModule.title} - Written</h2>
            <span style={{ fontSize: 14, color: timer > activeModule.duration * 60 ? CCM_RED : "#888", fontWeight: 600, background: "#fff", border: "1px solid #e5e5e5", padding: "5px 14px", borderRadius: 20 }}>{formatTime(timer)}</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
            {activeModule.questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentQ(i)} style={{ padding: "6px 18px", fontSize: 13, background: currentQ === i ? CCM_RED : answers[q.id] ? "#f0fdf4" : "#fff", color: currentQ === i ? "#fff" : answers[q.id] ? "#16a34a" : "#555", border: `1px solid ${currentQ === i ? CCM_RED : answers[q.id] ? "#86efac" : "#ddd"}`, borderRadius: 20, cursor: "pointer", fontWeight: currentQ === i ? 600 : 400 }}>Q{i + 1}</button>
            ))}
          </div>
          <div style={{ ...S.card, marginBottom: "1rem", borderLeft: `3px solid ${CCM_RED}` }}>
            <p style={S.label}>{activeModule.questions[currentQ].competency}</p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.9, color: "#111" }}>{getQ(activeModule.questions[currentQ])}</p>
          </div>
          <textarea value={answers[activeModule.questions[currentQ].id] || ""} onChange={e => setAnswers(a => ({ ...a, [activeModule.questions[currentQ].id]: e.target.value }))} placeholder="Type your answer here. Take your time - quality of thinking matters more than length." rows={10} style={{ ...S.input, resize: "vertical", lineHeight: 1.8, fontSize: 14 }} />
          <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
            {currentQ > 0 && <button onClick={() => setCurrentQ(q => q - 1)} style={{ ...S.btn("#fff", "#555"), flex: 1 }}>Previous</button>}
            {currentQ < activeModule.questions.length - 1
              ? <button onClick={() => setCurrentQ(q => q + 1)} style={{ ...S.btn("#fff", "#555"), flex: 1 }}>Next question</button>
              : <button onClick={submitWritten} style={{ ...S.btn(CCM_RED, "#fff"), flex: 1, padding: "11px" }}>Submit and begin interview</button>}
          </div>
        </div>
      </div>
    );

    if (modulePhase === "sim") return (
      <div style={{ ...S.page, display: "flex", flexDirection: "column" }}>
        <Header />
        {cameraActive && <CameraWidget />}
        <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: CCM_RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#fff" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111" }}>CCM Consultancy Assessor</p>
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{settings.assessor_name || "CCM Consultancy"} - {simPhase === "roleplay" ? activeModule.rolePlay.title : "Competency interview"}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!cameraActive && <button onClick={startCamera} style={S.btn("#fff", "#555")}>Enable camera</button>}
              {simPhase === "interview" && <button onClick={startRolePlay} style={{ ...S.btn("#fff8f1", "#c2410c"), border: "1px solid #fed7aa" }}>Start role play</button>}
              <button onClick={finishModule} style={{ ...S.btn("#f0fdf4", "#16a34a"), border: "1px solid #86efac" }}>Finish and submit</button>
            </div>
          </div>
          {simPhase === "roleplay" && <div style={{ background: "#fff8f1", border: "1px solid #fed7aa", borderRadius: 10, padding: "1rem", marginBottom: "1rem", fontSize: 13, color: "#92400e", lineHeight: 1.7 }}><strong>Role play brief:</strong> {isSimple(user?.level) ? activeModule.rolePlay.setupSimple : activeModule.rolePlay.setup}</div>}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: "1rem", minHeight: 320 }}>
            {simMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: msg.role === "participant" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: msg.role === "assessor" ? CCM_RED : "#eee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: msg.role === "assessor" ? "#fff" : "#555" }}>{msg.role === "assessor" ? "CCM" : user.name[0]}</div>
                <div style={{ maxWidth: "78%" }}>
                  <p style={{ margin: "0 0 3px", fontSize: 11, color: "#aaa", fontWeight: 500, textAlign: msg.role === "participant" ? "right" : "left" }}>{msg.role === "assessor" ? `${settings.assessor_name || "CCM Consultancy"} - CCM Consultancy Assessor` : user.name}</p>
                  <div style={{ background: msg.role === "assessor" ? "#fff" : "#fff1f1", border: `1px solid ${msg.role === "assessor" ? "#e5e5e5" : "#fecdd3"}`, padding: "10px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.8, color: "#111" }}>{msg.text}</div>
                  {msg.competency && <p style={{ fontSize: 11, color: "#bbb", margin: "3px 8px 0", textAlign: "right" }}>Detected: {msg.competency}</p>}
                </div>
              </div>
            ))}
            {simLoading && <div style={{ display: "flex", gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: CCM_RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700 }}>CCM</div><div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "10px 14px", borderRadius: 12, fontSize: 14, color: "#bbb" }}>Typing...</div></div>}
            <div ref={simEndRef} />
          </div>
          <div style={{ display: "flex", gap: 8, paddingTop: "0.75rem", borderTop: "1px solid #eee" }}>
            <button onClick={startListening} style={{ ...S.btn(isListening ? "#fff1f1" : "#f5f5f5", isListening ? CCM_RED : "#555"), border: `1px solid ${isListening ? CCM_RED : "#ddd"}`, flexShrink: 0 }}>{isListening ? "Listening..." : "Speak"}</button>
            <input value={simInput} onChange={e => setSimInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendSimMessage()} placeholder="Or type your response and press Enter..." style={{ ...S.input, flex: 1 }} />
            <button onClick={sendSimMessage} style={{ ...S.btn(CCM_RED, "#fff"), flexShrink: 0 }}>Send</button>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN
  if (screen === "admin") {
    const totalDone = participants.reduce((a, p) => a + MODULES.filter(m => results[p.id]?.[m.id]).length, 0);
    const totalPoss = participants.length * MODULES.length;
    const pendingCount = Object.values(reportRequests).filter(v => v === "pending").length;
    const tabs = ["dashboard", "guide", "live_assessor", "reports", "settings"];
    const tabLabels = { dashboard: "Dashboard", guide: "Assessor guide", live_assessor: "Live panel", reports: "Reports", settings: "Settings" };

    return (
      <div style={S.page}>
        <Header />
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111" }}>Admin Dashboard</h2>
              <p style={{ color: "#888", fontSize: 14, margin: "4px 0 0" }}>CCM Consultancy Assessment Centre</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {pendingCount > 0 && <span style={{ ...S.badge("#fff8f1", "#c2410c"), padding: "6px 12px", fontSize: 12 }}>{pendingCount} report request{pendingCount > 1 ? "s" : ""} pending</span>}
              <button onClick={() => { loadAllData(); loadParticipants(); }} style={S.btn("#fff", "#555")}>Refresh</button>
              <button onClick={exportCSV} style={S.btn(CCM_RED, "#fff")}>Export CSV</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: "1.5rem" }}>
            {[{ label: "Participants", value: participants.length }, { label: "Completed", value: `${totalDone}/${totalPoss}` }, { label: "Completion", value: `${totalPoss > 0 ? Math.round(totalDone / totalPoss * 100) : 0}%` }, { label: "Report requests", value: pendingCount }].map(c => (
              <div key={c.label} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: "1rem" }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>{c.label}</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#111" }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap", borderBottom: "1px solid #e5e5e5", paddingBottom: "1rem" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setAdminTab(t)} style={{ padding: "7px 16px", fontSize: 13, background: adminTab === t ? CCM_RED : "transparent", color: adminTab === t ? "#fff" : "#555", border: `1px solid ${adminTab === t ? CCM_RED : "#ddd"}`, borderRadius: 20, cursor: "pointer", fontWeight: adminTab === t ? 600 : 400 }}>{tabLabels[t]}</button>
            ))}
          </div>

          {adminTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {participants.map(p => (
                <div key={p.id} style={S.card}>
                  <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111" }}>{p.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 13, color: "#888" }}>{p.role} - {LEVEL_LABELS[p.level]}</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {MODULES.map(mod => {
                      const r = results[p.id]?.[mod.id];
                      const map = { frontline: ["M1"], supervisor: ["M1", "M3"], manager: ["M1", "M2", "M3"], senior: ["M1", "M2", "M3"] };
                      const allowed = (map[p.level] || []).includes(mod.id);
                      const score = getWeightedScore(p.id, mod.id);
                      return (
                        <div key={mod.id} onClick={() => allowed && r && (setSelectedPart(selectedPart === p.id && selectedMod === mod.id ? null : p.id), setSelectedMod(selectedPart === p.id && selectedMod === mod.id ? null : mod.id))} style={{ background: !allowed ? "#f9f9f9" : r ? "#f0fdf4" : "#fafafa", borderRadius: 10, padding: "0.875rem", cursor: r ? "pointer" : "default", border: `1px solid ${selectedPart === p.id && selectedMod === mod.id ? "#86efac" : r ? "#bbf7d0" : "#e5e5e5"}`, opacity: allowed ? 1 : 0.5 }}>
                          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "#777" }}>{mod.title.split(":")[0]}</p>
                          {!allowed ? <p style={{ margin: 0, fontSize: 12, color: "#bbb" }}>Not in scope</p> : r ? <><p style={{ margin: "0 0 2px", fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Complete {score ? `- ${score}/5` : ""}</p><p style={{ margin: 0, fontSize: 12, color: "#888" }}>{Math.round((r.timeSpent || 0) / 60)}m - {Object.keys(r.answers || {}).length}/{mod.questions.length} answered</p></> : <p style={{ margin: 0, fontSize: 13, color: "#bbb" }}>Not started</p>}
                        </div>
                      );
                    })}
                  </div>
                  {selectedPart === p.id && selectedMod && results[p.id]?.[selectedMod] && (
                    <div style={{ marginTop: "1rem", borderTop: "1px solid #f0f0f0", paddingTop: "1rem" }}>
                      <p style={{ margin: "0 0 1rem", fontSize: 13, fontWeight: 700, color: "#111" }}>{MODULES.find(m => m.id === selectedMod)?.title} - Responses</p>
                      {MODULES.find(m => m.id === selectedMod)?.questions.map(q => (
                        <div key={q.id} style={{ marginBottom: "1rem" }}>
                          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>[{q.competency}] {q.text}</p>
                          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, background: "#f9f9f9", padding: "0.875rem", borderRadius: 8, color: "#111" }}>{results[p.id][selectedMod].answers?.[q.id] || <em style={{ color: "#bbb" }}>No answer</em>}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {adminTab === "guide" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem", fontSize: 13, color: "#78350f", lineHeight: 1.7 }}><strong>Assessor guide - confidential.</strong> Contains model answers, indicators, best answer descriptions, and role play guidance for all modules.</div>
              {MODULES.map(mod => (
                <div key={mod.id} style={{ ...S.card, overflow: "hidden", padding: 0 }}>
                  <div onClick={() => setGuideModule(guideModule === mod.id ? null : mod.id)} style={{ padding: "1.25rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111" }}>{mod.title}</p><p style={{ margin: "2px 0 0", fontSize: 13, color: "#888" }}>{mod.competencies.join(" and ")}</p></div>
                    <span style={{ color: "#bbb" }}>{guideModule === mod.id ? "▲" : "▼"}</span>
                  </div>
                  {guideModule === mod.id && (
                    <div style={{ borderTop: "1px solid #f0f0f0", padding: "1.25rem", display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ background: "#f9f9f9", borderRadius: 10, padding: "1rem" }}>
                        <p style={S.label}>Full scenario context</p>
                        {[{ k: "Background", v: mod.caseStudy.background }, { k: "Current state", v: mod.caseStudy.currentState }, { k: "Challenge", v: mod.caseStudy.challenge }, { k: "Participant role", v: mod.caseStudy.yourRole }].map(s => (
                          <div key={s.k} style={{ marginBottom: "0.75rem" }}>
                            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#555" }}>{s.k}</p>
                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#444" }}>{s.v}</p>
                          </div>
                        ))}
                      </div>
                      {mod.guide.map((g, gi) => {
                        const q = mod.questions.find(q => q.id === g.qId);
                        const isOpen = expandedGuideQ === `${mod.id}-${g.qId}`;
                        return (
                          <div key={g.qId} style={{ border: "1px solid #e5e5e5", borderRadius: 10, overflow: "hidden" }}>
                            <div onClick={() => setExpandedGuideQ(isOpen ? null : `${mod.id}-${g.qId}`)} style={{ padding: "1rem", cursor: "pointer", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={S.badge("#fff1f1", CCM_RED)}>{g.competency}</span><span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Question {gi + 1}</span></div>
                              <span style={{ color: "#bbb" }}>{isOpen ? "▲" : "▼"}</span>
                            </div>
                            {isOpen && (
                              <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: 14 }}>
                                <div><p style={S.label}>Question text</p><p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#111", fontStyle: "italic" }}>{q?.text}</p></div>
                                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "1rem", border: "1px solid #bbf7d0" }}><p style={{ ...S.label, color: "#16a34a" }}>Model answer</p><p style={{ margin: 0, fontSize: 13, lineHeight: 1.9, color: "#166534" }}>{g.modelAnswer}</p></div>
                                <div style={{ background: "#eff6ff", borderRadius: 8, padding: "1rem", border: "1px solid #bfdbfe" }}><p style={{ ...S.label, color: "#0369a1" }}>What a score of 5 looks like</p><p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#1e40af" }}>{g.bestAnswer}</p></div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                  <div style={{ border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.875rem" }}><p style={{ ...S.label, color: "#16a34a" }}>Strong indicators</p>{g.strongIndicators.map((s, i) => <p key={i} style={{ margin: "0 0 6px", fontSize: 13, color: "#166534", lineHeight: 1.5 }}>✓ {s}</p>)}</div>
                                  <div style={{ border: "1px solid #fecdd3", borderRadius: 8, padding: "0.875rem" }}><p style={{ ...S.label, color: CCM_RED }}>Weak indicators and red flags</p>{g.weakIndicators.map((s, i) => <p key={i} style={{ margin: "0 0 6px", fontSize: 13, color: "#991b1b", lineHeight: 1.5 }}>✗ {s}</p>)}</div>
                                </div>
                                {g.rolePlayGuide && <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "0.875rem" }}><p style={{ ...S.label, color: "#92400e" }}>Role play assessor guidance</p><p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#78350f" }}>{g.rolePlayGuide}</p></div>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div style={{ border: "1px solid #fed7aa", borderRadius: 10, padding: "1rem", background: "#fffbeb" }}>
                        <p style={S.label}>Role play brief and assessor instructions</p>
                        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#111" }}>{mod.rolePlay.title}</p>
                        <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.8, color: "#555" }}>{mod.rolePlay.setup}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#92400e" }}>Competencies assessed: {mod.rolePlay.competencies.join(", ")}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {adminTab === "live_assessor" && (
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: "0 0 0.5rem", fontSize: 13, fontWeight: 700, color: "#111" }}>Participant</p>
                {participants.map(p => (
                  <button key={p.id} onClick={() => { setLivePart(p.id); setAssessorMessages([]); }} style={{ padding: "10px 12px", textAlign: "left", background: livePart === p.id ? "#fff1f1" : "#fff", color: "#111", border: `1px solid ${livePart === p.id ? CCM_RED : "#e5e5e5"}`, borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: "#888" }}>{LEVEL_LABELS[p.level]}</div>
                  </button>
                ))}
                <p style={{ margin: "1rem 0 0.5rem", fontSize: 13, fontWeight: 700, color: "#111" }}>Module</p>
                {MODULES.map(m => <button key={m.id} onClick={() => setLiveMod(m.id)} style={{ padding: "8px 12px", textAlign: "left", background: liveMod === m.id ? "#f9f9f9" : "#fff", border: `1px solid ${liveMod === m.id ? "#ddd" : "#e5e5e5"}`, borderRadius: 8, cursor: "pointer", fontSize: 12, color: liveMod === m.id ? "#111" : "#888" }}>{m.title.split(":")[0]}</button>)}
                <p style={{ margin: "1rem 0 0.5rem", fontSize: 13, fontWeight: 700, color: "#111" }}>Question bank</p>
                <select value={presetCat} onChange={e => setPresetCat(e.target.value)} style={{ padding: "7px 10px", fontSize: 12, border: "1px solid #ddd", borderRadius: 8, color: "#111", background: "#fff" }}>
                  {Object.keys(presetQuestions).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {presetQuestions[presetCat]?.map((q, i) => <button key={i} onClick={() => sendAssessorQ(q)} style={{ padding: "8px 10px", textAlign: "left", fontSize: 12, background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: 8, cursor: "pointer", color: "#555", lineHeight: 1.5 }}>{q}</button>)}
                <div style={{ marginTop: "0.5rem", borderTop: "1px solid #eee", paddingTop: "0.75rem" }}>
                  <p style={{ ...S.label, marginBottom: "6px" }}>Add your own question</p>
                  <select value={newQuestionComp} onChange={e => setNewQuestionComp(e.target.value)} style={{ padding: "6px 8px", fontSize: 11, border: "1px solid #ddd", borderRadius: 6, color: "#111", background: "#fff", width: "100%", marginBottom: "6px" }}>
                    {Object.keys(presetQuestions).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <textarea value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Type your question here..." rows={2} style={{ ...S.input, fontSize: 12, resize: "none", marginBottom: "6px" }} />
                  <button onClick={() => { if (!newQuestion.trim()) return; setPresetQuestions(pq => ({ ...pq, [newQuestionComp]: [...(pq[newQuestionComp] || []), newQuestion.trim()] })); setNewQuestion(""); }} style={{ ...S.btn(CCM_RED, "#fff"), width: "100%", padding: "7px", fontSize: 12 }}>Add to {newQuestionComp}</button>
                </div>
              </div>
              <div>
                {livePart && liveMod ? (
                  <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>Live session - {participants.find(p => p.id === livePart)?.name}</p>
                    <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                      {assessorMessages.map((msg, i) => (
                        <div key={i} style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.7, background: msg.role === "assessor" ? "#fff1f1" : msg.role === "ai_feedback" ? "#fffbeb" : "#f9f9f9", border: `1px solid ${msg.role === "assessor" ? CCM_RED : msg.role === "ai_feedback" ? "#fde68a" : "#e5e5e5"}`, color: "#111" }}>
                          <p style={{ ...S.label, color: msg.role === "assessor" ? CCM_RED : msg.role === "ai_feedback" ? "#92400e" : "#888", margin: "0 0 4px" }}>{msg.role === "assessor" ? "Your question" : msg.role === "ai_feedback" ? "AI competency analysis" : "Response"}</p>
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
                        </div>
                      ))}
                      {assessorLoading && <div style={{ padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 13, color: "#92400e" }}>Analysing...</div>}
                      <div ref={assessorEndRef} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={assessorInput} onChange={e => setAssessorInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAssessorQ(assessorInput)} placeholder="Type your question..." style={{ ...S.input, flex: 1 }} />
                      <button onClick={() => sendAssessorQ(assessorInput)} style={S.btn(CCM_RED, "#fff")}>Ask</button>
                    </div>
                  </div>
                ) : <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#bbb", fontSize: 14 }}>Select a participant and module to begin</div>}
              </div>
            </div>
          )}

          {adminTab === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => setShowRubric(!showRubric)} style={S.btn("#fff", "#555")}>{showRubric ? "Hide" : "Show"} rating rubric</button>
                {generatingReport && <span style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>Generating AI ratings - please wait...</span>}
              </div>
              {showRubric && (
                <div style={S.card}>
                  <p style={{ margin: "0 0 1rem", fontSize: 14, fontWeight: 700, color: "#111" }}>Rating rubric - 1 to 5 scale</p>
                  {RUBRIC.map(rb => (
                    <div key={rb.score} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "0.75rem", background: rb.bg, borderRadius: 8, marginBottom: 8, border: `1px solid ${rb.color}33` }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: rb.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{rb.score}</div>
                      <div><p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: rb.color }}>{rb.label}</p><p style={{ margin: "2px 0 0", fontSize: 13, color: "#555" }}>{rb.desc}</p></div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem", fontSize: 13, color: "#78350f" }}>
                <strong>Weightings:</strong> Written {weights.written}% / Interview {weights.interview}% / Role play {weights.roleplay}% (total: {totalWeight}%) - adjust in Settings.
              </div>
              {participants.flatMap(p => MODULES.filter(mod => { const map = { frontline: ["M1"], supervisor: ["M1", "M3"], manager: ["M1", "M2", "M3"], senior: ["M1", "M2", "M3"] }; return (map[p.level] || []).includes(mod.id); }).map(mod => {
                const r = results[p.id]?.[mod.id];
                if (!r) return null;
                const key = `${p.id}-${mod.id}`;
                const rts = ratings[key] || {};
                const rd = reportData[key];
                const aiR = aiRatings[key];
                return (
                  <div key={key} style={S.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111" }}>{p.name} - {mod.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#888" }}>{p.role} - {Math.round((r.timeSpent || 0) / 60)} min on task</p>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {reportRequests[key] === "pending" && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button onClick={() => saveReportRequest(p.id, mod.id, "approved")} style={{ ...S.btn("#f0fdf4", "#16a34a"), border: "1px solid #86efac" }}>Approve report request</button>
                            {approvalSaved[key] && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Approved and saved</span>}
                          </div>
                        )}
                        {reportRequests[key] === "approved" && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Report approved</span>}
                        <button onClick={() => generateAIRatings(p.id, mod.id)} disabled={generatingReport} style={{ ...S.btn("#fff", "#555"), opacity: generatingReport ? 0.6 : 1 }}>Generate AI ratings</button>
                        <button onClick={() => downloadAssessorPDF(p.id, mod.id)} style={S.btn(CCM_RED, "#fff")}>Download Assessor PDF</button>
                        <button onClick={() => downloadParticipantPDF(p.id, mod.id)} style={S.btn("#f9f9f9", "#555")}>Download Participant PDF</button>
                      </div>
                    </div>
                    <div style={{ marginBottom: "1rem", padding: "0.875rem", background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: 10 }}>
                      <p style={S.label}>Assessor recommendation</p>
                      <select value={promotionRecs[key] || ""} onChange={e => setPromotionRecs(prev => ({ ...prev, [key]: e.target.value }))} style={{ ...S.input, fontSize: 13 }}>
                        {PROMOTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: "#888" }}>This recommendation appears in the Assessor PDF only. It is not shared with the participant.</p>
                    </div>
                    {mod.competencies.map(comp => {
                      const aiSug = aiR?.ratings?.[comp];
                      const cur = rts[comp];
                      const noteKey = `${key}-${comp}`;
                      return (
                        <div key={comp} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #e5e5e5", borderRadius: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{comp}</span>
                            {aiSug && <span style={{ fontSize: 12, color: "#888" }}>AI suggested: <strong style={{ color: RUBRIC.find(rb => rb.score === aiSug)?.color || "#111" }}>{aiSug}/5 - {RUBRIC.find(rb => rb.score === aiSug)?.label}</strong></span>}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "0.75rem" }}>
                            {RUBRIC.map(rb => (
                              <button key={rb.score} onClick={() => updateRating(p.id, mod.id, comp, rb.score)} style={{ padding: "6px 14px", fontSize: 13, fontWeight: 600, background: cur === rb.score ? rb.color : "#fff", color: cur === rb.score ? "#fff" : rb.color, border: `2px solid ${rb.color}`, borderRadius: 8, cursor: "pointer" }}>{rb.score}</button>
                            ))}
                            {cur && <span style={{ fontSize: 13, color: RUBRIC.find(rb => rb.score === cur)?.color, fontWeight: 600, padding: "6px 0" }}> - {RUBRIC.find(rb => rb.score === cur)?.label}</span>}
                          </div>
                          {rd?.interpretations?.[comp] && <p style={{ margin: "0 0 0.5rem", fontSize: 13, lineHeight: 1.7, color: "#555", background: "#f9f9f9", padding: "0.75rem", borderRadius: 8 }}><strong>Assessment:</strong> {rd.interpretations[comp]}</p>}
                          {rd?.strengths?.[comp] && <p style={{ margin: "0 0 0.5rem", fontSize: 13, lineHeight: 1.7, color: "#166534", background: "#f0fdf4", padding: "0.75rem", borderRadius: 8 }}><strong>Strengths:</strong> {rd.strengths[comp]}</p>}
                          {rd?.improvements?.[comp] && <p style={{ margin: "0 0 0.5rem", fontSize: 13, lineHeight: 1.7, color: "#991b1b", background: "#fef2f2", padding: "0.75rem", borderRadius: 8 }}><strong>For development:</strong> {rd.improvements[comp]}</p>}
                          <div style={{ marginTop: "0.5rem" }}>
                            <p style={{ ...S.label, marginBottom: "4px" }}>Your assessor notes for {comp}</p>
                            <textarea value={ratingNotes[noteKey] || ""} onChange={e => setRatingNotes(n => ({ ...n, [noteKey]: e.target.value }))} placeholder={`Add your own observations for ${comp} here...`} rows={2} style={{ ...S.input, resize: "vertical", fontSize: 13, lineHeight: 1.6 }} />
                          </div>
                        </div>
                      );
                    })}
                    {rd?.overallNarrative && <div style={{ padding: "1rem", background: "#f9f9f9", borderRadius: 10, marginTop: "0.5rem" }}><p style={S.label}>Overall narrative</p><p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#444" }}>{rd.overallNarrative}</p></div>}
                  </div>
                );
              }))}
            </div>
          )}

          {adminTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={S.card}>
                <p style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 700, color: "#111" }}>Assessor and client settings</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div><p style={S.label}>Assessor name (appears in interview greeting)</p><input value={settings.assessor_name} onChange={e => setSettings(s => ({ ...s, assessor_name: e.target.value }))} placeholder="Type your full name here" style={S.input} /></div>
                  <div><p style={S.label}>Client name (shown in header)</p><input value={settings.client_name} onChange={e => setSettings(s => ({ ...s, client_name: e.target.value }))} placeholder="e.g. Emirates, ADNOC..." style={S.input} /></div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={S.label}>Client logo (upload image file)</p>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = ev => setClientLogo(ev.target.result); reader.readAsDataURL(f); }} style={{ fontSize: 13, color: "#555" }} />
                  {clientLogo && <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 12, padding: "0.75rem", background: "#f9f9f9", borderRadius: 8 }}><img src={clientLogo} style={{ height: 36, objectFit: "contain" }} alt="Logo" /><button onClick={() => setClientLogo(null)} style={{ fontSize: 12, color: CCM_RED, background: "none", border: "none", cursor: "pointer" }}>Remove</button></div>}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={S.label}>Assessment weightings (must total 100%)</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 8 }}>
                    {["written", "interview", "roleplay"].map(k => (
                      <div key={k}><p style={S.label}>{k.charAt(0).toUpperCase() + k.slice(1)} %</p><input type="number" min="0" max="100" value={settings[`weight_${k}`]} onChange={e => setSettings(s => ({ ...s, [`weight_${k}`]: e.target.value }))} style={S.input} /></div>
                    ))}
                  </div>
                  <div style={{ padding: "0.75rem", background: totalWeight === 100 ? "#f0fdf4" : "#fff1f1", border: `1px solid ${totalWeight === 100 ? "#86efac" : CCM_RED}`, borderRadius: 8, fontSize: 13, color: totalWeight === 100 ? "#16a34a" : CCM_RED, fontWeight: 600 }}>Total: {totalWeight}% {totalWeight === 100 ? "- Valid" : "- Must equal 100%"}</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button onClick={saveAllSettings} disabled={savingSettings} style={{ ...S.btn(CCM_RED, "#fff"), opacity: savingSettings ? 0.7 : 1 }}>{savingSettings ? "Saving..." : "Save all settings"}</button>
                  {settingsSaved && <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✓ Settings saved successfully</span>}
                </div>
              </div>
              <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111" }}>Participants</p>
                  <button onClick={() => setShowAddParticipant(!showAddParticipant)} style={S.btn(CCM_RED, "#fff")}>+ Add participant</button>
                </div>
                {showAddParticipant && (
                  <div style={{ background: "#f9f9f9", border: "1px solid #e5e5e5", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
                    <p style={{ margin: "0 0 1rem", fontSize: 14, fontWeight: 700, color: "#111" }}>New participant details</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div><p style={S.label}>Full name</p><input value={newParticipant.name} onChange={e => setNewParticipant(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Mohammed Al Farsi" style={S.input} /></div>
                      <div><p style={S.label}>Job role and title</p><input value={newParticipant.role} onChange={e => setNewParticipant(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Ground Operations Supervisor" style={S.input} /></div>
                      <div><p style={S.label}>Level</p><select value={newParticipant.level} onChange={e => setNewParticipant(p => ({ ...p, level: e.target.value }))} style={S.input}><option value="frontline">Front-line</option><option value="supervisor">Supervisor</option><option value="manager">Manager</option><option value="senior">Senior Leader</option></select></div>
                      <div><p style={S.label}>Username (no spaces)</p><input value={newParticipant.username} onChange={e => setNewParticipant(p => ({ ...p, username: e.target.value }))} placeholder="e.g. mfarsi" style={S.input} /></div>
                      <div><p style={S.label}>Password</p><input type="password" value={newParticipant.password} onChange={e => setNewParticipant(p => ({ ...p, password: e.target.value }))} placeholder="Set a secure password" style={S.input} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={addParticipant} style={S.btn(CCM_RED, "#fff")}>Add participant</button>
                      <button onClick={() => setShowAddParticipant(false)} style={S.btn("#fff", "#555")}>Cancel</button>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {participants.map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem", background: "#f9f9f9", borderRadius: 8, border: "1px solid #e5e5e5" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>{p.name}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>{p.role} - {LEVEL_LABELS[p.level]} - Username: {p.username}</p>
                      </div>
                      {confirmDelete === p.id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#888" }}>Remove {p.name}?</span>
                          <button onClick={() => deleteParticipant(p.id)} style={{ ...S.btn(CCM_RED, "#fff"), padding: "5px 12px", fontSize: 12 }}>Yes, remove</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ ...S.btn("#fff", "#555"), padding: "5px 12px", fontSize: 12 }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(p.id)} style={{ ...S.btn("#fff", "#888"), padding: "5px 12px", fontSize: 12, border: "1px solid #ddd" }}>Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
