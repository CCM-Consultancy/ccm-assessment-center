const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { caseStudyName, competencyName, questions = [] } = body;

  if (!caseStudyName || !competencyName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "caseStudyName and competencyName are required" }),
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
    {
      "score": 0,
      "label": "Not Attempted",
      "description": "What a score of 0 looks like — candidate does not address this competency at all"
    },
    {
      "score": 1,
      "label": "Ineffective",
      "description": "Behaviorally anchored description of ineffective performance on this competency in this case study context"
    },
    {
      "score": 2,
      "label": "Inconsistent",
      "description": "Behaviorally anchored description for score 2"
    },
    {
      "score": 3,
      "label": "Effective",
      "description": "Behaviorally anchored description for score 3 — the expected standard"
    },
    {
      "score": 4,
      "label": "Strong",
      "description": "Behaviorally anchored description for score 4"
    },
    {
      "score": 5,
      "label": "Exceptional",
      "description": "Behaviorally anchored description for score 5 — outstanding performance"
    }
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
- Score descriptors must be behaviourally anchored: what the candidate says or does in response to the questions
- Strong indicators signal scores of 4–5; weak indicators signal scores of 0–2
- Write indicators as concise observable statements (one clause each, no bullet prefixes)
- Return ONLY the raw JSON object`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0]?.text || "";

    let parsed;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to parse AI response as JSON", raw: rawText.slice(0, 400) }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
};
