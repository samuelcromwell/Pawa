# Pre-Screening Technical Assessment: Study Sprint AI

This repository contains a full-stack Q&A web app that integrates an LLM to generate structured study plans and learning guidance.

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
3. Create and activate a virtual environment.
4. Install dependencies:
   - `pip install -r requirements.txt`
5. Create an environment file:
   - copy `.env.example` to `.env`
6. Add your OpenRouter API key in `.env`:
   - `DEEPSEEK_API_KEY=...`
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
4. Start the frontend:
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

## Optional Deployment

This app can be deployed as:

- Backend: Render, Railway, Fly.io, or any Docker-compatible host
- Frontend: Vercel

Set frontend `NEXT_PUBLIC_API_BASE_URL` to deployed backend URL.

## VS Code Yellow Import Warnings

If imports in backend files are underlined in yellow:

1. Create/select your Python environment in workspace root (`.venv`).
2. Install backend dependencies in that environment:
   - `pip install -r backend/requirements.txt`
3. In VS Code, run command: `Python: Select Interpreter` and pick `.venv/bin/python`.
4. Reload the window once so language analysis refreshes.

This repository includes workspace settings in `.vscode/settings.json` to help VS Code resolve backend imports through `./backend`.
