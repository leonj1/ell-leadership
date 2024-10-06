from fastapi import FastAPI
from pydantic import BaseModel
from review_acceptance_criteria import summarize_problem

app = FastAPI()

class ProblemInput(BaseModel):
    goal: str

class ProblemSummary(BaseModel):
    summary: str

@app.post("/review", response_model=ProblemSummary)
async def review(problem: ProblemInput):
    summary = summarize_problem(problem.goal)
    return ProblemSummary(summary=summary)
