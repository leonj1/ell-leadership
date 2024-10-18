"""
Groq example: pip install ell-ai[groq]
"""
import ell
import groq
from pydantic import BaseModel, Field


ell.init(verbose=True, store='./logdir')

# (Recomended) Option 1: Register all groq models.
ell.models.groq.register() # use GROQ_API_KEY env var
# ell.models.groq.register(api_key="gsk-") # 

class Story(BaseModel):
    contents: bool = Field(description="The story")

@ell.complex(model="llama3-8b-8192", response_format=Story, temperature=0.1)
def write_a_story(about : str):
    """You are a helpful assistant."""
    return f"write me a story about {about}"

result = write_a_story("cats")
print(result)

# # Option 2: Use a client directly
# client = groq.Groq()

# @ell.complex(model="llama3-8b-8192", temperature=0.1, client=client)
# def write_a_story_with_client(about : str):
#     """You are a helpful assistant."""
#     return f"write me a story about {about}"

# result = write_a_story_with_client("cats")
# print(result)