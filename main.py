import sys
import uuid
from fastapi import FastAPI, WebSocket, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio

try:
    from review_acceptance_criteria import UserAcceptanceSummary, product_owner, user_acceptance_criteria_recommendation_engine
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

class RequestStatus(BaseModel):
    status: str
    results: Optional[Dict] = None

# Store for request statuses
request_statuses: Dict[str, RequestStatus] = {}

@app.post("/generate")
async def generate(input: GenerateInput):
    request_id = str(uuid.uuid4())
    request_statuses[request_id] = RequestStatus(status="Started")

    async def process_generate():
        try:
            def update_status(message: str):
                request_statuses[request_id].status = message

            update_status("Generating user acceptance criteria...")
            recommendation = await asyncio.to_thread(user_acceptance_criteria_recommendation_engine, 
                                                    input.goal, input.voice, input.targetAudience, input.draftUAC, update_status=update_status)
            
            summary = getattr(recommendation, 'summary', '')
            acceptance_criteria = getattr(recommendation, 'acceptance_criteria', '')
            cross_team_dependencies = getattr(recommendation, 'cross_team_dependencies', [])

            # Convert cross_team_dependencies to a string
            if isinstance(cross_team_dependencies, list):
                cross_team_dependencies = ', '.join([f"{getattr(dep, 'team_name', '')}: {getattr(dep, 'expected_work', '')}" for dep in cross_team_dependencies])
            else:
                cross_team_dependencies = str(cross_team_dependencies)

            update_status("Finalizing results...")
            request_statuses[request_id].results = GenerateOutput(
                summary=summary,
                acceptance_criteria=acceptance_criteria,
                cross_team_dependencies=cross_team_dependencies
            ).dict()
        except Exception as e:
            request_statuses[request_id].status = f"Error: {str(e)}"

    asyncio.create_task(process_generate())
    return {"request_id": request_id}

@app.post("/review")
async def review(acceptance_criteria: AcceptanceCriteria):
    request_id = str(uuid.uuid4())
    request_statuses[request_id] = RequestStatus(status="Started")

    async def process_review():
        try:
            def update_status(message: str):
                request_statuses[request_id].status = message

            summary = await product_owner_async(acceptance_criteria.contents, update_status=update_status)
            request_statuses[request_id].results = summary.parsed.dict()
        except Exception as e:
            request_statuses[request_id].status = f"Error: {str(e)}"

    asyncio.create_task(process_review())
    return {"request_id": request_id}

@app.get("/request/{request_id}")
async def get_request_status(request_id: str):
    # log the request_id
    print(f"Request ID: {request_id}")
    if request_id not in request_statuses:
        raise HTTPException(status_code=404, detail="Request not found")
    return request_statuses[request_id]

# Mount the React app's build directory
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")

async def product_owner_async(contents: str, update_status):
    def run_product_owner():
        return product_owner(contents, update_status=update_status)
    
    return await asyncio.to_thread(run_product_owner)
