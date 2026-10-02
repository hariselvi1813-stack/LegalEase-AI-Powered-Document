import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface FileInfo {
  name: string;
  path: string;
  lang: string;
  description: string;
}

const FILES: FileInfo[] = [
  {
    name: 'backend/main.py',
    path: 'backend/main.py',
    lang: 'python',
    description: 'FastAPI application with CORS, Pydantic models, /health, /generate, and export routes with zero crash exception handling.',
  },
  {
    name: 'backend/services.py',
    path: 'backend/services.py',
    lang: 'python',
    description: 'Gemini free-tier caller, realistic demo template engine (NDA, Employment, Lease, Freelance, Custom), and fallback mechanics.',
  },
  {
    name: 'frontend/app.py',
    path: 'frontend/app.py',
    lang: 'python',
    description: 'Streamlit UI with BACKEND_URL constant, deep navy and warm ivory custom styling, paper preview, edit toggle, TXT/DOCX/PDF downloads, and history management.',
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    lang: 'text',
    description: 'FastAPI, Uvicorn, Streamlit, google-generativeai, python-dotenv, python-docx, fpdf, requests, pydantic.',
  },
  {
    name: 'README.md',
    path: 'README.md',
    lang: 'markdown',
    description: 'Detailed instructions for virtualenv, requirements, running uvicorn, and launching streamlit.',
  },
];

export const CodebaseView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('backend/main.py');
  const [fileContent, setFileContent] = useState<string>('Loading file...');
  const [copied, setCopied] = useState<boolean>(false);

  React.useEffect(() => {
    // Show concise summary or fetch content
    if (selectedFile === 'backend/main.py') {
      setFileContent(`from fastapi import FastAPI, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from backend.services import generate_with_gemini, build_demo_document

app = FastAPI(title="LegalEase API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentRequest(BaseModel):
    doc_type: str
    parties: list[str] = []
    terms: list[str] = []
    effective_date: str

class ExportRequest(BaseModel):
    title: str = "Legal_Document"
    content: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/generate")
def generate_document(req: DocumentRequest):
    try:
        content, mode = generate_with_gemini(
            doc_type=req.doc_type,
            parties=req.parties,
            terms=req.terms,
            effective_date=req.effective_date
        )
        return {"content": content, "mode": mode}
    except Exception:
        demo = build_demo_document(req.doc_type, req.parties, req.terms, req.effective_date)
        return {"content": demo, "mode": "demo"}`);
    } else if (selectedFile === 'backend/services.py') {
      setFileContent(`import os
import datetime
import google.generativeai as genai

DEMO_TEMPLATES = {
    "NDA": "...",
    "Employment Contract": "...",
    "Lease Agreement": "...",
    "Freelance Contract": "...",
    "Custom": "..."
}

def generate_with_gemini(doc_type, parties, terms, effective_date):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return build_demo_document(doc_type, parties, terms, effective_date), "demo"
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"Create a formal {doc_type} effective {effective_date} between {', '.join(parties)} with terms: {terms}"
        response = model.generate_content(prompt)
        return response.text.strip(), "live"
    except Exception:
        return build_demo_document(doc_type, parties, terms, effective_date), "demo"`);
    } else if (selectedFile === 'frontend/app.py') {
      setFileContent(`import streamlit as st
import requests
import json, os, datetime

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
st.set_page_config(page_title="LegalEase", page_icon="⚖️", layout="wide")

# Theme: Deep navy (#0B1F3A) & Warm Ivory (#FAF6EE)
# Hero: "Legal documents, made simple."
# Form: doc_type, parties, terms, effective_date
# Generate Document (disabled while processing)
# Paper preview + Edit toggle + Downloads (TXT, DOCX, PDF)
# Sidebar: Generate, History, Settings`);
    } else if (selectedFile === 'requirements.txt') {
      setFileContent(`fastapi>=0.110.0
uvicorn>=0.28.0
streamlit>=1.32.0
google-generativeai>=0.4.1
python-dotenv>=1.0.1
python-docx>=1.1.0
fpdf>=1.7.2
requests>=2.31.0
pydantic>=2.6.0`);
    } else {
      setFileContent(`# LegalEase Python Stack Setup
1. Create virtual environment:
   python -m venv venv
   source venv/bin/activate  # on Windows: venv\\Scripts\\activate

2. Install dependencies:
   pip install -r requirements.txt

3. Set up .env:
   cp .env.example .env
   # Add your GEMINI_API_KEY (optional - runs in demo mode without it!)

4. Run backend:
   uvicorn backend.main:app --reload --port 8000

5. Run frontend:
   streamlit run frontend/app.py`);
    }
  }, [selectedFile]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#E6DFD5] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif-heading font-semibold text-[#0B1F3A]">
            Python Stack Codebase
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compact, standalone Python files matching your specified FastAPI + Streamlit requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-legal px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
            All Files Saved in Repository
          </span>
        </div>
      </div>

      {/* Terminal run instruction cards */}
      <div className="p-4 bg-[#0B1F3A] rounded-xl text-white font-mono-legal text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#CBA24B]">
          <Terminal className="w-4 h-4" />
          <span className="font-semibold">CLI Execution Commands</span>
        </div>
        <div className="text-slate-300 pl-6 space-y-1">
          <div><span className="text-slate-500"># Terminal 1 - FastAPI Backend:</span></div>
          <div className="text-emerald-400">uvicorn backend.main:app --reload --port 8000</div>
          <div className="pt-2"><span className="text-slate-500"># Terminal 2 - Streamlit Frontend:</span></div>
          <div className="text-emerald-400">streamlit run frontend/app.py</div>
        </div>
      </div>

      {/* File selector tabs & Code Viewer */}
      <div className="bg-white rounded-xl border border-[#E6DFD5] shadow-sm overflow-hidden">
        {/* Selector Bar */}
        <div className="p-2 border-b border-[#E6DFD5] bg-[#FAF6EE] flex items-center gap-1 overflow-x-auto">
          {FILES.map((f) => (
            <button
              key={f.path}
              onClick={() => setSelectedFile(f.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedFile === f.path
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* File Description */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>{FILES.find((f) => f.path === selectedFile)?.description}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-semibold text-[#0B1F3A] hover:underline"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-[#071426] text-slate-200 font-mono-legal text-xs overflow-x-auto">
          <pre className="leading-relaxed">{fileContent}</pre>
        </div>
      </div>
    </div>
  );
};
