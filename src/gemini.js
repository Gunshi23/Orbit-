const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-1.5-flash";

export async function generateGrowthMission(userPrompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemPrompt = `You are the AI core of ORBIT, a futuristic AI-native marketing operating system.
Given a growth mission request from the user, analyze it and return a strictly valid JSON object. Do NOT wrap it in markdown block tags (e.g. do not use \`\`\`json). The JSON must have the following keys:
- "prompt": the original user request
- "audience": a concise description of the target customer cohort (e.g., "250 cart abandoners")
- "revenue": a projected revenue opportunity in Rupees (e.g., "₹1.5 Lakhs")
- "channel": the recommended communication channel (e.g., "WhatsApp", "Email", "SMS")
- "confidence": confidence score percentage (e.g., "89%")
- "reasoning": an array of exactly 6 short technical execution steps representing ORBIT's backend thought process. Each step must be under 35 characters.
- "logs": an array of 3 descriptive technical CLI log statements summarizing the cohort data.
- "copy": a highly converting marketing copy template customized for the channel with placeholder "{first_name}" included.

Example JSON output structure:
{
  "prompt": "Increase repeat purchases",
  "audience": "432 inactive VIPs",
  "revenue": "₹1.2 Lakhs",
  "channel": "WhatsApp",
  "confidence": "87%",
  "reasoning": [
    "Querying customer database",
    "Evaluating purchase history",
    "Detecting churn signals",
    "Ranking customer segments",
    "Calculating revenue impact",
    "Selecting communication channel"
  ],
  "logs": [
    "Scanning CDP database for customers active >90 days ago with CLV > ₹5,000.",
    "Identified cohort: Average order frequency 28 days; elapsed since last buy: 110 days.",
    "Analyzing preferred channels: WhatsApp has 88% engagement rate in this cohort."
  ],
  "copy": "Hey {first_name}! We missed you. We noticed it’s been a while since your last purchase. Here is a custom 15% off voucher valid for the next 48 hours. Tap here to redeem: orb.it/vip"
}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser Prompt: "${userPrompt}"`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    let textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up potential markdown formatting wrapping the JSON
    textResult = textResult.trim();
    if (textResult.startsWith("```json")) {
      textResult = textResult.substring(7);
    }
    if (textResult.endsWith("```")) {
      textResult = textResult.substring(0, textResult.length - 3);
    }
    textResult = textResult.trim();

    const parsed = JSON.parse(textResult);
    return parsed;
  } catch (err) {
    console.error("Gemini API call failed, using local fallback:", err);
    
    // Static fallback if API fails or key is invalid
    return {
      prompt: userPrompt,
      audience: "150 custom customer nodes",
      revenue: "₹45,000",
      channel: "WhatsApp & Email",
      confidence: "82%",
      reasoning: [
        "Querying customer database",
        "Evaluating purchase history",
        "Detecting churn signals",
        "Ranking customer segments",
        "Calculating revenue impact",
        "Selecting communication channel"
      ],
      logs: [
        "Running customized SQL matching for growth vectors.",
        "Slicing customer tiers by buying affinity parameters.",
        "Selecting best channels based on response latency matrix."
      ],
      copy: `Hey {first_name}! We noticed you might be interested in our new updates. Check it out here: orb.it/custom`
    };
  }
}

export async function generateVoiceScript(voiceModel, textInput) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const systemPrompt = `You are a script writer for synthetic voice systems in ORBIT.
Given a voice model name ("${voiceModel}") and a text prompt, write a highly engaging, professional, and natural audio script that the synthetic voice model should read. Keep it concise, natural, and under 50 words. Do not output anything other than the raw spoken script.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nInput: "${textInput}"`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || textInput;
  } catch (err) {
    console.error("Gemini Voice synthesis fallback:", err);
    return `Hello! We've noticed your interest in ORBIT. Here is your customized audio briefing regarding: ${textInput}`;
  }
}
