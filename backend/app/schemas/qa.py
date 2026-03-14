from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    query: str = Field(
        ..., min_length=5, max_length=1200, description="The user question to answer"
    )


class AskResponse(BaseModel):
    query: str
    answer: str
    model: str
    use_case: str
