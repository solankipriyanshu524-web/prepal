# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Python Backend with Node runtime for JS code execution
FROM python:3.12-slim
WORKDIR /app

# Install Node.js in the Python image so the Code Runner sandbox can execute JavaScript
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Set environment
ENV PORT=8000
EXPOSE 8000

# Start FastAPI server
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
