# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cégverzum** — a full-featured company information system (céginformációs rendszer), similar to Opten. Aggregates Hungarian business data from multiple government APIs (NAV, Cégbíróság, KSH) into a searchable, analytics-ready platform with partner access.

## Architecture

```
[NAV API] [Cégbíróság] [KSH] [egyéb források]
        ↓  (napi Celery job)
      [PostgreSQL adatbázis]
        ↓
      [FastAPI backend]
        ↓
      [React frontend]
        ↓
    [Partnerek böngészőben]
```

- **Backend**: Python / FastAPI — REST API with auto-generated OpenAPI docs
- **Database**: PostgreSQL (structured company data); Elasticsearch planned for full-text search (cégnév, adószám, cím)
- **Frontend**: React with Chart.js or Recharts for dashboards and analytics
- **Background jobs**: Celery + Redis — scheduled daily sync from external data sources
- **Auth**: JWT token-based authentication for partner login
- **Deployment**: VPS (Ubuntu), not shared hosting — Python backend, Celery workers, Redis, and Postgres all require dedicated processes

## Build & Run Commands

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt        # install dependencies
uvicorn app.main:app --reload           # dev server (default: http://localhost:8000)
pytest                                  # run all tests
pytest tests/test_specific.py           # run a single test file
pytest -k "test_name"                   # run a specific test by name
```

### Frontend (React)
```bash
cd frontend
npm install                             # install dependencies
npm run dev                             # dev server
npm run build                           # production build
npm test                                # run tests
```

### Background Workers
```bash
celery -A app.worker worker --loglevel=info    # start Celery worker
celery -A app.worker beat --loglevel=info       # start Celery beat scheduler
```

## Key Data Model

The core entity is the **Company (Cég)** record, aggregating data from multiple sources. Expected scale: ~500,000 companies.

## External API Integrations

- **NAV** — tax authority data (adószám-based lookups)
- **Cégbíróság** — court registry (cégjegyzékszám, company officers, filings)
- **KSH** — statistical office (TEÁOR codes, economic indicators)

Each integration has its own scheduled Celery task for daily data synchronization.

## Language

The codebase uses English for code (variable names, functions, API endpoints). Hungarian is used for user-facing content, UI labels, and domain-specific terms (e.g., adószám, cégjegyzékszám, székhely).
