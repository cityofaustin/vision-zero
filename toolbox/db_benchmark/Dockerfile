FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY benchmark_db.py timing_query.sql ./

CMD ["python", "benchmark_db.py", "--sql-file", "timing_query.sql"]
