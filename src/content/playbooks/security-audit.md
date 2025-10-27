---
title: "Security Audit"
description: "Practitioner playbook for Security Audit"
service: "security-audit"
github_folder: "security-audit"
---

# Security Audit and Update

A playbook for maintainers and pracitioners, in addition to their own resources.
**Note**: this is an intial draft. Please contribute improvements, or reach out directly.  

## Resources

## Security Audit Peer Review 

# Open Source Security – Peer Review Rubric  
(Aligned with OpenSSF Scorecard + Repository Security Best Practices)

**Purpose:** Evaluate the security posture and resilience of an open source project’s repository, workflows, dependencies, and contributor access.

**Scoring Scale per Criterion:**  
0 = Missing / No evidence  
1 = Weak / Ad-hoc  
2 = Adequate but partial coverage  
3 = Strong security posture, minor gaps  
4 = Excellent, proactive, and automated controls

---

## A. Access & Identity Security (0–12 pts)

| Criterion | Indicators of Excellence | Score |
|---------|--------------------------|------|
| **A1. Maintainer Account Security** | All organization/repo owners enforce 2FA; periodic access reviews. | 0–4 |
| **A2. Least-Privilege Roles** | Maintainer/admin roles minimized; automation uses granular tokens. | 0–4 |
| **A3. Protected Branches & Review Rules** | Required code reviews, status checks, signing/verification enforced. | 0–4 |

---

## B. Dependency & Supply-Chain Protection (0–16 pts)

| Criterion | Indicators of Excellence | Score |
|---------|--------------------------|------|
| **B1. Automated Dependency Scanning** | Dependabot or equivalent; alerts triaged promptly. | 0–4 |
| **B2. Vulnerability Remediation** | Clear SLA for fixing security CVEs; tracked in issue/PR workflow. | 0–4 |
| **B3. Trusted Sources & Pinning** | Version pinning, checksum verification, no unexpected external pulls. | 0–4 |
| **B4. Integrity & Signing** | Use of Sigstore/GPG for releases and/or provenance artifacts (SLSA). | 0–4 |

---

## C. Code Quality & Security Testing (0–12 pts)

| Criterion | Indicators of Excellence | Score |
|---------|--------------------------|------|
| **C1. Static/Dynamic Analysis** | Code scanning (CodeQL etc.) enabled and findings resolved. | 0–4 |
| **C2. CI Build Isolation & Hardening** | Builds run in protected environments; secrets masked and minimal. | 0–4 |
| **C3. Test Coverage for Critical Components** | Automated tests include security-relevant logic; coverage monitored. | 0–4 |

---

## D. Secure Practices for Contributors (0–12 pts)

| Criterion | Indicators of Excellence | Score |
|---------|--------------------------|------|
| **D1. Security Policy (SECURITY.md)** | Clear disclosure process; expected mitigations; protected contacts. | 0–4 |
| **D2. Issue Reporting & Triage Workflow** | Responsible disclosure honored; security issues tagged and tracked. | 0–4 |
| **D3. Contributor Safety in CI/CD** | No secret leakage; PR security validation before merge. | 0–4 |

---

## E. Risk Management & Governance Integration (0–8 pts)

| Criterion | Indicators of Excellence | Score |
|---------|--------------------------|------|
| **E1. Third-Party Access Risk** | Token rotation; dependency audits; trusted artifact registries. | 0–4 |
| **E2. Operational Security Maturity** | Adoption of frameworks: OpenSSF Scorecard, SLSA, OSSF Best Practices. | 0–4 |

---

## ✅ Total Score: **/ 60 pts**

| Rating | Descriptor |
|-------:|------------|
| 55–60 | Excellent – Secure automation and continuous security investment |
| 46–54 | Strong – Minor improvements needed |
| 34–45 | Adequate – Some material risks remain |
| 20–33 | Weak – Significant gaps in repository security |
| 0–19 | Not Viable – High security risk exposure |

---

## Reviewer Notes

- Security weaknesses found:  
- High-risk dependencies:  
- Secrets exposure history:  
- Recommended improvements:  
