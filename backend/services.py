"""
LegalEase Document Services
Provides realistic fallback templates, Gemini AI integration, and file export helpers.
"""

import os
import datetime
from typing import List, Dict, Any, Optional

# Realistic demo templates
DEMO_TEMPLATES = {
    "NDA": """MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into and made effective as of {effective_date} (the "Effective Date"), by and between:

PARTIES:
{parties_text}

1. PURPOSE
The Parties wish to explore a mutually beneficial business opportunity and in connection therewith desire to disclose to each other certain confidential, proprietary, and technical information.

2. CONFIDENTIAL INFORMATION
"Confidential Information" refers to any proprietary information, technical data, trade secrets, know-how, business plans, software code, customer data, and terms disclosed by either party, whether disclosed orally or in writing.

3. OBLIGATIONS OF THE RECEIVING PARTY
The receiving party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the disclosing party. The receiving party shall not disclose or publish such information to any third party without prior written authorization.

4. SPECIFIC TERMS & CONDITIONS
{terms_text}

5. TERM AND TERMINATION
The obligations under this Agreement shall survive for a period of two (2) years from the Effective Date or until such time as the disclosing party releases the receiving party from such obligations in writing.

6. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law principles.

7. ENTIRE AGREEMENT
This Agreement constitutes the entire understanding between the parties with respect to confidentiality and supersedes all prior agreements.

IN WITNESS WHEREOF, the Parties hereto have executed this Mutual Non-Disclosure Agreement as of the Effective Date written above.

_____________________________                _____________________________
For: Party A                                 For: Party B
Date: {effective_date}                       Date: {effective_date}
""",

    "Employment Contract": """STANDARD EMPLOYMENT AGREEMENT

This Employment Agreement (the "Agreement") is made and entered into as of {effective_date}, by and between:

PARTIES:
{parties_text}

1. POSITION AND DUTIES
The Employer agrees to employ the Employee, and the Employee agrees to provide dedicated professional services in good faith according to the established company standards and guidelines.

2. COMMENCEMENT DATE
The Employee's employment shall commence on {effective_date} and shall continue until terminated in accordance with the provisions set forth herein.

3. COMPENSATION AND BENEFITS
The Employee shall receive remuneration and applicable benefits as agreed upon between the parties, payable in accordance with the standard payroll schedule.

4. AGREED TERMS & WORKPLACE POLICIES
{terms_text}

5. CONFIDENTIALITY & INTELLECTUAL PROPERTY
All materials, inventions, works of authorship, and business secrets developed by the Employee in connection with the employment shall remain the sole and exclusive property of the Employer.

6. TERMINATION
Either party may terminate this employment relationship by providing written notice in accordance with statutory guidelines and mutual company policy.

7. GOVERNING LAW
This Agreement is subject to and governed by the labor laws of the jurisdiction of employment.

IN WITNESS WHEREOF, the parties hereto have signed this Agreement as of the Effective Date.

_____________________________                _____________________________
Employer Signature                           Employee Signature
Date: {effective_date}                       Date: {effective_date}
""",

    "Lease Agreement": """RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement (the "Lease") is entered into as of {effective_date}, by and between:

PARTIES:
{parties_text}

1. PREMISES
The Landlord hereby leases to the Tenant the designated residential property premises, to be occupied solely for private residential living purposes.

2. TERM OF LEASE
The term of this Lease shall commence on {effective_date} and shall continue on a month-to-month or defined term basis as specified by the parties.

3. RENT & SECURITY DEPOSIT
The Tenant covenants and agrees to pay the stipulated rent promptly on the first day of each calendar month. A security deposit shall be held to cover damages or unpaid obligations.

4. LEASE STIPULATIONS & TERMS
{terms_text}

5. MAINTENANCE AND REPAIRS
The Tenant shall keep the premises in good, clean condition and shall immediately notify the Landlord of any defects or required structural repairs.

6. SURRENDER OF PREMISES
Upon termination of the tenancy, the Tenant shall peacefully vacate and surrender the premises in as good condition as at the commencement of the Lease, ordinary wear and tear excepted.

7. GOVERNING LAW
This Lease shall be governed by and construed under the landlord-tenant statutes of the local jurisdiction.

IN WITNESS WHEREOF, the Landlord and Tenant have executed this Residential Lease Agreement.

_____________________________                _____________________________
Landlord Signature                           Tenant Signature
Date: {effective_date}                       Date: {effective_date}
""",

    "Freelance Contract": """INDEPENDENT CONTRACTOR & FREELANCE SERVICES AGREEMENT

This Freelance Services Agreement (the "Agreement") is made effective as of {effective_date}, by and between:

PARTIES:
{parties_text}

1. SERVICES RENDERED
The Contractor agrees to perform the professional services, deliverables, and milestones outlined in the agreed project scope in a timely, professional manner.

2. INDEPENDENT CONTRACTOR STATUS
The Contractor is an independent contractor and not an employee, agent, partner, or joint venturer of the Client. Contractor is solely responsible for all applicable taxes and insurances.

3. PROJECT TERMS & MILESTONES
{terms_text}

4. INTELLECTUAL PROPERTY RIGHTS
Upon receipt of full payment from the Client, Contractor transfers and assigns to the Client all right, title, and interest in and to the final deliverables created under this Agreement.

5. PAYMENT TERMS
Invoices shall be submitted by the Contractor and settled by the Client according to the agreed schedule (e.g. Net 15 / Net 30). Late payments may accrue standard interest as permitted by law.

6. TERMINATION
Either party may terminate this Agreement upon written notice if the other party breaches any material term or upon mutual convenience with reasonable notice.

7. GOVERNING LAW
This Agreement shall be interpreted and enforced under the laws of the agreed jurisdiction.

IN WITNESS WHEREOF, the parties execute this Freelance Services Agreement as of {effective_date}.

_____________________________                _____________________________
Client Signature                             Contractor Signature
Date: {effective_date}                       Date: {effective_date}
""",

    "Custom": """LEGAL COVENANT & GENERAL BINDING AGREEMENT

This Agreement is made and entered into as of {effective_date}, by and between the undersigned parties:

PARTIES:
{parties_text}

PREAMBLE
WHEREAS, the Parties seek to formalize their mutual rights, responsibilities, and covenants with respect to their ongoing cooperation;

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the Parties agree as follows:

1. OPERATIVE TERMS & PROVISIONS
{terms_text}

2. REPRESENTATIONS & WARRANTIES
Each party represents that they possess full legal power, capacity, and authority to enter into and perform the obligations set forth under this Agreement.

3. SEVERABILITY
If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

4. GOVERNING LAW & DISPUTE RESOLUTION
This Agreement shall be governed in all respects by the laws of the applicable jurisdiction, and disputes shall be resolved through good faith negotiation or mediation.

IN WITNESS WHEREOF, the Parties execute this Agreement as of {effective_date}.

_____________________________                _____________________________
First Party Signature                        Second Party Signature
Date: {effective_date}                       Date: {effective_date}
"""
}


