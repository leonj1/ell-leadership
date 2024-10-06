# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Upgrade pip and install required packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install -U "ell-ai[all]"

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Add the current directory to PYTHONPATH
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Run the FastAPI application when the container launches
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
