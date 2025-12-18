# 🌾 Kisan Mitra AI - Smart Farming Agent

AI-powered Smart Farming Assistant using **Rust (Axum)**, **Next.js**, **IBM Granite LLM**, and **RAG** on **IBM Cloud**.

## 🚜 Problem Statement
Supports small-scale Indian farmers with real-time, localized agricultural advice:
- 🌱 Seasonal crop recommendations
- 🌤️ Weather-aware guidance
- 🧪 Soil-based suggestions
- 🐛 Pest & disease control
- 💰 Live mandi prices

## 🧠 Tech Stack
| Component | Technology |
|-----------|------------|
| Backend | Rust + Axum |
| Frontend | Next.js 14 (App Router) |
| LLM | IBM Granite |
| Cloud | IBM Cloud Lite |
| RAG | In-memory Knowledge Base |
| i18n | English, Hindi, Marathi |

## 📂 Project Structure
```
smart-farming-ai-agent/
├── backend/                 # Rust Axum server
│   ├── src/
│   │   ├── api/            # REST endpoints
│   │   ├── rag/            # RAG pipeline
│   │   ├── services/       # IBM Cloud integration
│   │   └── utils/
│   └── Cargo.toml
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── i18n/           # Translations
│   │   └── lib/            # API client
│   └── package.json
└── docs/
```

## 🔐 Environment Setup

1. Copy `.env.example` to `.env`
2. Add your IBM Cloud credentials:
```env
IBM_CLOUD_API_KEY=your_api_key_here
IBM_PROJECT_ID=your_project_id
IBM_GRANITE_MODEL_ID=ibm/granite-13b-chat-v2
IBM_REGION=us-south
BACKEND_PORT=8080
```

## 🚀 Running Locally

### Backend (Rust)
```bash
cd backend
cargo run
```

### Frontend (Next.js with Bun)
```bash
cd frontend
bun install
bun dev
```

### Build for Production
```bash
cd frontend
bun run build
```

## 🔌 API Endpoints

### `POST /api/chat`
```json
{
  "query": "What crop should I plant this season?",
  "language": "en"
}
```

Response:
```json
{
  "answer": "Based on current season...",
  "sources": ["ICAR Guidelines", "IMD Advisory"],
  "confidence": "high",
  "detected_language": "en"
}
```

## ⚠️ Important
- All commits and pushes from **GitHub account: sapatmohit** only
- Never commit `.env` files

## � Resources
- Kisan Call Center: **1551** (24x7 Free)
- [ICAR Portal](https://icar.org.in)
- [AgriMarket](https://agmarknet.gov.in)

---
Built with ❤️ for Indian Farmers | Hackathon Project
