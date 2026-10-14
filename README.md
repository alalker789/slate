# Slate, MERN conversion

The original Slate visualizers, controls, SVG animations, code panels, responsive layout, and original green/yellow/pink/cyan/mint palette are preserved. The UI is mounted directly into the React app; there is no iframe.

## Requirements
- Node.js 20+
- MongoDB running locally (optional for visualizers, required for server-side progress persistence)

## Run locally

Terminal 1:
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Terminal 2:
```bash
cd client
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Stack
- React + Vite frontend
- Express 5 REST API
- MongoDB + Mongoose for flashcard progress
- Browser localStorage fallback so progress still works if MongoDB is unavailable

Health check: `http://localhost:5000/api/health`

Note: Existing interactive algorithms remain in the original tested vanilla-JavaScript visualizer engine mounted inside React to preserve their behaviour while moving the application into a React/Express/MongoDB project. The application is full-page and not embedded in an iframe.
