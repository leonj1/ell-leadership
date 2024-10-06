from fastapi import FastAPI
from pydantic import BaseModel
from review_acceptance_criteria import UserAcceptanceSummary, summarize_problem, product_owner

app = FastAPI()

class AcceptanceCriteria(BaseModel):
    contents: str

class ProblemInput(BaseModel):
    goal: str

class ProblemSummary(BaseModel):
    summary: str

@app.post("/summary", response_model=ProblemSummary)
async def summary(problem: ProblemInput):
    summary = summarize_problem(problem.goal)
    return ProblemSummary(summary=summary)

# create endpoint to review acceptance criteria from product owner
@app.post("/review", response_model=UserAcceptanceSummary)
async def review(acceptance_criteria: AcceptanceCriteria):
    summary = product_owner(acceptance_criteria.contents)
    return summary.parsed
