# Use Python 3.11 image (not slim - needs more memory)
FROM python:3.11

# Install system dependencies including exiftool
RUN apt-get update && apt-get install -y \
    exiftool \
    libimage-exiftool-perl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p ./uploads

# Expose port
EXPOSE 8000

# Run with increased timeout and worker settings
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker", "--timeout", "120", "--keep-alive", "5", "main:app"]