def build_demo_document(doc_type: str, parties: List[str], terms: List[str], effective_date: str) -> str:
    """Returns a realistic, formatted legal document based on user inputs."""
    template_key = doc_type if doc_type in DEMO_TEMPLATES else "Custom"
    template = DEMO_TEMPLATES.get(template_key, DEMO_TEMPLATES["Custom"])

    # Format parties
    if parties:
        formatted_parties = "\n".join([f"- Party {i+1}: {p.strip()}" for i, p in enumerate(parties) if p.strip()])
    else:
        formatted_parties = "- Disclosing Party: [First Party Name]\n- Receiving Party: [Second Party Name]"

    # Format terms
    if terms:
        formatted_terms = "\n".join([f"  4.{i+1}. {t.strip()}" for i, t in enumerate(terms) if t.strip()])
    else:
        formatted_terms = "  4.1. Standard confidentiality and performance covenants apply.\n  4.2. Mutual good-faith execution of all responsibilities."

    date_str = effective_date or datetime.date.today().strftime("%B %d, %Y")

    return template.format(
        effective_date=date_str,
        parties_text=formatted_parties,
        terms_text=formatted_terms
    )


def generate_with_gemini(doc_type: str, parties: List[str], terms: List[str], effective_date: str) -> tuple[Optional[str], str]:
    """
    Calls Google Gemini using the free tier API.
    Returns (content, mode) where mode is 'live' or 'demo'.
    Handles missing keys, timeouts, quotas, and errors safely.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "" or "MY_GEMINI_API_KEY" in api_key:
        return build_demo_document(doc_type, parties, terms, effective_date), "demo"

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        # Free-tier fast and reliable model
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        parties_str = ", ".join(parties) if parties else "Undersigned Parties"
        terms_str = "\n".join([f"- {t}" for t in terms]) if terms else "Standard commercial terms"
        
        prompt = f"""You are a professional legal drafting assistant.
Create a formal, clean, clear {doc_type} ready for execution.
Effective Date: {effective_date}
Parties involved: {parties_str}
Key terms and clauses to include:
{terms_str}

Format the agreement with clear section titles, numbered paragraphs, and signature execution blocks at the end.
Do not use markdown bolding (**) inside section titles, keep the document clean, formal and editorial.
Include a standard severability and governing law clause.
"""
        response = model.generate_content(prompt)
        if response and response.text:
            return response.text.strip(), "live"
        else:
            return build_demo_document(doc_type, parties, terms, effective_date), "demo"

    except Exception:
        # Graceful fallback: return demo mode without ever crashing
        return build_demo_document(doc_type, parties, terms, effective_date), "demo"
