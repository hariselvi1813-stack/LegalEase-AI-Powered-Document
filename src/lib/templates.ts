/**
 * LegalEase Document Templates and Presets
 */

export interface DocTemplateDefinition {
  id: string;
  name: string;
  description: string;
  defaultParties: string[];
  partyRoleLabels: [string, string];
  suggestedTerms: string[];
  template: (parties: string[], terms: string[], effectiveDate: string) => string;
}

export const DOCUMENT_TEMPLATES: Record<string, DocTemplateDefinition> = {
  NDA: {
    id: "NDA",
    name: "Non-Disclosure Agreement (NDA)",
    description: "Mutual protection of trade secrets, proprietary technical data, and confidential commercial dealings.",
    defaultParties: ["Vanguard Innovations Inc.", "Apex Research Partners LLC"],
    partyRoleLabels: ["Disclosing / First Party", "Receiving / Second Party"],
    suggestedTerms: [
      "2-year mutual non-disclosure duration",
      "Confidentiality covers source code, client records, and strategic roadmaps",
      "Standard carve-outs for publicly known information and court-ordered subpoenas",
      "Remedies include injunctive relief and recovery of reasonable legal fees",
      "Governing jurisdiction: State of Delaware"
    ],
    template: (parties, terms, effectiveDate) => {
      const p1 = parties[0] || "Disclosing Party";
      const p2 = parties[1] || "Receiving Party";
      const dateStr = effectiveDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      
      const termsList = terms.length > 0
        ? terms.map((t, i) => `  4.${i + 1}. ${t}`).join("\n")
        : "  4.1. The receiving party agrees to hold all disclosed trade secrets in strict confidence.\n  4.2. Disclosure is restricted strictly to employees with an immediate need to know.";

      return `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into and made effective as of ${dateStr} (the "Effective Date"), by and between:

PARTIES:
- Disclosing Party: ${p1}
- Receiving Party: ${p2}
(individually referred to as a "Party" and collectively as the "Parties").

1. PURPOSE
The Parties wish to explore mutually beneficial business and technical collaboration and, in connection therewith, desire to disclose to each other certain confidential, proprietary, and commercial information.

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public, proprietary information, technical specifications, source code, product roadmaps, financial projections, customer identities, and business strategies disclosed by either Party to the other, whether disclosed verbally, in writing, electronically, or by inspection of tangible items.

3. OBLIGATIONS & STANDARD OF CARE
Each receiving Party covenants that it shall:
(a) Protect and preserve the confidentiality of the disclosing Party's Confidential Information with the same degree of care it exercises for its own confidential assets, but not less than a reasonable standard of care;
(b) Refrain from disclosing, reproducing, publishing, or disseminating any Confidential Information to any third party without prior written consent;
(c) Restrict access solely to its officers, directors, and employees who require access for the defined Purpose and who are bound by confidentiality obligations at least as restrictive as those contained herein.

4. SPECIFIC COVENANTS & NEGOTIATED TERMS
${termsList}

5. EXCLUSIONS FROM CONFIDENTIALITY
Confidential Information does not include information that:
(a) Is or becomes generally available to the public without breach of this Agreement;
(b) Was rightfully known to the receiving Party prior to disclosure without confidentiality restrictions;
(c) Is independently developed by the receiving Party without reliance upon or reference to the disclosing Party's Confidential Information;
(d) Is required to be disclosed pursuant to a lawful court order or regulatory authority, provided prompt written notice is given to the disclosing Party.

6. TERM AND SURVIVAL
This Agreement shall remain in effect for two (2) years from the Effective Date, and the confidentiality covenants shall survive termination or expiration for a period of three (3) years thereafter.

7. GOVERNING LAW & JURISDICTION
This Agreement shall be construed, interpreted, and governed under the laws of the State of Delaware without regard to its conflict of law principles.

IN WITNESS WHEREOF, the Parties hereto have caused this Mutual Non-Disclosure Agreement to be executed by their duly authorized representatives as of the Effective Date.

____________________________________            ____________________________________
For: ${p1}                                      For: ${p2}
Authorized Signature                            Authorized Signature
Date: ${dateStr}                                Date: ${dateStr}`;
    }
  },

  "Employment Contract": {
    id: "Employment Contract",
    name: "Standard Employment Agreement",
    description: "Formal full-time or part-time employment covenants, remuneration, IP assignment, and workplace terms.",
    defaultParties: ["Beacon Software Corp.", "Elena Rostova"],
    partyRoleLabels: ["Employer", "Employee"],
    suggestedTerms: [
      "Full-time exempt position with 40 anticipated hours weekly",
      "Base remuneration of $120,000 annually payable on semi-monthly schedule",
      "3 weeks paid annual leave and comprehensive medical benefits",
      "Pre-invention assignment and intellectual property surrender to Employer",
      "60-day post-termination non-solicitation of clients and staff"
    ],
    template: (parties, terms, effectiveDate) => {
      const employer = parties[0] || "Employer";
      const employee = parties[1] || "Employee";
      const dateStr = effectiveDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      
      const termsList = terms.length > 0
        ? terms.map((t, i) => `  4.${i + 1}. ${t}`).join("\n")
        : "  4.1. Regular working hours and performance reviews in accordance with company handbook.\n  4.2. Standard bonus entitlement based upon mutual corporate milestones.";

      return `STANDARD EMPLOYMENT AGREEMENT

This Employment Agreement (the "Agreement") is made and entered into as of ${dateStr} (the "Commencement Date"), by and between:

PARTIES:
- Employer: ${employer} ("Employer")
- Employee: ${employee} ("Employee")

1. POSITION AND RESPONSIBILITIES
The Employer agrees to employ the Employee, and the Employee agrees to render professional services in good faith, devoting reasonable full-time professional efforts, diligence, and expertise to advancing the business of the Employer.

2. TERM OF ENGAGEMENT
Employment under this Agreement shall commence on ${dateStr} and shall proceed on an at-will basis, subject to written notice requirements in accordance with applicable statutory guidelines.

3. COMPENSATION AND BENEFITS
The Employer shall pay the Employee compensation as agreed, less applicable taxes and withholdings, payable in accordance with the Employer's regular payroll practices. The Employee shall be eligible to participate in such benefit plans as are maintained for comparable employees.

4. OPERATIONAL TERMS & WORKING CONDITIONS
${termsList}

5. INTELLECTUAL PROPERTY & WORKS FOR HIRE
The Employee agrees that all inventions, discoveries, designs, software programs, trade secrets, and improvements conceived, produced, or reduced to practice during the course of employment shall be deemed "works made for hire" and shall remain the exclusive property of the Employer.

6. CONFIDENTIALITY
The Employee shall maintain in strictest confidence all non-public technical, customer, and financial data belonging to the Employer during and following the term of employment.

7. TERMINATION
Either party may terminate the employment relationship at any time, with or without cause, upon two (2) weeks written notice, subject to any statutory notice periods.

IN WITNESS WHEREOF, the parties hereto have executed this Employment Agreement.

____________________________________            ____________________________________
Employer: ${employer}                           Employee: ${employee}
Authorized Officer                              Signature
Date: ${dateStr}                                Date: ${dateStr}`;
    }
  },

  "Lease Agreement": {
    id: "Lease Agreement",
    name: "Residential Lease Agreement",
    description: "Residential dwelling lease covering monthly rental consideration, security deposit, maintenance, and occupancy.",
    defaultParties: ["Crestview Properties Management", "Marcus Bennett"],
    partyRoleLabels: ["Landlord / Lessor", "Tenant / Lessee"],
    suggestedTerms: [
      "Monthly rent of $2,400 due on the first day of each calendar month",
      "Security deposit equal to 1.5 months rent held in escrow",
      "Tenant responsible for gas, electricity, and telecommunications",
      "No sub-leasing or short-term vacation rentals permitted without consent",
      "Quiet hours enforced from 10:00 PM to 7:00 AM daily"
    ],
    template: (parties, terms, effectiveDate) => {
      const landlord = parties[0] || "Landlord";
      const tenant = parties[1] || "Tenant";
      const dateStr = effectiveDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      
      const termsList = terms.length > 0
        ? terms.map((t, i) => `  4.${i + 1}. ${t}`).join("\n")
        : "  4.1. Premises to be utilized exclusively for lawful residential living.\n  4.2. Regular maintenance obligations fulfilled promptly.";

      return `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement (the "Lease") is executed as of ${dateStr}, by and between:

PARTIES:
- Landlord / Lessor: ${landlord}
- Tenant / Lessee: ${tenant}

1. LEASED PREMISES
The Landlord hereby demises and leases to the Tenant the designated residential property unit, together with all appurtenant fixtures and common access rights, for private residential use only.

2. TERM OF TENANCY
The term of this Lease shall commence on ${dateStr} for an initial duration of twelve (12) months, automatically converting thereafter to a month-to-month tenancy unless terminated in writing sixty (60) days in advance.

3. RENT CONSIDERATION & SECURITY DEPOSIT
The Tenant covenants to pay monthly rent promptly on the first (1st) day of each month. A security deposit shall be deposited with the Landlord upon lease execution and shall be returned within thirty (30) days of surrender of the premises, less legitimate deductions for damages exceeding ordinary wear and tear.

4. OCCUPANCY COVENANTS & RESTRICTIONS
${termsList}

5. CARE, REPAIRS, AND ALTERATIONS
The Tenant shall maintain the interior of the premises in clean, sanitary order. No structural alterations, painting, or fixture removals shall be carried out without the prior written consent of the Landlord.

6. INSPECTION RIGHTS
The Landlord or authorized agents may enter the premises during reasonable daytime hours upon giving twenty-four (24) hours advance notice for repair inspections or showing to prospective buyers or tenants.

7. GOVERNING LAW
This Lease shall be governed and construed pursuant to the residential tenancy statutes of the jurisdiction where the premises are situated.

IN WITNESS WHEREOF, the parties hereto have signed this Residential Lease Agreement.

____________________________________            ____________________________________
Landlord: ${landlord}                           Tenant: ${tenant}
Authorized Signature                            Signature
Date: ${dateStr}                                Date: ${dateStr}`;
    }
  },

  "Freelance Contract": {
    id: "Freelance Contract",
    name: "Independent Contractor Services Agreement",
    description: "Milestone-based freelance contract with clear deliverables, copyright transfer, and net payment terms.",
    defaultParties: ["Northstar Digital Agency", "Devon Lee Creative Services"],
    partyRoleLabels: ["Client", "Contractor / Freelancer"],
    suggestedTerms: [
      "Total fixed project fee of $7,500 split into three equal milestone payments",
      "Final deliverable package submitted within 45 calendar days of kickoff",
      "Net 15 payment terms upon formal invoice submission",
      "Full assignment of all copyright, patent, and trademark rights upon settlement",
      "Two complimentary rounds of milestone revisions included"
    ],
    template: (parties, terms, effectiveDate) => {
      const client = parties[0] || "Client";
      const contractor = parties[1] || "Contractor";
      const dateStr = effectiveDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      
      const termsList = terms.length > 0
        ? terms.map((t, i) => `  3.${i + 1}. ${t}`).join("\n")
        : "  3.1. Standard milestone sign-off required prior to stage progression.\n  3.2. Delivery via electronic repository.";

      return `INDEPENDENT CONTRACTOR & FREELANCE SERVICES AGREEMENT

This Freelance Services Agreement (the "Agreement") is entered into as of ${dateStr} (the "Effective Date"), by and between:

PARTIES:
- Client: ${client} ("Client")
- Contractor: ${contractor} ("Contractor")

1. SCOPE OF SERVICES
The Contractor agrees to perform specialized professional services and deliver high-quality deliverables as mutually specified in agreed project statements. All work shall be performed with professional skill and care.

2. INDEPENDENT CONTRACTOR STATUS
The Contractor performs services as an independent contractor and not as an employee, partner, or joint venturer of the Client. Contractor shall be solely responsible for all income taxes, insurance, and self-employment deductions.

3. TERMS, MILESTONES & REMUNERATION
${termsList}

4. INTELLECTUAL PROPERTY & MORAL RIGHTS
Upon full receipt of payments due from Client, Contractor hereby unconditionally assigns and transfers to Client all right, title, and ownership in and to all deliverables created under this Agreement. Contractor retains rights in pre-existing background tools and workflows.

5. CONFIDENTIALITY
Contractor shall treat as strictly confidential all proprietary, business, and operational materials provided by the Client and shall not disclose such materials to third parties without prior written consent.

6. TERMINATION
Either party may terminate this Agreement without penalty upon fourteen (14) days written notice. In the event of early termination, Contractor shall be compensated pro-rata for all completed and accepted milestone work.

7. GOVERNING LAW & JURISDICTION
This Agreement is governed by the laws of the agreed jurisdiction, excluding its conflicts of laws provisions.

IN WITNESS WHEREOF, the parties have signed this Freelance Services Agreement.

____________________________________            ____________________________________
Client: ${client}                               Contractor: ${contractor}
Authorized Officer                              Authorized Signatory
Date: ${dateStr}                                Date: ${dateStr}`;
    }
  },

  Custom: {
    id: "Custom",
    name: "General Binding Covenant & Agreement",
    description: "Versatile, customizable commercial agreement for specialized partnerships, licensing, or settlements.",
    defaultParties: ["First Party Commercial Corp.", "Second Party Ventures LLC"],
    partyRoleLabels: ["First Party", "Second Party"],
    suggestedTerms: [
      "Mutual covenant to act in utmost good faith throughout the undertaking",
      "Explicit division of capital contributions and resource obligations",
      "Comprehensive indemnification for breach of warranty or misrepresentation",
      "Confidential dispute escalation via binding neutral mediation prior to litigation",
      "Severability: invalid clauses shall be reformed to preserve primary intent"
    ],
    template: (parties, terms, effectiveDate) => {
      const p1 = parties[0] || "Party One";
      const p2 = parties[1] || "Party Two";
      const dateStr = effectiveDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      
      const termsList = terms.length > 0
        ? terms.map((t, i) => `  1.${i + 1}. ${t}`).join("\n")
        : "  1.1. Mutual performance obligations carried out with commercial reasonableness.\n  1.2. Direct notice required for any proposed amendments.";

      return `GENERAL BINDING LEGAL AGREEMENT

This Agreement is made and entered into as of ${dateStr} (the "Effective Date"), by and between:

PARTIES:
- First Party: ${p1}
- Second Party: ${p2}

PREAMBLE
WHEREAS, the Parties desire to define their legal relationship, respective rights, obligations, and covenants in connection with their ongoing commercial undertakings;

NOW, THEREFORE, in consideration of the mutual promises, covenants, and valuable consideration exchanged herein, the Parties agree as follows:

1. OPERATIVE TERMS AND CONDITIONS
${termsList}

2. REPRESENTATIONS AND WARRANTIES
Each Party hereby warrants and represents to the other that:
(a) It has full legal authority and capacity to enter into, execute, and deliver this Agreement;
(b) The execution and performance of this Agreement does not violate or breach any other agreement, judgment, or order to which it is subject.

3. INDEMNIFICATION AND LIABILITY
Each Party shall defend, indemnify, and hold harmless the other Party and its officers from and against any third-party claims, liabilities, damages, and costs arising out of any material breach of this Agreement.

4. SEVERABILITY & WAIVER
If any provision of this Agreement is held to be invalid or unenforceable by a tribunal of competent jurisdiction, such provision shall be deemed modified to the minimum extent necessary, and the remaining terms shall remain in full force.

5. GOVERNING LAW & VENUE
This Agreement shall be governed by, and construed in accordance with, the laws of the applicable jurisdiction, without reference to conflict of laws principles.

IN WITNESS WHEREOF, the Parties have executed this General Binding Legal Agreement as of the date first written above.

____________________________________            ____________________________________
First Party: ${p1}                              Second Party: ${p2}
Authorized Signature                            Authorized Signature
Date: ${dateStr}                                Date: ${dateStr}`;
    }
  }
};
