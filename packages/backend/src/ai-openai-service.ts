import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

const ANALYSIS_SYSTEM_PROMPT = `You are an expert sustainability analyst for the fashion industry.
Given a product's fabric composition, brand, sustainability claims, and certifications,
provide a thorough environmental and health analysis.

You MUST respond with valid JSON matching this exact schema (no markdown, no extra text):
{
  "materials": [
    {
      "material": "string",
      "percentage": number,
      "qualifier": "string or null",
      "co2_per_kg": number,
      "water_per_kg": number,
      "environmental_impact": "string (1-2 sentences)",
      "is_synthetic": boolean
    }
  ],
  "total_co2_kg": number,
  "total_water_liters": number,
  "synthetic_percentage": number,
  "health_risks": [
    {
      "title": "string",
      "severity": "high|medium|low",
      "description": "string (1-2 sentences)"
    }
  ],
  "chemical_risks": [
    {
      "substance": "string",
      "risk_level": "high|medium|low",
      "associated_materials": ["string"],
      "health_effects": ["string"]
    }
  ],
  "biodegradability_estimate": "string (e.g. '0-20 years+' or '6 months - 2 years')",
  "biodegradability_position": number (0-100, 100=fully biodegradable, 0=not at all),
  "environmental_score": number (0-100),
  "health_score": number (0-100),
  "greenwashing_score": number (0-100, 100=no greenwashing),
  "overall_indicator": "green|red",
  "certification_results": [
    {
      "claim": "string",
      "verified": boolean,
      "category": "environmental|health|social|null",
      "explanation": "string"
    }
  ],
  "greenwashing_signals": [
    {
      "term": "string",
      "severity": "high|medium|low",
      "explanation": "string"
    }
  ],
  "material_explanation": "string (2-3 sentences summarizing the material impact)",
  "health_explanation": "string (2-3 sentences summarizing health concerns)"
}

Rules:
- co2_per_kg and water_per_kg should be realistic industry estimates for that material.
- total_co2_kg and total_water_liters should be weighted sums based on percentages (assume 1 garment ≈ 0.3 kg).
- Consider qualifiers like "organic" or "recycled" — they significantly reduce impact.
- For certifications, verify if they are real recognized certifications and assess legitimacy.
- Flag vague sustainability claims (eco-friendly, green, conscious, etc.) as greenwashing if not backed by certifications.
- environmental_score: higher = better for environment. Consider materials, certifications, overall footprint.
- health_score: higher = safer. Consider chemical risks, synthetic content, breathability.
- greenwashing_score: higher = more trustworthy. 100 means no greenwashing detected.
- overall_indicator: "green" if all three scores >= 50, else "red".
- Be factual and cite real data where possible.`;

const CHAT_SYSTEM_PROMPT = `You are EcoPulse AI, a sustainability assistant for fashion.

Rules:
- Answer in 1-2 sentences MAX. Be direct and to the point.
- No bullet points, no numbered lists, no headers.
- If the user asks a follow-up, keep it equally brief.
- Only give longer answers if the user explicitly asks for detail.`;


interface FabricComponent {
  material: string;
  percentage: number;
  qualifier?: string | null;
}

interface AnalyzeInput {
  productName: string;
  brand: string;
  fabricComponents: FabricComponent[];
  sustainabilityClaims: string[];
  certificationMentions: string[];
}

function buildUserPrompt(input: AnalyzeInput): string {
  const components = input.fabricComponents
    .map(c => `  - ${c.percentage}% ${c.qualifier ? c.qualifier + " " : ""}${c.material}`)
    .join("\n");
  const claims = input.sustainabilityClaims.length ? input.sustainabilityClaims.join(", ") : "None";
  const certs = input.certificationMentions.length ? input.certificationMentions.join(", ") : "None";

  return `Analyze this fashion product:

Product: ${input.productName}
Brand: ${input.brand}

Fabric Composition:
${components}

Sustainability Claims: ${claims}
Certification Mentions: ${certs}

Provide the full JSON analysis.`;
}

export async function aiAnalyze(input: AnalyzeInput): Promise<Record<string, unknown>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  if (!input.fabricComponents.length) {
    throw new Error("At least one fabric component is required");
  }

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("AI returned empty response");
  return JSON.parse(raw);
}

interface ChatInput {
  message: string;
  conversationHistory: { role: string; content: string }[];
  productContext?: string | null;
}

export async function aiChat(input: ChatInput): Promise<{ message: string; confidence: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
  ];

  if (input.productContext) {
    messages.push({
      role: "system",
      content: `The user is currently viewing this product analysis:\n${input.productContext}`,
    });
  }

  for (const msg of input.conversationHistory) {
    messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
  }

  messages.push({ role: "user", content: input.message });

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.4,
    max_tokens: 500,
  });

  const reply = response.choices[0].message.content?.trim() || "Sorry, I could not process that.";
  return { message: reply, confidence: "high" };
}
