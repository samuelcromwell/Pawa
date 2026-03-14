from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import get_settings
from app.schemas.qa import AskRequest, AskResponse
from app.services.llm import DeepSeekService

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Keeping startup minimal for this assessment app.
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="FastAPI backend for an LLM-powered study-planning Q&A assistant.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = DeepSeekService(settings)


@app.get("/health", tags=["System"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}


@app.post("/api/v1/ask", response_model=AskResponse, tags=["Q&A"])
async def ask_question(payload: AskRequest) -> AskResponse:
    answer = await service.generate_answer(payload.query)

    return AskResponse(
        query=payload.query,
        answer=answer,
        model=settings.deepseek_model,
        use_case="Study planning assistant",
    )


if __name__ == "__main__":
    # Convenience entrypoint for local runs: python -m app.main (from backend/)
    uvicorn.run(app, host=settings.app_host, port=settings.app_port)
