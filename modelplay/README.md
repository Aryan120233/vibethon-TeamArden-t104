# ModelPlay: Interactive AIML Learning Platform

ModelPlay is a fullstack application built for our Hackathon. It makes learning practical and experiential by allowing users to interact directly with AI models and visualize decisions dynamically.

## Project Structure
- `frontend/`: React, Vite, TailwindCSS (Provides UI/UX, mini-games, and dashboard)
- `backend/`: Node.js, Express (Mock database for progress tracking and auth logic)
- `ml/`: Python, FastAPI (Microservice that actually handles model training)

## Execution Steps

### 1. Backend Setup
No actual real database configured for MVP. Starts up a mocked server.
```bash
cd backend
npm install
npm start
```
Runs at `http://localhost:5000`

### 2. ML Microservice Setup
Our Python endpoint handles SKLearn models and passes decision boundaries back to the React app.
```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```
Runs at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`

## How ModelPlay Teaches AI
Instead of purely text-based logic, users read a short conceptual module on Decision Trees, then proceed into a Mini-Game. Within this Mini-Game, they manipulate **Max Depth** and **Min Samples Split** using sliders. 

Behind the scenes, the React application sends these parameters to the FastAPI microservice, which quickly retrains the SKLearn DecisionTreeClassifier on a 2D dummy dataset. It outputs a coordinate mapping of the classification bounds and is sent back. The React app (using Recharts) paints these zones vividly on screen overlaying the actual dataset. It provides an immediate "Cause & Effect" feeling – users watch the boundary snap exactly into place based on their inputs!
