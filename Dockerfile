FROM node:20

WORKDIR /app

# Install PM2 globally to manage both processes
RUN npm install -g pm2

# Copy certs into shared /app/certs
COPY ./certs ./certs

# Copy and set up backend
COPY ./backend ./backend
RUN cd backend && npm install
RUN mkdir -p backend/certs && cp -r certs/* backend/certs/

# Copy and set up frontend
COPY ./frontend ./frontend
RUN cd frontend && npm install
# RUN mkdir -p frontend/certs && cp -r certs/* frontend/certs/


# Create .env at root and in frontend
RUN echo "VITE_BACKEND_URL=https://localhost:3000" | tee .env frontend/.env

# Expose backend and frontend ports
EXPOSE 3000 5173

# Start backend and frontend dev servers using PM2
CMD pm2 start backend/index.js --name backend && \
    pm2 start "npm run dev -- --host" --name frontend --cwd frontend && \
    pm2 logs
