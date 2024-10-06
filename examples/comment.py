# This is a single-line comment in Python

"""
This is a multi-line comment (docstring) in Python.
It can span multiple lines and is often used for
function and class documentation.
"""

def greet(name):
    """
    This function greets the person passed in as a parameter.
    
    Args:
    name (str): The name of the person to greet.
    
    Returns:
    str: A greeting message.
    """
    return f"Hello, {name}!"

# Example usage of the greet function
print(greet("Alice"))  # This will print: Hello, Alice!

# TODO: Add more greeting options in the future

'''
Another way to write multi-line comments,
though docstrings (with double quotes) are more common
for function and class documentation.
'''

# Commenting out code for debugging purposes
# print("This line won't be executed")
