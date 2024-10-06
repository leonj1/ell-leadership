import openai

# Set up your OpenAI API key
openai.api_key = 'your-api-key-here'

def generate_text(prompt, max_tokens=100):
    """
    Generate text using OpenAI's GPT-3 model.

    Args:
    prompt (str): The input prompt for the model.
    max_tokens (int): Maximum number of tokens in the response.

    Returns:
    str: Generated text.
    """
    try:
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=prompt,
            max_tokens=max_tokens
        )
        return response.choices[0].text.strip()
    except Exception as e:
        return f"An error occurred: {str(e)}"

def summarize_text(text, max_tokens=50):
    """
    Summarize the given text using GPT-3.

    Args:
    text (str): The text to summarize.
    max_tokens (int): Maximum number of tokens in the summary.

    Returns:
    str: Summarized text.
    """
    prompt = f"Please summarize the following text:\n\n{text}\n\nSummary:"
    return generate_text(prompt, max_tokens)

# Example usage
if __name__ == "__main__":
    # Text generation example
    prompt = "The benefits of artificial intelligence in healthcare are:"
    generated_text = generate_text(prompt)
    print("Generated Text:")
    print(generated_text)
    print("\n" + "="*50 + "\n")

    # Text summarization example
    long_text = """
    Artificial Intelligence (AI) has the potential to revolutionize various aspects of our lives. 
    From improving healthcare diagnostics to enhancing education systems, AI technologies are 
    being integrated into numerous sectors. However, the rapid advancement of AI also raises 
    ethical concerns and questions about job displacement. As we continue to develop AI, it's 
    crucial to consider both its benefits and potential drawbacks to ensure responsible and 
    beneficial implementation.
    """
    summary = summarize_text(long_text)
    print("Original Text:")
    print(long_text)
    print("\nSummarized Text:")
    print(summary)
