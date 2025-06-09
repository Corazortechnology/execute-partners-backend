FROM python:3.10

# Create a writable cache directory
# Install system dependencies including libGL
RUN apt-get update && apt-get install -y libgl1 && \
    mkdir -p /app/cache && chmod -R 777 /app/cache

# Set environment variable (HF_HOME is preferred over TRANSFORMERS_CACHE)
ENV HF_HOME=/app/cache

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 7860

# CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "3000"]
CMD ["python","api.py"]



