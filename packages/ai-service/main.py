"""
EcoPulse AI Analysis Service

Calls OpenAI to generate real sustainability analysis for fashion products
instead of relying on hardcoded lookup tables.
"""

import os
import json
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="EcoPulse AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")


# ── Request / Response Models ────────────────────────────────────────────────

class FabricComponent(BaseModel):
    material: str
    percentage: float
    qualifier: Optional[str] = None


class ProductInput(BaseModel):
    product_name: str
    brand: str
    fabric_components: list[FabricComponent]
    sustainability_claims: list[str] = []
    certification_mentions: list[str] = []


class MaterialAnalysis(BaseModel):
    material: str
    percentage: float
    qualifier: Optional[str] = None
    co2_per_kg: float
    water_per_kg: float
    environmental_impact: str
    is_synthetic: bool


class ChemicalRisk(BaseModel):
    substance: str
    risk_level: str  # low | medium | high
    associated_materials: list[str]
    health_effects: list[str]


class HealthRisk(BaseModel):
    title: str
    severity: str  # high | medium | low
    description: str


class CertificationResult(BaseModel):
    claim: str
    verified: bool
    category: Optional[str] = None
    explanation: str


class GreenwashingSignal(BaseModel):
    term: str
    severity: str
    explanation: str


class AnalysisResponse(BaseModel):
    # Per-material breakdown
    materials: list[MaterialAnalysis]
    # Aggregated metrics
    total_co2_kg: float
    total_water_liters: float
    synthetic_percentage: float
    # Health
    health_risks: list[HealthRisk]
    chemical_risks: list[ChemicalRisk]
    biodegradability_estimate: str
    biodegradability_position: float  # 0-100, where 100 = fully biodegradable
    # Scores (0-100)
    environmental_score: int
    health_score: int
    greenwashing_score: int
    overall_indicator: str  # green | red
    # Certifications & greenwashing
    certification_results: list[CertificationResult]
    greenwashing_signals: list[GreenwashingSignal]
    # Explanation
    material_explanation: str
    health_explanation: str


# ── Prompt Construction ──────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert sustainability analyst for the fashion industry.
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
- Be factual and cite real data where possible."""


def build_user_prompt(product: ProductInput) -> str:
    components_str = "\n".join(
        f"  - {c.percentage}% {(c.qualifier + ' ') if c.qualifier else ''}{c.material}"
        for c in product.fabric_components
    )
    claims_str = ", ".join(product.sustainability_claims) if product.sustainability_claims else "None"
    certs_str = ", ".join(product.certification_mentions) if product.certification_mentions else "None"

    return f"""Analyze this fashion product:

Product: {product.product_name}
Brand: {product.brand}

Fabric Composition:
{components_str}

Sustainability Claims: {claims_str}
Certification Mentions: {certs_str}

Provide the full JSON analysis."""


# ── Endpoint ─────────────────────────────────────────────────────────────────

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_product(product: ProductInput):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")

    if not product.fabric_components:
        raise HTTPException(status_code=400, detail="At least one fabric component is required")

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_user_prompt(product)},
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        data = json.loads(raw)
        return AnalysisResponse(**data)

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"AI returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")


@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL}


# ── Chat Endpoint ────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # user | assistant
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    product_context: Optional[str] = None


class ChatResponseModel(BaseModel):
    message: str
    confidence: str  # high | medium | low


CHAT_SYSTEM_PROMPT = """You are EcoPulse AI, a sustainability assistant for fashion.

Rules:
- Answer in 1-2 sentences MAX. Be direct and to the point.
- No bullet points, no numbered lists, no headers.
- If the user asks a follow-up, keep it equally brief.
- Only give longer answers if the user explicitly asks for detail."""


@app.post("/chat", response_model=ChatResponseModel)
async def chat(req: ChatRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")

    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]

    if req.product_context:
        messages.append({
            "role": "system",
            "content": f"The user is currently viewing this product analysis:\n{req.product_context}",
        })

    for msg in req.conversation_history:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": req.message})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.4,
            max_tokens=500,
        )

        reply = response.choices[0].message.content.strip()
        return ChatResponseModel(message=reply, confidence="high")

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI chat error: {e}")
