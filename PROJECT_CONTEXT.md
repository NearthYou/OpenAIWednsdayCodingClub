# Project Context Ledger

## Mission
Build a modern, simple market-intelligence website that:
- automatically fetches the latest economy and stock-market headlines
- lets the user paste article text or an article URL for deeper analysis
- extracts stock-related keywords and narratives
- estimates market, FX, and stock-impact scenarios
- suggests watchlist ideas with risk notes
- presents everything in a React-based UI

## Operating Rules
- This file is the single source of truth for future agents and future sessions.
- Update this file after each completed task.
- Keep plan status, decisions, blockers, changed files, and next actions here.
- If context is reset, resume work by reading this file first.
- Treat all market commentary as educational analysis, not investment advice.

## Architecture Decisions
- Backend: `Flask` on Python because Node.js is not available in the current environment.
- Frontend: `React` without a Node build step, loaded directly in the browser.
- News ingestion: Google News RSS for latest headlines, plus Korean RSS feeds from local media and manual article URL/text input.
- Article parsing: fetch the user-provided URL and extract the most relevant paragraphs.
- AI analysis: OpenAI Chat Completions API with structured JSON output.
- UX direction: dark-mode dashboard with visualization-first layout and fast scanning of market signals.

## Agent Workstreams
- `Coordinator Agent`
  - Role: maintain this ledger, sync plan state, and keep handoff notes current.
  - Status: active
- `Backend Agent`
  - Role: implement Flask API, RSS ingestion, article parsing, and analysis pipeline.
  - Status: active
- `Frontend Agent`
  - Role: implement React dashboard, article input flows, and analysis result cards.
  - Status: active
- `Prompt/AI Agent`
  - Role: define structured analysis schema and OpenAI prompt behavior.
  - Status: active

## Master Plan
- [x] 1. Create a shared context ledger for cross-agent continuity.
- [x] 2. Scaffold the project structure for Flask backend and React frontend.
- [x] 3. Implement automatic news ingestion and manual article input APIs.
- [x] 4. Implement market-analysis pipeline and OpenAI integration.
- [x] 5. Build the modern React dashboard UI.
- [x] 6. Verify flows, document setup, and finalize handoff notes.

## Current Status
- Current focus: upgraded dashboard complete; next work can expand deployment polish, saved history, and model quality.
- Last completed task: rebuilt the UI into a dark analytics dashboard, added Korean news ingestion, and balanced all-market news mixing.
- Next task: optional follow-up work includes stronger article extraction, saved sessions, and production deployment polish.
- Active risks:
  - No Node.js is installed, so React must run without a local bundler.
  - Auto-fetched RSS headlines may not always contain full article text.
  - Some publisher pages may block scraping or expose limited article text.
  - Fallback Vercel deploy flow is still returning 404 for Python preview builds and needs a separate deployment fix path.

## Task Log
- 2026-03-11: Initialized project ledger, execution rules, architecture decisions, and workstream roles.
- 2026-03-11: Added the Flask entrypoint, environment template, service module skeletons, React app shell, and modern dashboard styling.
- 2026-03-11: Implemented live RSS ingestion, article URL/text resolution, and backend endpoints for news and article preparation.
- 2026-03-11: Added structured market analysis generation, OpenAI request scaffolding, heuristic fallback behavior, and endpoint tests.
- 2026-03-11: Connected the full React dashboard, added smoke tests and setup docs, and fixed false-positive topic matching found during regression testing.
- 2026-03-11: Created a Vercel preview deployment and recorded the preview/claim URLs for handoff continuity.
- 2026-03-11: Added explicit Vercel routing and public asset serving after the first preview returned 404.
- 2026-03-11: Added a dedicated `api/index.py` Vercel entrypoint to improve Python function detection.
- 2026-03-11: Rebuilt the frontend into a dark visualization dashboard and expanded news ingestion to include Korean and Korean-media feeds.
- 2026-03-11: Attempted redeployment after the dashboard upgrade, but the fallback Vercel preview flow still returned 404.
- 2026-03-11: Reworked the dashboard into a tabbed summary/detail layout, reduced vertical sprawl, and added abortable fetches for faster-feeling interactions.

## Changed Files
- `PROJECT_CONTEXT.md`: created the continuity ledger for all future work.
- `.gitignore`: ignore local environment files and Python caches.
- `.env.example`: added runtime environment variable template.
- `requirements.txt`: added Python dependencies for the MVP.
- `app.py`: added the Flask application factory and base routes.
- `services/__init__.py`: created the service package.
- `services/news_service.py`: added news ingestion placeholder module.
- `services/news_service.py`: implemented Google News RSS fetching and normalization helpers.
- `services/article_service.py`: implemented manual text handling and article URL extraction.
- `services/analysis_service.py`: implemented OpenAI-backed and heuristic market-analysis generation.
- `app.py`: added the analysis endpoint and fallback article-resolution behavior.
- `templates/index.html`: added the React app host template.
- `static/js/app.js`: replaced the shell UI with the live React dashboard wired to backend APIs.
- `static/css/styles.css`: expanded the visual system for the interactive dashboard layout.
- `public/js/app.js`: rebuilt the app into a dark visualization-first dashboard with charts and region-aware news exploration.
- `public/css/styles.css`: replaced the light UI styling with a dark analytics dashboard design system.
- `public/js/app.js`: added tabbed navigation, summary/detail separation, accordion details, and abortable fetch-based interaction handling.
- `public/css/styles.css`: updated the layout system for compact tabs, split panels, and reduced-scroll dashboard navigation.
- `services/news_service.py`: added Korean RSS ingestion, region metadata, sentiment scoring, and balanced all-market mixing.
- `README.md`: documented setup, usage, endpoints, and testing.
- `tests/test_app.py`: added smoke tests and a regression test for topic matching.
- `vercel.json`: added explicit rewrite to route requests to the Flask entrypoint on Vercel.
- `api/index.py`: added a dedicated Vercel Python function entrypoint.

## Handoff Notes
- Use this file first when resuming work.
- Keep implementation incremental and update plan + ledger together after each major task.
- Latest preview deployment: `https://skill-deploy-gsmwrqbh62-codex-agent-deploys.vercel.app`
- Claim URL: `https://vercel.com/claim-deployment?code=43af86c0-6c25-41ce-8a85-01663b2bb7a8`
- Latest redeploy attempt that still returned 404: `https://skill-deploy-t42e9sl7yp-codex-agent-deploys.vercel.app`
