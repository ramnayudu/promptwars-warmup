# ClaimBridge - Project Architecture (Feature-Sliced Design)

## Overview
The application follows a strict Feature-Sliced Design (FSD) pattern for strict separation of concerns, high maintainability, and scalability. This methodology aligns perfectly with Next.js 16 paradigms.

## Directory Structure
```text
src/
├── app/                  # App Router entry points (pages, layouts, routing)
│   ├── (auth)/           # Authentication routes
│   ├── dashboard/        # Main claim processing UI
│   └── api/              # API and internal webhooks (e.g., /api/vahan)
├── widgets/              # Independent, reusable composite UI blocks
│   ├── ClaimProcessor/   # Combines uploader and live status
│   └── PolicyViewer/     # Displays extracted clause and coverage info
├── features/             # Business logic interactions
│   ├── process-claim/    # Upload forms, parsing orchestrator
│   └── upload-policy/    # Validation and structural extraction
├── entities/             # Business entities (types, state logic)
│   ├── user/             # User profile, firebase auth hooks
│   ├── claim/            # Claim status interface and data models
│   ├── policy/           # Structured insurance policy outputs
│   └── vehicle/          # VAHAN mock entity
└── shared/               # Shared utilities, UI kit, API clients
    ├── ui/               # Base components (Radix UI, styling tokens)
    ├── api/              # Firebase clients, Vertex AI instantiations
    ├── lib/              # Zod schemas, formatters, TSDoc types
    └── config/           # ENV mapping, Secret Manager clients
```

## Layers Description

1. **App**: Layer containing global setups, Next.js routing, providers, and initialization scopes. Handles PPR directives.
2. **Widgets**: High-level components composing multiple features and entities to create complete functional interfaces.
3. **Features**: Action-oriented modules, encapsulating user interactions tightly to business constraints (e.g., uploading the damage images or triggering Gemini).
4. **Entities**: Domain-specific structural data, types, isolated reducers/state models representing primary objects.
5. **Shared**: Completely decoupled foundational elements - strictly generic UI components, core types, external system adapters.

## Data Flow
- Standard requests enter via **app** routes.
- Routing renders **widgets** constructed via **shared/ui**.
- **Widgets** utilize **features** controllers.
- **Features** extract or mutate domains scoped in **entities**.
- External communications flow through highly-typed contracts stored in **shared/api**.
