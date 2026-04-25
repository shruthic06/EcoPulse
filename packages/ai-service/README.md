# EcoPulse AI Analysis Service

Python FastAPI service that calls OpenAI to generate real sustainability analysis — no hardcoded data.

## Setup

```bash
cd packages/ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configure

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

The Node backend expects this service at `http://localhost:8000` (configurable via `AI_SERVICE_URL` env var).

## API

**POST /analyze** — Analyze a product's sustainability

```json
{
  "product_name": "Slim Fit Tank Top",
  "brand": "SHEIN",
  "fabric_components": [
    { "material": "Polyester", "percentage": 95 },
    { "material": "Spandex", "percentage": 5 }
  ],
  "sustainability_claims": ["eco-friendly"],
  "certification_mentions": ["OEKO-TEX"]
}
```

Returns full AI-generated analysis with CO₂, water usage, health risks, scores, greenwashing detection, and more.
