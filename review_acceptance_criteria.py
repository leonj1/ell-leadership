import ell
from typing import List
from pydantic import BaseModel, Field
from rich.table import Table
from rich.console import Console
from rich import box

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

ell.init(verbose=True)

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
def product_owner(user_acceptance_criteria : str):
    """
An experienced product owner (PO) possesses a unique blend of business acumen, technical 
understanding, and leadership skills. They are masters of communication, adept at bridging 
the gap between stakeholders, development teams, and end-users.
Key skills of an experienced PO include:

Strategic thinking: Ability to align product vision with business goals
User empathy: Deep understanding of user needs and pain points
Prioritization: Skill in managing backlog and making tough trade-off decisions
Agile methodology expertise: Proficiency in Scrum or other Agile frameworks
Data analysis: Capability to make data-driven decisions
Technical aptitude: Sufficient understanding to communicate effectively with developers
Stakeholder management: Talent for balancing diverse interests and expectations
Market awareness: Knowledge of industry trends and competitive landscape
Problem-solving: Creativity in addressing complex challenges
Adaptability: Flexibility to pivot strategies based on feedback and market changes

When reviewing user acceptance criteria, an experienced PO looks for:

Clarity and specificity: Ensuring criteria are unambiguous and measurable
User-centricity: Confirming that criteria address real user needs and add value
Feasibility: Assessing whether criteria are technically and economically viable
Testability: Ensuring criteria can be objectively verified
Alignment with product vision: Checking that criteria support overall product goals
Completeness: Verifying that all necessary scenarios are covered
Consistency: Ensuring criteria don't contradict each other or existing features
Prioritization: Evaluating the importance and urgency of each criterion
Dependencies: Identifying any reliance on other features or systems
Compliance: Confirming adherence to legal, security, and accessibility standards

A skilled PO balances these elements to create acceptance criteria that guide development 
towards a product that delights users, meets business objectives, and maintains technical 
integrity. They continually refine these criteria based on feedback, market changes, and 
emerging opportunities, ensuring the product remains competitive and valuable.
You write with an active voice.
    """
    is_solveable = is_solveable_problem(user_acceptance_criteria)
    is_complete = is_a_complete_problem(user_acceptance_criteria)
    is_not_redundant_response = is_not_redundant(user_acceptance_criteria)

    return f"Determine if the user acceptance criteria is solvable, complete, and does not include reduntant information. Use pre-screened review from others to ensure that the user acceptance criteria is clear, specific, and does not include redundant information. Write in your voice: {[
        user_acceptance_criteria,
        is_solveable,
        is_complete,
        is_not_redundant_response]}."


# proposal = """
# Create a website like facebook.
# """

# proposal = """
# Add a hyperlink on the homepage.
# """

proposal = """
Add a hyperlink that links to the facebook page. The link should be in the form of a button that is styled as a facebook logo. The link should be in the top right corner of the homepage.
"""


review_message = product_owner(proposal)
review = review_message.parsed

title = summarize_problem(proposal)
header = f"{review.outcome} - {review.confidence_score}/100: {title}"
console = Console()
my_table = Table(title=header)
my_table.add_column("Recommendation", justify="left", style="green", no_wrap=False)
my_table.add_column("Response", justify="left", style="green", no_wrap=False)
my_table.add_row(review.recommendation, review.response)
console.print(my_table)
