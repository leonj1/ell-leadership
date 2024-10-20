import ell
from typing import List
from pydantic import BaseModel, Field
from rich.table import Table
from rich.console import Console
from rich import box

class SenteceCheck(BaseModel):
    is_sentence: bool = Field(description="Is this a sentence? Respond with either YES or NO.")

class RewrittenUserAcceptanceCriteria(BaseModel):
    user_acceptance_criteria: bool = Field(description="This is a user acceptance criteria written as full sentence.")

class SolveableProblem(BaseModel):
    solveable: bool = Field(description="Is the problem solveable?")
    confidence_score: int = Field(description="The confidence score this is a solveable problem.")
    recommendation: str = Field(description="The recommendation to rephrase the problem into a solveable problem.")
    problem: str = Field(description="The problem statement.")
    
class CompleteProblem(BaseModel):
    complete: bool = Field(description="Is the problem complete?")
    confidence_score: int = Field(description="The confidence score this is a complete problem. Scores can be between 1-100.")
    recommendation: str = Field(description="The recommendation to add more detail to the problem statement.")
    problem: str = Field(description="The problem statement.")
    
class NotRedundantProblem(BaseModel):
    not_redundant: bool = Field(description="Is the problem not redundant?")
    confidence_score: int = Field(description="The confidence score this is a not redundant problem. Scores can be between 1-100.")
    recommendation: str = Field(description="The recommendation to remove redundant information from the problem statement.")
    problem: str = Field(description="The problem statement.")

class UserAcceptanceSummary(BaseModel):
    outcome: str = Field(description="The outcome of the problem written as PASS or FAIL")
    confidence_score: int = Field(description="The confidence score this is a complete problem. Scores can be between 1-100.")
    recommendation: str = Field(description="The summary of why this user acceptance criteria is accepted or rejected.")
    response: str = Field(description="The response from the product owner to the originator of the user acceptance criteria telling them what they need to change for the acceptance criteria to be accepted.")
    possible_alternatives: List[str] = Field(description="""
                                             The list of alternate user acceptance criteria, using the original as a starting point, 
                                             that is detailed and specific. Each re-written example should be able to generate a PASS outcome. 
                                             Each entry must be a sentence exceeding 10 words.
                                             """)
    
class TeamDependencies(BaseModel):
    team_name: str = Field(description="The name of the team that is expected to complete the user acceptance criteria.")
    expected_work: str = Field(description="The expected work to complete the user acceptance criteria.")

class UserAcceptanceCriteriaDraft(BaseModel):
    summary: str = Field(description="The user acceptance criteria in full detail.")
    acceptance_criteria: str = Field(description="The user acceptance criteria with clear statement of the goals or what the milestones are.")
    cross_team_dependencies: List[TeamDependencies] = Field(description="The cross team dependencies that are needed to complete the user acceptance criteria.")

class UserAcceptanceCriteriaChosen(BaseModel):
    user_acceptance_criteria: str = Field(description="The user acceptance criteria in full detail.")
    outcome: str = Field(description="The outcome of the problem written as PASS or FAIL")
    confidence_score: int = Field(description="The confidence score this is a complete problem. Scores can be between 1-100.")

ell.init(verbose=True)


@ell.complex(model="gpt-4o-2024-08-06", response_format=UserAcceptanceCriteriaDraft, temperature=0.5)
def generate_user_acceptance_criteria(goal: str, your_role: str, audience: str, proposal: str):
    return [
        ell.system(f"""
Your role is: {your_role}.
You are creating a user acceptance criteria for the following audience: {audience}
"""),
        ell.user(f"""
Create a user acceptance criteria with focus on {goal}. 
The acceptance criteria is: {proposal}.
Write in an active voice.
""")
    ]

@ell.simple(model="gpt-4o-mini", temperature=0.4)
def write_a_draft_of_a_user_acceptance_criteria(idea : str):
    """You are an adept technical writer."""
    return f"Write a succint user acceptance criteria that is achievable, complete, and does not include redundant information: {idea}."

@ell.complex(model="gpt-4o-2024-08-06", response_format=UserAcceptanceCriteriaDraft, temperature=0.1)
def choose_the_best_draft(drafts : List[str]):
    """You are an expert editor of technical documents."""
    return f"Choose the best draft from the following list: {'\n'.join(drafts)}"

@ell.complex(model="gpt-4o-2024-08-06", response_format=UserAcceptanceSummary, temperature=0.1)
def summarize_user_acceptance_criteria(audience: str, proposal: str):
    return [
        ell.system(f"{audience}"),
        ell.user(f"Write in an active voice.: {proposal}.")
    ]

