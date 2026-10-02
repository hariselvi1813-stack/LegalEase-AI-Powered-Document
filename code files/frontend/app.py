"""
LegalEase - Frontend Application (Streamlit)
Calm, editorial, trustworthy AI legal document drafting.
Runs on Free Tiers only with graceful offline demo fallback.
"""

import streamlit as st
import requests
import json
import os
import datetime
from typing import List, Dict, Any

# Single constant for backend location
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
HISTORY_FILE = "history.json"
APP_VERSION = "1.0.0"

# Set Streamlit Page Configuration
st.set_page_config(
    page_title="LegalEase — Legal Documents, Made Simple",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Deep navy & warm ivory editorial styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    /* Color Palette */
    :root {
        --navy-bg: #0B1F3A;
        --navy-light: #153258;
        --ivory-bg: #FAF6EE;
        --ivory-card: #FFFFFF;
        --text-dark: #1E293B;
        --text-muted: #64748B;
        --gold-accent: #C5A059;
        --border-color: #E6DFD5;
    }

    .stApp {
        background-color: var(--ivory-bg);
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: var(--text-dark);
    }

    h1, h2, h3, .serif-font {
        font-family: 'Playfair Display', Georgia, serif !important;
        color: var(--navy-bg) !important;
    }

    /* Wordmark & Header */
    .brand-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 24px;
    }

    .brand-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 28px;
        font-weight: 700;
        color: var(--navy-bg);
        letter-spacing: -0.5px;
    }

    .brand-tagline {
        font-size: 13px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Paper Document Preview */
    .paper-preview {
        background-color: #FFFFFF;
        padding: 40px 48px;
        border-radius: 4px;
        box-shadow: 0 4px 20px rgba(11, 31, 58, 0.08), 0 0 0 1px rgba(11, 31, 58, 0.05);
        font-family: 'Georgia', 'Playfair Display', serif;
        line-height: 1.7;
        color: #2D3748;
        white-space: pre-wrap;
        margin: 20px 0;
    }

    .demo-badge {
        display: inline-block;
        background-color: #FEF3C7;
        color: #92400E;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 4px;
        margin-bottom: 12px;
    }

    .disclaimer-banner {
        background-color: #F8FAFC;
        border-left: 3px solid #94A3B8;
        padding: 12px 16px;
        font-size: 12px;
        color: #64748B;
        border-radius: 0 4px 4px 0;
        margin-top: 16px;
    }

    /* Sidebar Navigation */
    .css-1d391kg, [data-testid="stSidebar"] {
        background-color: #F3EBDD !important;
        border-right: 1px solid var(--border-color);
    }
</style>
""", unsafe_allow_html=True)


# Local History Management
def load_history() -> List[Dict[str, Any]]:
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_history(entry: Dict[str, Any]):
    history = load_history()
    history.insert(0, entry)
    # Keep up to 50 latest items
    history = history[:50]
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception:
        pass


def clear_history():
    try:
        if os.path.exists(HISTORY_FILE):
            os.remove(HISTORY_FILE)
    except Exception:
        pass


# Backend Health Check
def check_backend_status() -> bool:
    try:
        res = requests.get(f"{BACKEND_URL}/health", timeout=2)
        return res.status_code == 200
    except Exception:
        return False


# Initialize Session State
if "doc_content" not in st.session_state:
    st.session_state.doc_content = ""
if "doc_mode" not in st.session_state:
    st.session_state.doc_mode = "demo"
if "is_editing" not in st.session_state:
    st.session_state.is_editing = False
if "error_message" not in st.session_state:
    st.session_state.error_message = None
if "current_doc_type" not in st.session_state:
    st.session_state.current_doc_type = "NDA"
if "is_processing" not in st.session_state:
    st.session_state.is_processing = False


# Sidebar Navigation
with st.sidebar:
    st.markdown("""
        <div style="padding: 10px 0;">
            <div style="font-size: 26px;">⚖️ <b>LegalEase</b></div>
            <div style="font-size: 12px; color: #64748B;">AI Legal Document Drafter</div>
        </div>
    """, unsafe_allow_html=True)
    st.divider()

    nav_choice = st.radio(
        "Navigation",
        ["Generate Document", "Document History", "Settings & Status"],
        label_visibility="collapsed"
    )

    st.divider()
    backend_live = check_backend_status()
    if backend_live:
        st.caption("🟢 Backend: Operational")
    else:
        st.caption("🟡 Backend: Demo Offline Mode")
    st.caption(f"LegalEase v{APP_VERSION} · Free Tier Safe")


# VIEW 1: GENERATE DOCUMENT
if nav_choice == "Generate Document":
    st.markdown("""
        <div class="brand-header">
            <div>
                <div class="brand-title">Legal documents, made simple.</div>
                <div class="brand-tagline">Draft, customize, and export binding agreements with zero hassle.</div>
            </div>
        </div>
    """, unsafe_allow_html=True)

    if not backend_live:
        st.warning("⚠️ Backend server is currently unavailable. LegalEase is running in Offline Demo Mode with realistic templates.")

    # Form Card
    with st.container():
        col1, col2 = st.columns([1, 1])

        with col1:
            doc_type = st.selectbox(
                "Document Type",
                ["NDA", "Employment Contract", "Lease Agreement", "Freelance Contract", "Custom"],
                index=["NDA", "Employment Contract", "Lease Agreement", "Freelance Contract", "Custom"].index(st.session_state.current_doc_type)
            )
            st.session_state.current_doc_type = doc_type

            effective_date = st.date_input(
                "Effective Date",
                value=datetime.date.today()
            )

        with col2:
            st.write("<b>Parties Involved</b> (comma-separated or one per line):", unsafe_allow_html=True)
            default_parties = {
                "NDA": "Acme Innovations Inc., Jane Doe",
                "Employment Contract": "Global Tech Corp, Alex Smith",
                "Lease Agreement": "Oak Ridge Properties, Taylor Reed",
                "Freelance Contract": "Horizon Studio, Sam Developer",
                "Custom": "First Party LLC, Second Party Corp"
            }.get(doc_type, "Party A, Party B")

            parties_input = st.text_area(
                "Parties",
                value=default_parties,
                height=85,
                help="Specify the legal names of all entities or individuals entering the agreement.",
                label_visibility="collapsed"
            )

        # Key terms / clauses
        st.write("<b>Key Clauses & Terms</b> (one clause per line):", unsafe_allow_html=True)
        default_terms = {
            "NDA": "2-year confidentiality period\nExcludes publicly available information\nGoverned by the State of Delaware",
            "Employment Contract": "Full-time position with 40 hours per week\nBase salary of $90,000 annually payable bi-weekly\n2 weeks paid vacation and standard health insurance",
            "Lease Agreement": "Monthly rent of $1,800 due on the 1st of each month\nSecurity deposit equal to one month rent\nNo unauthorized pets on premises",
            "Freelance Contract": "Project delivery deadline within 30 business days\nNet 15 payment terms upon invoice approval\nClient receives full copyright upon complete settlement",
            "Custom": "Mutual good-faith cooperation\n30-day written notice required for termination"
        }.get(doc_type, "Standard covenant terms\nConfidentiality obligation")

        terms_input = st.text_area(
            "Terms",
            value=default_terms,
            height=110,
            help="Enter specific conditions, fees, schedules, or restrictions.",
            label_visibility="collapsed"
        )

        # Input validation
        parsed_parties = [p.strip() for p in parties_input.replace("\n", ",").split(",") if p.strip()]
        parsed_terms = [t.strip() for t in terms_input.split("\n") if t.strip()]

        col_btn, col_info = st.columns([1, 3])
        with col_btn:
            generate_clicked = st.button(
                "Processing..." if st.session_state.is_processing else "Generate Document",
                type="primary",
                disabled=st.session_state.is_processing,
                use_container_width=True
            )

        # Action handling
        if generate_clicked:
            if not parsed_parties:
                st.error("Please provide at least one party name.")
            else:
                st.session_state.is_processing = True
                st.session_state.error_message = None

                payload = {
                    "doc_type": doc_type,
                    "parties": parsed_parties,
                    "terms": parsed_terms,
                    "effective_date": effective_date.strftime("%B %d, %Y")
                }

                # Attempt Backend Call
                try:
                    res = requests.post(f"{BACKEND_URL}/generate", json=payload, timeout=25)
                    if res.status_code == 200:
                        data = res.json()
                        st.session_state.doc_content = data.get("content", "")
                        st.session_state.doc_mode = data.get("mode", "demo")
                        save_history({
                            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                            "doc_type": doc_type,
                            "parties": parsed_parties,
                            "mode": st.session_state.doc_mode,
                            "status": "Success"
                        })
                    elif res.status_code == 429:
                        st.session_state.error_message = "Gemini API usage limit reached. Please try again later or use Demo Mode."
                    else:
                        st.session_state.error_message = f"Backend returned status {res.status_code}. You can switch to Demo Mode."
                except Exception:
                    # Offline / safe fallback to demo templates directly
                    from backend.services import build_demo_document
                    st.session_state.doc_content = build_demo_document(
                        doc_type, parsed_parties, parsed_terms, effective_date.strftime("%B %d, %Y")
                    )
                    st.session_state.doc_mode = "demo"
                    save_history({
                        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                        "doc_type": doc_type,
                        "parties": parsed_parties,
                        "mode": "demo",
                        "status": "Success (Local Demo)"
                    })

                st.session_state.is_processing = False
                st.rerun()

    # Error handling display
    if st.session_state.error_message:
        st.error(st.session_state.error_message)
        err_col1, err_col2 = st.columns([1, 1])
        with err_col1:
            if st.button("Retry Generation"):
                st.session_state.error_message = None
                st.rerun()
        with err_col2:
            if st.button("Use Demo Mode"):
                from backend.services import build_demo_document
                st.session_state.doc_content = build_demo_document(
                    doc_type, parsed_parties, parsed_terms, effective_date.strftime("%B %d, %Y")
                )
                st.session_state.doc_mode = "demo"
                st.session_state.error_message = None
                st.rerun()

    # Document Result Section
    if st.session_state.doc_content:
        st.divider()
        st.subheader("Document Output")

        # Top result bar with Mode & Edit toggle
        res_header_col1, res_header_col2 = st.columns([3, 1])
        with res_header_col1:
            if st.session_state.doc_mode == "demo":
                st.markdown('<span class="demo-badge">Demo mode: sample text</span>', unsafe_allow_html=True)
            else:
                st.markdown('<span style="color: #059669; font-size: 13px; font-weight: 600;">✓ Live AI Generated</span>', unsafe_allow_html=True)

        with res_header_col2:
            edit_toggle = st.checkbox("Edit Document", value=st.session_state.is_editing)
            st.session_state.is_editing = edit_toggle

        # Document Presentation
        if st.session_state.is_editing:
            st.session_state.doc_content = st.text_area(
                "Document Editor",
                value=st.session_state.doc_content,
                height=500
            )
        else:
            st.markdown(f'<div class="paper-preview">{st.session_state.doc_content}</div>', unsafe_allow_html=True)

        # Download Buttons: TXT, DOCX, PDF
        dl_col1, dl_col2, dl_col3, dl_col4 = st.columns(4)

        # 1. TXT Download
        with dl_col1:
            st.download_button(
                label="📄 Download TXT",
                data=st.session_state.doc_content,
                file_name=f"{st.session_state.current_doc_type.replace(' ', '_')}.txt",
                mime="text/plain",
                use_container_width=True
            )

        # 2. DOCX Download
        with dl_col2:
            try:
                docx_res = requests.post(
                    f"{BACKEND_URL}/generate-docx",
                    json={"title": st.session_state.current_doc_type, "content": st.session_state.doc_content},
                    timeout=10
                )
                if docx_res.status_code == 200:
                    st.download_button(
                        label="📘 Download DOCX",
                        data=docx_res.content,
                        file_name=f"{st.session_state.current_doc_type.replace(' ', '_')}.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        use_container_width=True
                    )
                else:
                    st.button("📘 DOCX (Unavailable)", disabled=True, use_container_width=True)
            except Exception:
                st.button("📘 DOCX (Offline)", disabled=True, use_container_width=True)

        # 3. PDF Download
        with dl_col3:
            try:
                pdf_res = requests.post(
                    f"{BACKEND_URL}/generate-pdf",
                    json={"title": st.session_state.current_doc_type, "content": st.session_state.doc_content},
                    timeout=10
                )
                if pdf_res.status_code == 200:
                    st.download_button(
                        label="📕 Download PDF",
                        data=pdf_res.content,
                        file_name=f"{st.session_state.current_doc_type.replace(' ', '_')}.pdf",
                        mime="application/pdf",
                        use_container_width=True
                    )
                else:
                    st.button("📕 PDF (Unavailable)", disabled=True, use_container_width=True)
            except Exception:
                st.button("📕 PDF (Offline)", disabled=True, use_container_width=True)

        # Legal Notice
        st.markdown("""
            <div class="disclaimer-banner">
                <b>Notice:</b> LegalEase provides automated document drafting tools and sample templates for informational convenience. LegalEase is not a law firm and does not provide legal advice. Users should review all generated documents with qualified legal counsel before signing.
            </div>
        """, unsafe_allow_html=True)


# VIEW 2: DOCUMENT HISTORY
elif nav_choice == "Document History":
    st.markdown('<div class="brand-title">Document History</div>', unsafe_allow_html=True)
    st.caption("Locally stored generation logs on this device. No API keys are ever stored.")
    st.divider()

    history = load_history()
    if not history:
        st.info("No documents generated yet. Use the Generator tab to create your first document.")
    else:
        for idx, item in enumerate(history):
            with st.container():
                h_col1, h_col2, h_col3 = st.columns([2, 3, 1])
                with h_col1:
                    st.write(f"<b>{item.get('doc_type', 'Agreement')}</b>", unsafe_allow_html=True)
                    st.caption(f"📅 {item.get('timestamp', 'Recent')}")
                with h_col2:
                    parties = item.get("parties", [])
                    st.write(f"Parties: {', '.join(parties) if parties else 'Standard'}")
                    mode_label = "Demo Template" if item.get("mode") == "demo" else "Live Gemini AI"
                    st.caption(f"Mode: {mode_label} · Status: {item.get('status', 'Success')}")
                with h_col3:
                    st.write("✓ Logged")
                st.divider()

        if st.button("Clear History", type="secondary"):
            clear_history()
            st.success("History cleared.")
            st.rerun()


# VIEW 3: SETTINGS & STATUS
elif nav_choice == "Settings & Status":
    st.markdown('<div class="brand-title">System Settings & Status</div>', unsafe_allow_html=True)
    st.caption("Inspect live system connections, API key configuration, and free-tier boundaries.")
    st.divider()

    # Backend Status
    backend_ok = check_backend_status()
    st.subheader("System Health")
    s_col1, s_col2 = st.columns(2)

    with s_col1:
        st.write("<b>Backend Server:</b>", "🟢 Operational" if backend_ok else "🔴 Offline (Demo Active)", unsafe_allow_html=True)
        st.write("<b>Backend URL:</b>", f"`{BACKEND_URL}`")
        st.write("<b>Application Version:</b>", f"LegalEase v{APP_VERSION}")

    with s_col2:
        api_key_configured = bool(os.getenv("GEMINI_API_KEY")) and "MY_GEMINI_API_KEY" not in os.getenv("GEMINI_API_KEY", "")
        st.write("<b>Gemini API Key:</b>", "🟢 Configured" if api_key_configured else "⚪ Not Configured", unsafe_allow_html=True)
        st.write("<b>Gemini Status:</b>", "Connected" if (api_key_configured and backend_ok) else "Demo Mode Ready")
        st.write("<b>Free Tier Safety:</b>", "Active (Zero Paid Services)")

    st.divider()
    st.subheader("About LegalEase Free Tier Architecture")
    st.markdown("""
    - **Single AI Call Per Request**: Exactly one call is dispatched when clicking "Generate Document". No background polling or keystroke-triggered AI queries.
    - **Zero-Crash Resilience**: If API quota is reached, key is absent, or backend is unreachable, the system transparently serves complete, realistic sample templates.
    - **Privacy First**: API keys reside solely on the backend environment; no private credentials or personal data are exposed to frontend clients.
    """)

# Footer Disclaimer
st.markdown("""
    <div style="text-align: center; margin-top: 40px; padding: 20px; font-size: 11px; color: #94A3B8; border-top: 1px solid #E6DFD5;">
        LegalEase © 2026. Automated legal document drafter. Not legal advice. Free Tier & Demo Mode Compliant.
    </div>
""", unsafe_allow_html=True)
