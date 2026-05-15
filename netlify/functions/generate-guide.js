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

  const prompt = `Return ONLY valid JSON, no markdown, no explanation.

Case study: "${caseStudyName}"
Competency: "${competencyName}"
${questions.length ? `\nQuestions:\n${questionsText}` : ""}

{"definition":"1-2 sentences contextualised to ${caseStudyName}","score_descriptors":[{"score":0,"label":"Not Attempted","description":"max 20 words"},{"score":1,"label":"Ineffective","description":"max 20 words"},{"score":2,"label":"Inconsistent","description":"max 20 words"},{"score":3,"label":"Effective","description":"max 20 words"},{"score":4,"label":"Strong","description":"max 20 words"},{"score":5,"label":"Exceptional","description":"max 20 words"}],"strong_indicators":["observable positive behaviour","observable positive behaviour","observable positive behaviour"],"weak_indicators":["observable negative behaviour","observable negative behaviour","observable negative behaviour"]}

Rules: anchor every descriptor to behaviours in ${caseStudyName}. Return ONLY the JSON.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

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
        max_tokens: 800,
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