@ell.complex(model="gpt-4o-mini", response_format=SenteceCheck, temperature=0.1)
def is_sentence(input : str):
    """
You are an english professor.
"""
    return f"Determine if the following input is a sentence: {input}"

@ell.complex(model="gpt-4o-mini", response_format=RewrittenUserAcceptanceCriteria, temperature=1.0)
def rewrite_user_acceptance_criteria(criteria: str):
    """
    You are a Technical writers that creates instruction manuals, how-to guides, 
    journal articles, and other supporting documents to communicate complex and technical information more easily.
    You have:
        Excellent writing and editing skills
        Strong command of English grammar and style
        Ability to understand and explain complex technical concepts
        Attention to detail
    """
    return f"""
Analyze the following user acceptance criteria and rewrite it in a way that is clear, specific, and does not include redundant information.
The rewritten user acceptance criteria should be written from the point of view of the original author. Not speaking to the orignal author. {criteria}
"""

@ell.simple(model="gpt-4o-mini", temperature=1.0)
def summarize_problem(goal: str):
    """
    You are a product owner that summarizes the problem statement into a single sentence.
    """
    return f"Summarize the problem statement into a single sentence: {goal}"

@ell.complex(model="gpt-4o-mini", response_format=SolveableProblem, temperature=1.0)
def is_solveable_problem(goal : str):
    """
You are a senior software developer with expertise in user acceptance criteria documentation.
You are tasked to determine if a problem can be independently solved by a single software developer.
You break down the problem into smaller problems and determine if each smaller problem can be independently solved by a single software developer.
If a subtask does not satisfy solveability, you provide a recommendation to rephrase the problem into a solveable problem.
Only respond in 1 paragraph.
"""
    return f"Determine if the following problem can be independently solved by a single software developer: {goal}"

@ell.complex(model="gpt-4o-mini", response_format=CompleteProblem, temperature=1.0)
def is_a_complete_problem(goal : str):
    """
You are a senior software developer with expertise in user acceptance criteria documentation.
You are tasked to determine if a problem is complete. A problem is complete if it includes all necessary details
from the original problem statement. Ensure that the aggregation of responses of these subtasks can
definitely yield a comprehensive answer to the problem statement.
If the subtasks fail to satisfy completeness, you provide a recommendation to add more detail to the problem statement.
Only respond in 1 paragraph.
"""
    return f"Determine if the following problem is complete: {goal}"

@ell.complex(model="gpt-4o-mini", response_format=NotRedundantProblem, temperature=1.0)
def is_not_redundant(goal : str):
    """
You are a senior software developer with expertise in user acceptance criteria documentation.
You are tasked to determine if a problem includes any redundant or irrelevant information to solve the problem.
The principal is that a problem should be solved in a direct and concise manner.
Only respond in 1 paragraph.
"""
    return f"Determine if the following problem includes any redundant information: {goal}"

@ell.complex(model="gpt-4o-2024-08-06", response_format=UserAcceptanceSummary, temperature=0.1)
def product_owner_junior(user_acceptance_criteria: str, update_status):
    """
    An experienced product owner (PO) possesses a unique blend of business acumen, technical 
    understanding, and leadership skills. They are masters of communication, adept at bridging 
    the gap between stakeholders, development teams, and end-users.
    ...
    You write with an active voice.
    """
    update_status("Checking if the problem is solvable...")
    is_solveable = is_solveable_problem(user_acceptance_criteria)
    
    update_status("Checking if the problem is complete...")
    is_complete = is_a_complete_problem(user_acceptance_criteria)
    
    update_status("Checking if the problem is not redundant...")
    is_not_redundant_response = is_not_redundant(user_acceptance_criteria)

    update_status("Determining if the user acceptance criteria is solvable, complete, and does not include redundant information...")
    return f"""
    Determine if the user acceptance criteria is solvable, complete, and does not include 
    redundant information. Use pre-screened review from others to ensure that the 
    user acceptance criteria is clear, specific, and does not include redundant information. 
    If the user acceptance criteria does not PASS, provide a list of possible alternatives that 
    would generate a PASS outcome.
    Write in your voice: {[
            user_acceptance_criteria,
            is_solveable,
            is_complete,
            is_not_redundant_response]}.
            """

