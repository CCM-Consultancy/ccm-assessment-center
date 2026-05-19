// netlify/functions/suggest-questions.js
// Serverless proxy — keeps the Anthropic API key out of the browser bundle.
// Set ANTHROPIC_API_KEY in Netlify → Site configuration → Environment variables.

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // CORS headers — allow calls from the same Netlify site origin
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  let caseStudyName, competencyName;
  try {
    ({ caseStudyName, competencyName } = JSON.parse(event.body));
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

  const prompt = `You are an assessment center designer. Generate exactly 5 behavioral interview questions in STAR format for a management assessment center.

Competency being assessed: "${competencyName}"

STRICT RULES:
- Each question must be fully standalone. Do NOT reference any specific case study, company, industry, sector, or scenario (including "${caseStudyName}").
- Do NOT mention Boeing, aviation, airlines, manufacturing, finance, healthcare, or any other specific industry.
- Every question must open with one of these STAR patterns: "Tell me about a time when...", "Describe a situation where...", "Give me an example of...", "Walk me through a time when...", or "Can you share a situation where..."
- Questions must invite a STAR response (Situation, Task, Action, Result) — they should ask for a past experience with context, what was required, what the candidate did, and the outcome.
- Do not include follow-up probes in the question text itself.

Return ONLY a valid JSON array with no other text, markdown, or explanation. Each element must have:
- "advanced": a nuanced version for senior/experienced candidates, with higher complexity or scope expectations
- "standard": a more direct version for mid-level candidates, same STAR structure but with simpler framing

[{"advanced":"...","standard":"..."},...]`;

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":          apiKey,
        "anthropic-version":  "2023-06-01",
        "Content-Type":       "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 1500,
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
  const text = data.content?.[0]?.text || "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not parse AI response — try again." }),
    };
  }

  let suggestions;
  try {
    suggestions = JSON.parse(match[0]);
  } catch {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "AI returned malformed JSON — try again." }),
    };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ suggestions }) };
};
