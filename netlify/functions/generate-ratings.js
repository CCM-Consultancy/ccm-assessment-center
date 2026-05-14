// netlify/functions/generate-ratings.js
// Serverless proxy for AI rating generation — keeps Anthropic key server-side.
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

  let system, messages, maxTokens;
  try {
    ({ system, messages, maxTokens = 400 } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY environment variable is not set" }),
    };
  }

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
        model:      "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system,
        messages,
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
  const text = data?.content?.[0]?.text || null;
  return { statusCode: 200, headers, body: JSON.stringify({ text }) };
};