# def attempt_rewrite(user_acceptance_criteria, max_attempts=3):
#     default_response = ""
#     for i in range(max_attempts):
#         print(f"Attempt {i+1} of {max_attempts} to rewrite the user acceptance criteria...")
#         rewrite = rewrite_user_acceptance_criteria(user_acceptance_criteria)
#         print(f"Checking rewrite: {rewrite}")
#         reviewed = product_owner_junior(rewrite)
#         if reviewed.parsed.outcome == "PASS":
#             print(f"Rewrite {i+1} of {max_attempts} passes: {rewrite}")
#             return rewrite
#         default_response = rewrite.parsed.user_acceptance_criteria
#     return default_response

def product_owner(user_acceptance_criteria: str, update_status=None):
    is_sentence_response = is_sentence(user_acceptance_criteria)
    if is_sentence_response.parsed.is_sentence == "NO":
        return f"The user acceptance criteria is not a sentence. Please rewrite the user acceptance criteria as a sentence."

    result = product_owner_junior(user_acceptance_criteria, update_status)
    if result.parsed.outcome == "PASS":
        if update_status:
            update_status("Original user acceptance criteria passed on the first try.")
        return result

    if update_status:
        update_status("The original user acceptance criteria does not pass. Attempting to rewrite...")
    rewrite = attempt_rewrite(user_acceptance_criteria, update_status)
    if rewrite:
        result.parsed.possible_alternatives = [rewrite]
    return result

def attempt_rewrite(user_acceptance_criteria, update_status=None, max_attempts=3):
    default_response = ""
    for i in range(max_attempts):
        if update_status:
            update_status(f"Attempt {i+1} of {max_attempts} to rewrite the user acceptance criteria...")
        rewrite = rewrite_user_acceptance_criteria(user_acceptance_criteria)
        if update_status:
            update_status(f"Checking rewrite: {rewrite}")
        reviewed = product_owner_junior(rewrite, update_status)
        if reviewed.parsed.outcome == "PASS":
            if update_status:
                update_status(f"Rewrite {i+1} of {max_attempts} passes: {rewrite}")
            return rewrite
        default_response = rewrite.parsed.user_acceptance_criteria
    return default_response

def user_acceptance_criteria_recommendation_engine(goal: str, voice: str, audience: str, proposal: str, update_status):
    update_status("Generating multiple user acceptance criterias...")
    ideas = generate_user_acceptance_criteria(goal, voice, audience, proposal, api_params=(dict(n=5)))
    update_status("Writing drafts for each user acceptance criteria...")
    drafts = [write_a_draft_of_a_user_acceptance_criteria(idea) for idea in ideas]
    update_status("Choosing the best draft...")
    best_draft = choose_the_best_draft(drafts)
    update_status("Summarizing user acceptance criteria...")
    result = summarize_user_acceptance_criteria(audience, best_draft.parsed.summary)
    if result.parsed.outcome == "PASS":
        print("Original user acceptance criteria passed on the first try.")
        return best_draft.parsed

    max_attempts = 10
    print("The original user acceptance criteria does not pass. Attempting to rewrite...")
    for i in range(max_attempts):
        print(f"Attempt {i+1} of {max_attempts} to rewrite the user acceptance criteria...")
        update_status(f"Attempt {i+1} of {max_attempts} to rewrite the user acceptance criteria...")
        ideas = generate_user_acceptance_criteria(goal, voice, audience, proposal, api_params=(dict(n=3)))
        update_status("Writing a draft of a user acceptance criteria...")
        drafts = [write_a_draft_of_a_user_acceptance_criteria(idea) for idea in ideas]
        update_status("Choosing the best draft...")
        best_draft = choose_the_best_draft(drafts)
        update_status("Summarizing user acceptance criteria...")
        reviewed = summarize_user_acceptance_criteria(audience, best_draft.parsed.summary)
        if reviewed.parsed.outcome == "PASS":
            print(f"Rewrite {i+1} of {max_attempts} passes: {best_draft}")
            return best_draft.parsed

    print("Unable to rewrite the user acceptance criteria. Returning original attempt.")
    return best_draft.parsed


# proposal = """
# Create a website like facebook.
# """

# proposal = """
# Add a hyperlink on the homepage.
# """

proposal = """
Add a hyperlink that links to the facebook page. The link should be in the form of a button that is styled as a facebook logo. The link should be in the top right corner of the homepage.
"""


# review_message = product_owner(proposal)
# review = review_message.parsed

# title = summarize_problem(proposal)
# header = f"{review.outcome} - {review.confidence_score}/100: {title}"
# console = Console()
# my_table = Table(title=header)
# my_table.add_column("Recommendation", justify="left", style="green", no_wrap=False)
# my_table.add_column("Response", justify="left", style="green", no_wrap=False)
# my_table.add_row(review.recommendation, review.response)
# console.print(my_table)
