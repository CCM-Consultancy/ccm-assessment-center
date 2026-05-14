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

  const prompt = `You are an assessment centre designer. Generate exactly 5 behavioural interview questions for a management assessment centre.

Case study context: "${caseStudyName}"
Competency being assessed: "${competencyName}"

Return ONLY a valid JSON array with no other text, markdown, or explanation. Each element must have:
- "advanced": full, nuanced version for senior/experienced candidates
- "standard": simpler, more direct version for developing candidates

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
        model:      "claude-sonnet-4-20250514",
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
