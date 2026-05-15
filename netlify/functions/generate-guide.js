// netlify/functions/generate-guide.js
// Serverless proxy — keeps the Anthropic API key out of the browser bundle.
// Set ANTHROPIC_API_KEY in Netlify → Site configuration → Environment variables.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  let caseStudyName, competencyName, questions;
  try {
    ({ caseStudyName, competencyName, questions = [] } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (!caseStudyName || !competencyName) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "caseStudyName and competencyName are required" }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY environment variable is not set" }),
    };
  }

  const questionsText = questions.length
    ? questions
        .map((q, i) =>
          `  Q${i + 1} (Advanced): ${q.advanced || ""}\n  Q${i + 1} (Standard): ${q.standard || ""}`
        )
        .join("\n")
    : "  No specific questions provided — write guidance applicable to this competency in general.";

  const prompt = `You are an expert assessment centre designer creating a comprehensive assessor guide for a competency-based interview.

Case Study: ${caseStudyName}
Competency: ${competencyName}

Questions being assessed:
${questionsText}

Generate a complete assessor guide as a JSON object with this exact structure — return ONLY valid JSON, no markdown fences, no explanation:

{
  "definition": "2-3 sentence definition of ${competencyName} contextualised specifically to ${caseStudyName}",
  "score_descriptors": [
    { "score": 0, "label": "Not Attempted",  "description": "Candidate does not address this competency at all" },
    { "score": 1, "label": "Ineffective",    "description": "Behaviourally anchored description of ineffective performance in this case study context" },
    { "score": 2, "label": "Inconsistent",   "description": "Behaviourally anchored description for score 2" },
    { "score": 3, "label": "Effective",      "description": "Behaviourally anchored description for score 3 — the expected standard" },
    { "score": 4, "label": "Strong",         "description": "Behaviourally anchored description for score 4" },
    { "score": 5, "label": "Exceptional",    "description": "Behaviourally anchored description for score 5 — outstanding performance" }
  ],
  "strong_indicators": [
    "Specific observable positive behaviour 1",
    "Specific observable positive behaviour 2",
    "Specific observable positive behaviour 3",
    "Specific observable positive behaviour 4",
    "Specific observable positive behaviour 5"
  ],
  "weak_indicators": [
    "Specific observable negative behaviour 1",
    "Specific observable negative behaviour 2",
    "Specific observable negative behaviour 3",
    "Specific observable negative behaviour 4",
    "Specific observable negative behaviour 5"
  ]
}

Guidelines:
- Contextualise every descriptor to ${caseStudyName} — reference the scenario, not generic competency theory
- Score descriptors must be behaviourally anchored: what the candidate says or does in their response
- Strong indicators signal scores of 4–5; weak indicators signal scores of 0–2
- Write indicators as concise observable statements, no bullet prefixes
- Return ONLY the raw JSON object`;

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 2000,
        messages:   [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: `Network error reaching Anthropic: ${err.message}` }),
    };
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    let errMsg = `Anthropic API ${anthropicRes.status}`;
    try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch {}
    return { statusCode: 502, headers, body: JSON.stringify({ error: errMsg }) };
  }

  const data = await anthropicRes.json();
  const rawText = data.content?.[0]?.text || "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not parse AI response — try again." }),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "AI returned malformed JSON — try again." }),
    };
  }

  return { statusCode: 200, headers, body: JSON.stringify(parsed) };
};
