FROM node:20-alpine

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Install and build frontend
COPY frontend/package*.json ./frontend/
RUN npm --prefix frontend install
COPY frontend/ ./frontend/
RUN npm --prefix frontend run build

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN npm --prefix backend install
COPY backend/ ./backend/
COPY database/ ./database/

# Default port 7860 (compatible with Hugging Face Spaces, Koyeb, Railway, and Render $PORT)
ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

CMD ["node", "backend/server.js"]
