# 🌐 Constellation Intelligence Platform

> Multi-agent, multi-layer investigative intelligence platform for law enforcement and intelligence analysts.

[![Live on Netlify](https://img.shields.io/badge/Netlify-LIVE%20PREVIEW-00C7B7?style=flat-square&logo=netlify)](https://constellation-platform.netlify.app)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](http://127.0.0.1:8000/docs)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue?style=flat-square&logo=python)](https://python.org)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite-61DAFB?style=flat-square&logo=react)](https://vitejs.dev)

- **Live Cloud Frontend**: **[https://constellation-platform.netlify.app](https://constellation-platform.netlify.app)**
- **GitHub Repository**: **[https://github.com/mysukanya/Constellation](https://github.com/mysukanya/Constellation)**
- **Architecture Documentation**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Reference**: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
- **Developer Guide**: [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)

---

## 🚀 Quick Start (Under 60 Seconds)

Launch both Backend and Frontend with a single command:
```bash
./start.sh
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
- **Interactive API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Manual Setup
1. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
2. **Start Backend:**
   ```bash
   ./backend/run.sh
   ```
3. **Start Frontend:**
   ```bash
   cd frontend && npm install && npm run dev
   ```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                  │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Dashboard │ │ Workspace  │ │ Intel    │ │ Audit    │ │
│  │ (Home)   │ │ (Canvas)   │ │ Feed     │ │ Ledger   │ │
│  └──────────┘ └────────────┘ └──────────┘ └──────────┘ │
│                        ▼                                 │
│              API Service (api.js)                        │
│              JWT Token Management                        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────┴──────────────────────────────────┐
│               Backend (FastAPI / Python)                  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              API Routers (14 modules)             │    │
│  │  auth · cases · entities · relationships         │    │
│  │  ingestion · entity-resolution · evidence        │    │
│  │  byomkesh · audit · home · hypotheses            │    │
│  │  sweep · workspaces · notifications              │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Services Layer (7 engines)           │    │
│  │  GraphService · AuditService · ByomkeshAgent     │    │
│  │  IngestionService · ERService · SweepService     │    │
│  │  AutonomousResearchService                        │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        ▼                                 │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │   Neo4j (Graph)   │  │   SQLite (Relational)     │    │
│  │   Knowledge Graph │  │   Users · Audit · ER      │    │
│  │   w/ Fallback     │  │   Evidence · Workspaces   │    │
│  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🔑 API Endpoints

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/register` | Register new account |
| **Auth** | POST | `/api/auth/login` | Login & get JWT token |
| **Auth** | GET | `/api/auth/me` | Get current user profile |
| **Cases** | GET/POST | `/api/cases` | List/create investigation cases |
| **Cases** | GET | `/api/cases/{id}/subgraph` | Get case knowledge graph |
| **Entities** | GET/POST | `/api/entities` | List/create graph entities |
| **Relationships** | POST | `/api/relationships` | Create typed relationships |
| **Ingestion** | POST | `/api/ingestion/upload-pdf` | Upload & parse PDF with NER |
| **Ingestion** | POST | `/api/ingestion/upload-csv` | Ingest structured call logs |
| **Ingestion** | POST | `/api/ingestion/upload-media` | Upload photos/audio/video |
| **Entity Resolution** | GET | `/api/entity-resolution/matches` | Get pending ER matches |
| **Entity Resolution** | POST | `/api/entity-resolution/matches/{id}/resolve` | Confirm/reject match |
| **Evidence** | GET | `/api/evidence` | List evidence items |
| **Byomkesh** | POST | `/api/byomkesh/query` | Query the AI investigation agent |
| **Hypotheses** | GET/POST | `/api/hypotheses` | Manage investigation hypotheses |
| **Hypotheses** | POST | `/api/hypotheses/{id}/challenge` | Challenge AI hypothesis |
| **Hypotheses** | POST | `/api/hypotheses/auto-research` | Run autonomous research |
| **Sweep** | GET/POST | `/api/sweep/latest` | 12-hour cross-case sweep |
| **Audit** | GET | `/api/audit/verify` | Verify HMAC hash-chain integrity |
| **Audit** | GET | `/api/audit/recent` | Recent audit events |
| **Workspaces** | CRUD | `/api/workspaces` | Manage investigation workspaces |
| **Notifications** | GET/POST | `/api/notifications` | User notifications |
| **Health** | GET | `/api/health` | System health check |

## 🔒 Security Features

- **JWT Authentication** — PBKDF2-HMAC-SHA256 password hashing with 100K iterations
- **HMAC Hash-Chain Audit Ledger** — Tamper-evident cryptographic chain for every write operation
- **Role-Based Access Control** — Admin, Investigator, Read-Only roles
- **Evidence Integrity** — SHA-256 hashing of all ingested evidence files
- **Legal Basis Enforcement** — Cases require legal justification before creation

## 🤖 AI / Intelligence Features

- **Byomkesh Agent** — LangGraph-based investigative query engine with mandatory citations
- **Autonomous Research** — Bounded multi-step investigation with hypothesis generation
- **Entity Resolution** — Probabilistic Fellegi-Sunter matching with human-in-the-loop confirmation
- **12-Hour Sweep Engine** — Cross-case pattern detection and contradiction analysis
- **NER Ingestion Pipeline** — spaCy-powered named entity extraction from documents

## ⚙️ Configuration

All configuration is managed via the `.env` file. Key settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `NVIDIA_API_KEY` | NVIDIA NIM API key for LLM | Optional |
| `NEO4J_URI` | Neo4j bolt connection | Optional |
| `JWT_SECRET_KEY` | JWT signing secret | Yes |
| `HMAC_SECRET_KEY` | Audit ledger HMAC key | Yes |

## 📝 Default Credentials

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `password` | Admin | Full Administrative & System Access |
| `investigator` | `password` | Investigator | Active Investigation, Board, Roping & Byomkesh |
| `analyst` | `password` | Read-Only | Read-Only Subgraphs, Timelines & Evidence |
