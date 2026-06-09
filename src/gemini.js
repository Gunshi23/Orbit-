import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-3.5-flash";

// Initialize GoogleGenAI SDK with the API key.
// In browser/client environments, the key must be passed explicitly.
let ai = null;
try {
  if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
} catch (e) {
  console.error("GoogleGenAI SDK initialization failed:", e);
}

export async function generateGrowthMission(userPrompt) {
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
    if (!ai) {
      throw new Error("GoogleGenAI SDK is not initialized (API Key is missing).");
    }

    const apiPromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `${systemPrompt}\n\nUser Prompt: "${userPrompt}"`,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API request timed out")), 4000)
    );

    const response = await Promise.race([apiPromise, timeoutPromise]);
    let textResult = response.text || "";
    
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
  const systemPrompt = `You are a script writer for synthetic voice systems in ORBIT.
Given a voice model name ("${voiceModel}") and a text prompt, write a highly engaging, professional, and natural audio script that the synthetic voice model should read. Keep it concise, natural, and under 50 words. Do not output anything other than the raw spoken script.`;

  try {
    if (!ai) {
      throw new Error("GoogleGenAI SDK is not initialized.");
    }

    const apiPromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `${systemPrompt}\n\nInput: "${textInput}"`,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini Voice API request timed out")), 4000)
    );

    const response = await Promise.race([apiPromise, timeoutPromise]);
    return response.text?.trim() || textInput;
  } catch (err) {
    console.error("Gemini Voice synthesis fallback:", err);
    return `Hello! We've noticed your interest in ORBIT. Here is your customized audio briefing regarding: ${textInput}`;
  }
}
