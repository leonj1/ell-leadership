# Use an official Node runtime as a parent image for the frontend
FROM node:14 as frontend-build

# Set the working directory in the container
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the frontend source code
COPY frontend/src ./src
COPY frontend/public ./public

# Build the React app
RUN npm run build

# Use an official Python runtime as a parent image for the backend
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Copy the built React app from the frontend-build stage
COPY --from=frontend-build /app/frontend/build /app/frontend/build

# Upgrade pip and install required packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install -U "ell-ai[all]"

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Make port 8000 available to the world outside this container
EXPOSE 8000
# Make port 3000 available for the React development server
EXPOSE 3000

# Add the current directory to PYTHONPATH
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Create a script to run both the FastAPI and React apps
RUN echo '#!/bin/bash\n\
cd /app/frontend && npm start &\n\
cd /app && uvicorn main:app --host 0.0.0.0 --port 8000\n'\
> /app/start.sh && chmod +x /app/start.sh

# Run the script when the container launches
CMD ["/app/start.sh"]
