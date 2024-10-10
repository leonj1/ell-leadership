import sys
print("Python path:", sys.path)

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from pydantic import BaseModel
    print("Successfully imported FastAPI and Pydantic")
except ImportError as e:
    print(f"Error importing FastAPI or Pydantic: {e}")

try:
    from review_acceptance_criteria import UserAcceptanceSummary, summarize_problem, product_owner, user_acceptance_criteria_recommendation_engine
    print("Successfully imported from review_acceptance_criteria")
except ImportError as e:
    print(f"Error importing from review_acceptance_criteria: {e}")
    print("Current working directory:", os.getcwd())
    print("Contents of current directory:", os.listdir())

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
    voice: str
    goal: str

class GenerateOutput(BaseModel):
    summary: str
    acceptance_criteria: str
    cross_team_dependencies: str = ''

@app.post("/generate", response_model=GenerateOutput)
async def generate(input: GenerateInput):
    recommendation = user_acceptance_criteria_recommendation_engine(input.goal, input.voice, input.targetAudience, input.draftUAC)
    
    summary = getattr(recommendation, 'summary', '')
    acceptance_criteria = getattr(recommendation, 'acceptance_criteria', '')
    cross_team_dependencies = getattr(recommendation, 'cross_team_dependencies', [])

    # Convert cross_team_dependencies to a string
    if isinstance(cross_team_dependencies, list):
        cross_team_dependencies = ', '.join([f"{getattr(dep, 'team_name', '')}: {getattr(dep, 'description', '')}" for dep in cross_team_dependencies])
    else:
        cross_team_dependencies = str(cross_team_dependencies)

    return GenerateOutput(
        summary=summary,
        acceptance_criteria=acceptance_criteria,
        cross_team_dependencies=cross_team_dependencies
    )

@app.post("/review", response_model=UserAcceptanceSummary)
async def review(acceptance_criteria: AcceptanceCriteria):
    summary = product_owner(acceptance_criteria.contents)
    return summary.parsed

# Mount the React app's build directory
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")
