/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

// Cache instances per API key
const instances: Record<string, any> = {};

export function getGemini(apiKey?: string) {
  const finalKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalKey) throw new Error("API_KEY_MISSING");
  if (!instances[finalKey]) {
    instances[finalKey] = new GoogleGenAI({ apiKey: finalKey });
  }
  return instances[finalKey];
}

async function callMiniMax(prompt: string, apiKey: string, model: string = "minimax-m2.7") {
  const response = await fetch("https://api.minimax.chat/v1/text/chatcompletion_v2", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are Nexus, a high-performance AI command center assistant. 
          Your goal is to help the user navigate their agentic workbench and perform tasks.
          Be concise, technical, and professional.`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `MiniMax API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function processCommand(
  prompt: string, 
  options: { 
    provider: "gemini" | "minimax", 
    apiKey?: string, 
    model?: string 
  }
) {
  const { provider, apiKey, model } = options;

  try {
    if (provider === "minimax") {
      if (!apiKey) throw new Error("API_KEY_MISSING");
      return await callMiniMax(prompt, apiKey, model);
    }

    // Default to Gemini
    const ai = getGemini(apiKey);
    const genModel = ai.getGenerativeModel({ 
      model: model || "gemini-2.0-flash",
      systemInstruction: `You are Nexus, a high-performance AI command center assistant. 
      Your goal is to help the user navigate their agentic workbench and perform tasks.
      Be concise, technical, and professional. 
      Maintain the "Sleek Interface" persona: sharp, efficient, and slightly futuristic.`,
    });

    const result = await genModel.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.message === "API_KEY_MISSING") {
      return "Critical: No API Key found. Please configure your API_KEY in the Settings module.";
    }
    return `System Error: ${error.message || "Failed to process command."}`;
  }
}
