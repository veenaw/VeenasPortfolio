# Veena’s conversational portfolio

Existing static HTML/CSS/JavaScript portfolio plus a Python FastAPI recruiter assistant.
The assistant answers from `backend/knowledge.json`, curated from Veena’s supplied résumé.
It returns plain text and expandable source excerpts. Every question is independent;
conversation history is displayed in the browser but is not sent back to the model.

## Run locally

Requires Python 3.12+ and Node 20+ for frontend tests. From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
# Edit backend/.env to set your own OPENAI_API_KEY. Do not commit it.
uvicorn backend.app:app --env-file backend/.env --reload --port 8000
```

In a second terminal:

```bash
python -m http.server 8080 --bind 127.0.0.1
```

Open http://localhost:8080. The local frontend automatically uses port 8000.
Do not expose the development file server publicly: it serves the repository,
including local configuration. Do not put secrets in any frontend file.

## Verify

```bash
python -m unittest backend.test_app -v
npm ci
npm test -- --runInBand
```

Backend tests stub the model: no key, network call or AI spend is needed. Run the
manual answer evaluation in [docs/LEARNING.md](docs/LEARNING.md) with your own key
before launch. Source IDs are validated, but factual grounding is a model behavior,
not a guarantee; manually inspect the answers.

## Deploy

1. Deploy the backend from this repository to a Python service (for example Render).
   Install command: `pip install -r backend/requirements.txt`.
   Start command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT --workers 1`.
   Set `OPENAI_API_KEY`, `OPENAI_MODEL` (default `gpt-4.1-mini`), and
   `ALLOWED_ORIGINS=https://veenaw.github.io` in the host’s secret/environment settings.
2. Verify `/health` reports `configured: true` and test an actual question.
3. Set the production URL in `chat-config.js` to `https://YOUR-BACKEND/api/chat`.
4. Keep GitHub Pages serving the static site. Do not merge/publish until you’ve
   reviewed the knowledge facts and completed live evaluation.

No API key is included. Until a backend URL is configured, visitors see a setup
message and can use existing contact links. The app does not persist chat messages;
questions are sent to OpenAI, whose processing policies still apply. Check host logs
and provider policies before making privacy promises.

Public endpoint controls: 6,000-character questions, 32 KB request bodies, 700 output
tokens, 30-second provider timeout, three concurrent provider requests, and 20 requests
per minute globally per process. These controls are deliberately simple and can cause
shared throttling. Use one worker. Before sustained public traffic, add a shared rate
limiter, edge abuse protection and provider spend alerts/budget controls. CORS controls
browser access only; it does not authenticate the endpoint or stop scripted abuse.

## Content maintenance

Update `backend/knowledge.json` to change what the assistant knows. Personal phone
and email are excluded from model context; existing website contact links remain.
Employer projects are experience summaries, not public-code claims. Expected education
must remain marked expected. The website’s older performance metrics were reconciled
to the supplied résumé. Review all public claims before launch.

The repository already tracks `node_modules` and coverage output; `.gitignore` prevents
new generated files but does not remove previously tracked files. Cleanup can be a
separate change.
