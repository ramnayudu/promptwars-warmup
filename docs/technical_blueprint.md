# ClaimBridge - Technical Blueprint

## 1. System Overview
ClaimBridge is a multimodal, agentic application bridging Indian accident victims with the insurance ecosystem. It processes vehicle damage photos and Indian insurance policy PDFs to analyze coverage against real-world data securely and swiftly.

## 2. Tech Stack
- **Framework**: Next.js 16 (App Router with PPR - Partial Prerendering)
- **Architecture**: Feature-Sliced Design (FSD)
- **Language**: TypeScript
- **Styling & UI**: Tailwind CSS, Radix UI Primitives (WCAG 2.2 Level AA compliant)
- **AI/ML**: Vertex AI SDK (Gemini 3 Flash for UI streaming/chat, Gemini 3.1 Pro for logic & multi-modal parsing)
- **Backend & Database**: Firebase (Auth, Firestore), Google Cloud Secret Manager
- **Infrastructure**: Docker (Multi-stage, Cloud Run), Google Log Explorer
- **Testing**: Vitest (Unit, >80% coverage), Playwright (E2E)

## 3. Core Agentic Flows
### 3.1 Policy-to-Ground Logic
- **Input**: Vehicle damage image(s) + Policy PDF.
- **Parsing**: Gemini 3.1 Pro extracts clauses (Consumables, Depreciation logic, Zero-Dep) and Insured Declared Value (IDV) securely from PDFs.
- **Grounding**: Vertex AI Google Search Grounding to fetch live spare part prices (e.g., 'Maruti Suzuki Swift bumper price in Bangalore 2026').
- **Comparison**: Automatically evaluates estimated damage cost structurally against IDV and policy coverage limits.

### 3.2 VAHAN API Simulation
- **Input**: Vehicle License Plate Number.
- **Simulation**: Mock API verifying registration details, owner name, active insurance status, and mismatch detection.

### 3.3 Artifact Generation
- **Artifact**: 1-click 'Ready-to-File' PDF claim package, aggregating images, parsed policy data, cost estimations, and verified VAHAN registration details via a clean layout.

## 4. Infrastructure & Security Guarantees
- **Secrets Management**: All environment secrets routed directly through Google Cloud Secret Manager (Hardcoding strictly prohibited).
- **Validation**: Input structurally typed and validated via Zod on all API and form boundaries.
- **Safety Measures**: Gemini Safety Settings enforced natively to detect and block prompt injection or toxic outputs.
- **Performance**: Cloud Run deployment via multi-stage Docker (<150KB initial payload target).
