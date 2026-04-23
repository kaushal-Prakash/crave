FROM python:3.10-slim

WORKDIR /app

# Copy the requirements file from the root context
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the recommender source code
# Since the Docker build context will be the root directory, 
# we copy the contents of the recommender directory into /app
COPY recommender/ .

# Expose FastAPI default port
EXPOSE 8000

# Start the uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
