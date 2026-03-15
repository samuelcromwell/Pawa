# Pre-Screening Technical Assessment: Study Sprint AI

This repository contains a full-stack Q&A web app that integrates an LLM to generate structured study plans and learning guidance.

## Live Deployment

- Frontend: https://pawa-w9a8.vercel.app
- Backend API base: https://pawa-eight.vercel.app
- Backend Swagger docs: https://pawa-eight.vercel.app/docs
- Backend health: https://pawa-eight.vercel.app/health

## Stack

- Backend: FastAPI (Python)
- Frontend: Next.js + TailwindCSS
- LLM: DeepSeek (via OpenRouter free tier)

## Use Case

When users ask learning questions such as:

- "Create a 4-week Python study plan for a beginner with 1 hour daily."

the app returns a structured response including:

- Goal interpretation
- Week-by-week plan
- Daily practice routine
- Recommended resources
- Progress checklist

## Project Structure

- `backend/` FastAPI service and DeepSeek integration
- `frontend/` Next.js client application
- `PROMPTS.md` Prompt engineering notes and prompt versions used

## Backend Setup

1. Open a terminal in `backend/`.
2. Ensure Python packaging tools are installed (Ubuntu/Debian):
   - `sudo apt update && sudo apt install -y python3-pip python3-venv`
3. Create and activate a virtual environment:
   - `python3 -m venv .venv`
   - `source .venv/bin/activate`
4. Install dependencies:
   - `pip install -r requirements.txt`
5. Create an environment file:
   - copy `.env.example` to `.env`
6. Update `.env` values (minimum required):
   - `DEEPSEEK_API_KEY=...`
   - `DEEPSEEK_MODEL=deepseek/deepseek-chat-v3-0324:free`
7. Run the API server:
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

Alternative run command (from `backend/`):

- `python -m app.main`

Swagger docs are available at:

- `http://localhost:8000/docs`

## Frontend Setup

1. Open a terminal in `frontend/`.
2. Install dependencies:
   - `npm install`
3. Create an environment file:
   - copy `.env.example` to `.env.local`
4. For local full-stack testing, keep:
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
   - For production frontend against deployed backend use:
   - `NEXT_PUBLIC_API_BASE_URL=https://pawa-eight.vercel.app`
5. Start the frontend:
   - `npm run dev`

App URL:

- `http://localhost:3000`

## API Endpoint

- `POST /api/v1/ask`
  - Request body:
    ```json
    {
      "query": "Create a 4-week Python study plan for a beginner with 1 hour daily."
    }
    ```
  - Response body:
    ```json
    {
      "query": "Create a 4-week Python study plan for a beginner with 1 hour daily.",
      "answer": "...formatted markdown response...",
      "model": "deepseek/deepseek-chat-v3-0324:free",
      "use_case": "Study planning assistant"
    }
    ```

## Notes for Evaluators

- Basic input validation is implemented via Pydantic schemas.
- CORS is configured for local frontend-backend communication.
- API errors are normalized and surfaced with clear messages.
- Frontend includes loading state, error handling, markdown rendering, and query history bonus.

## Deployment

### Recommended (No card): Vercel for both backend and frontend

This path avoids Render billing verification.

#### 1) Deploy backend to Vercel first

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New -> Project** and import this repository.
3. Set **Root Directory** to `backend`.
4. In **Environment Variables**, add:
   - `DEEPSEEK_API_KEY` = your OpenRouter API key
   - `APP_ENV` = `production`
   - `FRONTEND_ORIGIN` = `http://localhost:3000` (temporary; update after frontend deploy)
5. Click **Deploy**.
6. After deploy, open these URLs to verify:
   - `https://pawa-eight.vercel.app/health`
   - `https://pawa-eight.vercel.app/docs`
7. Copy this backend base URL (without `/docs`).

#### 2) Deploy frontend to Vercel second

1. In Vercel, click **Add New -> Project** again and import the same repository.
2. Set **Root Directory** to `frontend`.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_BASE_URL` = backend URL from step 1
4. Click **Deploy**.
5. Open frontend URL and test one question submission.

#### 3) Final CORS update on backend

1. Open backend project in Vercel -> **Settings -> Environment Variables**.
2. Update `FRONTEND_ORIGIN` to your frontend URL.
    - Current frontend URL: `https://pawa-w9a8.vercel.app`
   - To keep local dev too, use comma-separated values:
       `http://localhost:3000,https://pawa-w9a8.vercel.app`
3. Redeploy backend (Vercel prompts for redeploy after env changes).

#### 4) Final production checks

1. Frontend can submit question successfully.
2. Frontend "API Docs" link opens backend Swagger page.
3. Backend `/health` returns `{"status":"ok","environment":"production"}`.

## VS Code Yellow Import Warnings

If imports in backend files are underlined in yellow:

1. Create/select your Python environment in workspace root (`.venv`).
2. Install backend dependencies in that environment:
   - `pip install -r backend/requirements.txt`
3. In VS Code, run command: `Python: Select Interpreter` and pick `.venv/bin/python`.
4. Reload the window once so language analysis refreshes.

This repository includes workspace settings in `.vscode/settings.json` to help VS Code resolve backend imports through `./backend`.
