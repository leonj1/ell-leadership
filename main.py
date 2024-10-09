from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from review_acceptance_criteria import UserAcceptanceSummary, summarize_problem, product_owner, user_acceptance_criteria_recommendation_engine

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class AcceptanceCriteria(BaseModel):
    contents: str

class ProblemInput(BaseModel):
    goal: str

class ProblemSummary(BaseModel):
    summary: str

class GenerateInput(BaseModel):
    targetAudience: str
    draftUAC: str

class GenerateOutput(BaseModel):
    recommendation: str

@app.post("/summary", response_model=ProblemSummary)
async def summary(problem: ProblemInput):
    summary = summarize_problem(problem.goal)
    return ProblemSummary(summary=summary)

@app.post("/generate", response_model=GenerateOutput)
async def generate(input: GenerateInput):
    recommendation = user_acceptance_criteria_recommendation_engine(input.targetAudience, input.draftUAC)
    return GenerateOutput(recommendation=recommendation)

@app.post("/review", response_model=UserAcceptanceSummary)
async def review(acceptance_criteria: AcceptanceCriteria):
    summary = product_owner(acceptance_criteria.contents)
    return summary.parsed

# Mount the React app's build directory
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")
