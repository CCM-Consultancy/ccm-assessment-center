// netlify/functions/generate-competency.js
// Generates a professional definition for a custom competency added by the admin.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  let competencyName;
  try {
    ({ competencyName } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (!competencyName) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "competencyName is required" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }) };
  }

  const prompt = `You are a senior assessment center designer and occupational psychologist with 20+ years of experience.

Define the following competency for use in a corporate assessment center:
Competency: "${competencyName}"

Return ONLY a valid JSON object with no markdown, no explanation, no backticks:
{
  "definition": "A 2-3 sentence professional definition suitable for an assessment center framework. Written in present tense, third person. Describes what high performance looks like behaviorally.",
  "observed_in": "A comma-separated list of assessment exercises where this competency is best observed (choose from: Structured interviews, Role-plays, Case studies, In-tray exercises, Presentations, Leaderless group discussions, Written exercises, High-pressure simulations)"
}`;

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
        max_tokens: 500,
        messages:   [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: `Network error: ${err.message}` }) };
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    let errMsg = `Anthropic API ${anthropicRes.status}`;
    try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch {}
    return { statusCode: 502, headers, body: JSON.stringify({ error: errMsg }) };
  }

  const data = await anthropicRes.json();
  const text = data.content?.[0]?.text || "";

  let result;
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    result = JSON.parse(clean);
  } catch {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Could not parse AI response — try again." }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify(result) };
};
