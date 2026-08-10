FROM python:3.11-slim

WORKDIR /app
COPY serve.py .

VOLUME ["/data"]
EXPOSE 8080

CMD ["python3", "serve.py", "--port", "8080", "--dir", "/data"]
