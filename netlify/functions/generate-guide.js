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

  const prompt = `You are an assessment center designer. Return ONLY valid JSON — no markdown, no explanation.

Case study: "${caseStudyName}"
Competency: "${competencyName}"
${questions.length ? `\nQuestions being assessed:\n${questionsText}\n` : ""}
Generate a JSON object with this exact structure (keep all text very short):

{
  "definition": "One sentence defining ${competencyName} in the ${caseStudyName} context.",
  "score_descriptors": [
    { "score": 0, "label": "Not Attempted",  "description": "Max 15 words describing score 0 behavior." },
    { "score": 1, "label": "Ineffective",    "description": "Max 15 words describing score 1 behavior." },
    { "score": 2, "label": "Inconsistent",   "description": "Max 15 words describing score 2 behavior." },
    { "score": 3, "label": "Effective",      "description": "Max 15 words describing score 3 behavior." },
    { "score": 4, "label": "Strong",         "description": "Max 15 words describing score 4 behavior." },
    { "score": 5, "label": "Exceptional",    "description": "Max 15 words describing score 5 behavior." }
  ],
  "strong_indicators": [
    "Positive observable behavior, max 10 words.",
    "Positive observable behavior, max 10 words.",
    "Positive observable behavior, max 10 words."
  ],
  "weak_indicators": [
    "Negative observable behavior, max 10 words.",
    "Negative observable behavior, max 10 words.",
    "Negative observable behavior, max 10 words."
  ]
}

Rules:
- definition: exactly 1 sentence
- score_descriptors: exactly 6 items, each description max 15 words
- strong_indicators: exactly 3 items, each max 10 words
- weak_indicators: exactly 3 items, each max 10 words
- Return ONLY the raw JSON object`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
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
    clearTimeout(timeout);
    const isTimeout = err.name === "AbortError";
    return {
      statusCode: isTimeout ? 504 : 502,
      headers,
      body: JSON.stringify({ error: isTimeout ? "Guide generation timed out — please try again." : `Network error reaching Anthropic: ${err.message}` }),
    };
  }
  clearTimeout(timeout);

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
