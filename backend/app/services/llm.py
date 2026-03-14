import json
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import Settings


class DeepSeekService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def _build_prompt(self, query: str) -> str:
        return f"""
You are an expert study-planning assistant.

Primary use case:
- Users ask for structured learning plans, study tactics, and resource recommendations.
- Default audience is self-taught learners balancing study with work/school.

Quality rules:
- Be practical, actionable, and concise.
- Tailor recommendations by skill level and available hours if provided.
- Suggest free resources first where possible.
- Include a short note on how to track progress.

Output format requirements:
- Return a short heading.
- Then sections with markdown bullets for:
  1) Goal interpretation
  2) Study plan (week-by-week)
  3) Daily practice routine
  4) Recommended resources
  5) Progress checklist
- Keep it concise but complete.

User question:
{query}
""".strip()

    async def generate_answer(self, query: str) -> str:
        if not self.settings.deepseek_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Missing DEEPSEEK_API_KEY in backend environment.",
            )

        endpoint = f"{self.settings.deepseek_base_url.rstrip('/')}/chat/completions"

        payload: dict[str, Any] = {
            "model": self.settings.deepseek_model,
            "messages": [
                {
                    "role": "system",
                    "content": "You produce clear, structured markdown answers.",
                },
                {
                    "role": "user",
                    "content": self._build_prompt(query),
                }
            ],
            "temperature": 0.3,
            "max_tokens": 900,
        }

        headers = {
            "Authorization": f"Bearer {self.settings.deepseek_api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=self.settings.llm_timeout_seconds) as client:
            try:
                response = await client.post(endpoint, headers=headers, json=payload)
                response.raise_for_status()
            except httpx.TimeoutException as exc:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="The AI service timed out. Please try again.",
                ) from exc
            except httpx.HTTPStatusError as exc:
                message = "The AI provider rejected the request."
                try:
                    provider_body = exc.response.json()
                    message = provider_body.get("error", {}).get("message", message)
                except json.JSONDecodeError:
                    pass

                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"LLM error: {message}",
                ) from exc
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Unable to reach the AI provider.",
                ) from exc

        data = response.json()
        choices = data.get("choices", [])
        if not choices:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The AI provider returned an empty response.",
            )

        text = choices[0].get("message", {}).get("content", "")

        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The AI provider returned an unreadable response.",
            )

        return text.strip()
