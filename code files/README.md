# LegalEase — AI Legal Document Generator

LegalEase is a stable, beginner-friendly AI legal document generator designed exclusively for free tiers (Google AI Studio / Gemini API) with a zero-crash guarantee.

---

## Architecture & Technology Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, python-docx, fpdf
- **AI Engine**: Google Gemini API (`@google/genai` / `google-generativeai`)
- **Web & Fullstack**: Express server with Vite + React 19 frontend for live web deployment, alongside a standalone Streamlit Python frontend (`frontend/app.py`).
- **Cost**: 100% Free Tiers only (no paid APIs, no OpenAI, no Firebase, no paid databases).

---

## Quickstart Guide (Python: FastAPI + Streamlit)

### 1. Prerequisites
- Python 3.11 or higher
- Git

### 2. Clone and Setup Virtual Environment
```bash
# Clone the repository
git clone <your-repo-url>
cd LegalEase

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your free Gemini API key:
```env
GEMINI_API_KEY="AIzaSy..."
```
*(Note: If no API key is provided, LegalEase automatically runs in full Demo Mode with realistic templates — it will never crash!)*

### 5. Launch Backend Server (FastAPI)
```bash
uvicorn backend.main:app --reload --port 8000
```
Backend health check is accessible at `http://localhost:8000/health`.

### 6. Launch Frontend (Streamlit)
In a second terminal window (with `venv` activated):
```bash
streamlit run frontend/app.py
```
Open your browser at `http://localhost:8501`.

---

## Live Web App (Vite + React + Express)

LegalEase also includes a web build that runs directly in modern browsers and cloud environments:
```bash
# Install node dependencies
npm install

# Start development fullstack server
npm run dev

# Or build for production
npm run build
npm start
```

---

## Backend API Contract

| Endpoint | Method | Payload / Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/health` | GET | None | Returns `{"status": "ok"}` |
| `/generate` | POST | `{"doc_type": str, "parties": list, "terms": list, "effective_date": str}` | Generates document via Gemini or Demo mode (`{"content": str, "mode": "live" \| "demo"}`) |
| `/generate-docx` | POST | `{"title": str, "content": str}` | Generates and streams down a `.docx` file |
| `/generate-pdf` | POST | `{"title": str, "content": str}` | Generates and streams down a formatted `.pdf` file |

---

## Safe Fallback & Zero-Crash Safeguards

1. **Guaranteed Offline Demo Mode**:
   - Works when:
     - `GEMINI_API_KEY` is missing or invalid.
     - Gemini free quota (rate limit or daily quota) is temporarily reached.
     - Backend server is offline or unreachable.
     - Network connectivity drops.
   - Generates realistic, fully populated legal templates for:
     - Mutual Non-Disclosure Agreement (NDA)
     - Standard Employment Agreement
     - Residential Lease Agreement
     - Freelance & Independent Contractor Agreement
     - General Binding Custom Covenant

2. **Single Call Discipline**:
   - Exactly **one** Gemini call is initiated per user click on "Generate Document".
   - No background polling, keystroke triggers, or hidden telemetry.
   - The generate button immediately locks to "Processing..." to prevent double submissions.

3. **Confidentiality & Privacy**:
   - API keys are handled server-side only and never forwarded to client web browsers.
   - History logs (`history.json`) strictly record document titles, party names, and dates — never API keys.

---

## Legal Disclaimer

*Notice: LegalEase is an automated drafting assistance tool and sample repository. LegalEase is not a law firm and does not provide legal representation or legal advice. All agreements should be reviewed with qualified legal counsel in your jurisdiction before signature.*
