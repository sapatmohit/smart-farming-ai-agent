# System Architecture

## Overview
The Smart Farming AI Agent allows farmers to get real-time advice using natural language.

## Components

### Frontend (Next.js)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Integration**: Fetches data from backend via REST API (`/api/chat`).

### Backend (Rust)
- **Server**: Actix Web
- **RAG Engine**: 
  - Retrieves relevant farming data from `data/` directories (JSON/CSV).
  - Contextualizes queries.
- **LLM Integration**:
  - Connects to IBM Granite via IBM Cloud WatsonX AI.
  - Uses `reqwest` for API calls.

### Data Storage
- Local data files for Hackathon MVP (Weather, Soil, Market Prices).
- In-memory vector store (future scope).

## Deployment
- **IBM Cloud**: Cloud Foundry or Code Engine for backend.
- **Vercel/Netlify**: Frontend hosting (or static export).
