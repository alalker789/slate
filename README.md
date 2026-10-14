# Slate | Interactive DSA Visualizer

**Understand algorithms. Visualize every step. Make concepts stick.**

Slate is an interactive Data Structures and Algorithms (DSA) learning platform designed to help students understand how algorithms work through step-by-step visualizations, code examples, and spaced-repetition flashcards.

Instead of simply reading an algorithm or memorizing its implementation, learners can observe how data changes during execution, control the visualization speed, move between individual steps, and explore the corresponding code.

The project uses a React and Vite frontend, an Express.js backend, and MongoDB for storing learning progress.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Algorithms and Data Structures](#algorithms-and-data-structures)
- [Tech Stack](#tech-stack)
- [Color Palette and UI](#color-palette-and-ui)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Backend API](#backend-api)
- [Database](#database)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Learning DSA can be challenging when the execution of an algorithm is hidden behind code. Slate addresses this problem by turning algorithm execution into an interactive visual experience.

The platform combines:

- Interactive algorithm visualizations
- Step-by-step execution controls
- Code examples in multiple programming languages
- Data structure operation demonstrations
- A custom JavaScript code tracer
- Spaced-repetition flashcards
- A responsive interface with a consistent visual language
- A backend API for learning-progress persistence

Slate is intended for students preparing for coding interviews, university examinations, technical assessments, and programming competitions.

## Features

### 1. Interactive Algorithm Visualization

Explore algorithms through animated visualizations that show how the underlying data changes during execution.

Available controls include:

- **Play:** Run the visualization automatically.
- **Step Forward:** Advance one step.
- **Step Backward:** Return to a previous step.
- **Reset:** Restart the current visualization.
- **Speed Control:** Adjust animation speed.
- **Custom Input:** Experiment with your own values where supported.

Each visualization includes explanatory narration to help learners understand the operation being performed.

### 2. Sorting Algorithms

Compare five classic sorting algorithms using a visual array.

| Algorithm      |  Best Time | Average Time | Worst Time |
| -------------- | ---------: | -----------: | ---------: |
| Bubble Sort    |     O(n)\* |        O(n²) |      O(n²) |
| Selection Sort |      O(n²) |        O(n²) |      O(n²) |
| Insertion Sort |       O(n) |        O(n²) |      O(n²) |
| Merge Sort     | O(n log n) |   O(n log n) | O(n log n) |
| Quick Sort     | O(n log n) |   O(n log n) |      O(n²) |

\*Bubble Sort achieves O(n) best-case time when its implementation uses an early-exit optimization.

Features include array-size adjustment, speed control, custom arrays, shuffling, and code inspection.

### 3. Searching Algorithms

Understand how different searching techniques locate elements.

- **Linear Search:** Checks elements sequentially.
- **Binary Search:** Repeatedly halves the search interval in a sorted array.

Change the array size, choose a target value, and observe the search process step by step.

### 4. Stack and Queue

Experiment with two fundamental linear data structures.

**Stack**

- Push elements
- Pop elements
- Understand Last In, First Out (LIFO)

**Queue**

- Enqueue elements
- Dequeue elements
- Understand First In, First Out (FIFO)

The visualization illustrates how each operation changes the structure.

### 5. Linked List

Explore a singly linked list through interactive operations:

- Insert at the head
- Insert at the tail
- Insert at a specified index
- Delete a value
- Search for a value
- Clear the list

Observe how nodes connect and how insertion, deletion, and traversal work.

### 6. Binary Search Tree

Build and explore a Binary Search Tree (BST).

Available operations and features include:

- Insert values
- Generate a random tree
- Clear the tree
- In-order traversal
- Pre-order traversal
- Post-order traversal
- Level-order traversal using BFS
- Step-by-step traversal controls

The visualization helps explain how a BST organizes values and how traversal order affects the output.

### 7. Graph Traversal

Learn graph traversal using:

- **Breadth-First Search (BFS)**
- **Depth-First Search (DFS)**

Features include selecting a starting node, adding edges, resetting the graph, controlling animation speed, and observing traversal progress.

BFS explores nodes level by level, while DFS explores a path before backtracking.

### 8. Recursion and Call Stack

Visualize recursive function calls and their execution order.

Supported examples include:

- Factorial
- Fibonacci

The visualization displays the recursive call tree, call-stack activity, execution steps, and computed results.

This helps learners understand base cases, recursive calls, and how function calls return their results.

### 9. Custom Code Visualizer

Slate includes a code-tracing environment for JavaScript functions.

Two modes are available:

**Array Trace**

Write a JavaScript function that operates on an array and observe supported array reads and writes.

**Custom Narration**

Use `viz.note("message")` in your code to create explanatory trace steps.

Example:

```javascript
function example() {
  viz.note("Starting the operation");

  const values = [5, 2, 8];

  viz.note("Created the initial array");

  values[0] = 10;

  viz.note("Updated the first element");
}
```

Paste your code, run the tracer, and inspect the generated steps.

**Security note:** Only run code you understand and trust. The custom tracer executes user-supplied JavaScript in the browser.

### 10. Spaced-Repetition Flashcards

The Memorize section helps reinforce important DSA concepts through flashcards.

It includes:

- Flashcard questions and answers
- Topic-based categories
- Review-progress statistics
- Due, learning, and mastered card counts
- Review scheduling and progress tracking

The original visualizer includes the flashcard interface and its review interactions. The backend provides an API for saving and retrieving progress.

### 11. Multi-Language Code Examples

Switch between supported code representations:

- Pseudocode
- C
- C++
- Java

The code panels help learners connect the visual behavior of an algorithm with its implementation.

The custom code tracer itself executes JavaScript; it is not a compiler for C, C++, or Java.

---

## Tech Stack

### Frontend

| Technology              | Purpose                                         |
| ----------------------- | ----------------------------------------------- |
| React 19                | Frontend application root                       |
| Vite 6                  | Development server and production bundler       |
| JavaScript (ES Modules) | Application and interaction logic               |
| HTML5                   | Application markup                              |
| CSS3                    | Styling, layout, responsiveness, and animations |
| SVG                     | Algorithm visualization graphics                |
| Browser localStorage    | Local fallback for progress data                |

### Backend

| Technology | Purpose                              |
| ---------- | ------------------------------------ |
| Node.js    | JavaScript runtime                   |
| Express 5  | REST API and HTTP server             |
| MongoDB    | Persistent data storage              |
| Mongoose 8 | MongoDB connection and data modeling |
| dotenv     | Environment-variable configuration   |
| CORS       | Cross-origin request configuration   |

### Development Tools

- Git
- GitHub
- Visual Studio Code
- npm
- MongoDB Atlas or a local MongoDB instance
- Render for deployment

---

## Color Palette and UI

Slate uses a consistent dark-green interface with contrasting accent colors. Each accent communicates a different state in the visualizations.

| Color           | Hex Code  | Purpose                       |
| --------------- | --------- | ----------------------------- |
| Board Green     | `#1b3931` | Main background               |
| Panel Green     | `#20402f` | Primary panels                |
| Secondary Green | `#28503c` | Secondary surfaces            |
| Elevated Green  | `#2e5c46` | Elevated surfaces             |
| Warm Yellow     | `#f2c14e` | Comparisons and highlights    |
| Soft Pink       | `#f0a6c4` | Swaps and write operations    |
| Cyan            | `#7fd8d4` | Visiting nodes and pivots     |
| Mint Green      | `#8fe3a6` | Completed and sorted elements |
| Coral Red       | `#e2604b` | Error and warning states      |
| Main Text       | `#ede8da` | Primary text                  |
| Muted Text      | `#a9c2b0` | Secondary text                |

The interface is designed to keep attention on the algorithm rather than unnecessary decoration.

---

## Project Architecture

Slate follows a simple client-server architecture.

```text
                    USER
                      |
                      v
             React + Vite Frontend
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      Visualizers   Code UI    Flashcards
          |           |           |
          +-----------+-----------+
                      |
                REST API Requests
                      |
                      v
              Express.js Backend
                      |
                      v
                 Mongoose
                      |
                      v
                  MongoDB
```

### Frontend Flow

1. Vite serves the React application.
2. React mounts the application root.
3. The existing Slate markup is inserted into the application.
4. The original JavaScript visualization engine initializes the controls and event listeners.
5. Users interact with algorithms and data structures.
6. Flashcard progress can be persisted through the backend API, with browser storage available as a fallback.

### Backend Flow

1. The frontend sends an HTTP request to the Express API.
2. Express validates the request where applicable.
3. Mongoose communicates with MongoDB when a database connection is available.
4. The server returns a JSON response.
5. The frontend updates its progress state.

### Architecture Note

The original interactive visualizer engine remains in vanilla JavaScript inside `client/public/legacy.js`. React provides the application root, while the existing HTML markup and CSS preserve the original visualizer behavior.

This approach retains the existing functionality while introducing a React frontend and an Express/MongoDB backend. The visualization engine has not been rewritten entirely as individual React components.

---

## Project Structure

```text
slate/
│
├── client/
│   ├── public/
│   │   ├── legacy.js
│   │   └── favicon.svg
│   │
│   ├── src/
│   │   ├── appMarkup.js
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Flashcard.js
│   │   │   └── ReviewProgress.js
│   │   │
│   │   ├── routes/
│   │   │   └── api.js
│   │   │
│   │   └── index.js
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

### Important Files

**`client/src/main.jsx`**

Creates the React root, mounts the application markup, imports the styles, and loads the existing visualization engine.

**`client/src/appMarkup.js`**

Contains the application's HTML markup as a JavaScript string. It defines the layout and controls for the algorithm visualizers and flashcards.

**`client/src/styles.css`**

Contains the application's CSS, including layout, colors, panels, controls, and responsive styling.

**`client/public/legacy.js`**

Contains the existing interactive JavaScript logic for the visualizers, animations, event listeners, code examples, and flashcard interactions.

**`client/vite.config.js`**

Configures Vite and the development proxy used to forward API requests to the local backend.

**`server/src/index.js`**

Initializes Express, configures middleware, connects to MongoDB, exposes the health and progress endpoints, and starts the server.

**`server/src/models/Flashcard.js`**

Defines a Mongoose model for flashcard records.

**`server/src/models/ReviewProgress.js`**

Defines a Mongoose model for learner review progress.

**`server/src/routes/api.js`**

Contains additional flashcard and learner-specific review-progress route definitions. These routes must be mounted by the Express entry point before they become accessible over HTTP.

---

## Getting Started

Follow these steps to run Slate locally.

### Prerequisites

Install the following software:

- Node.js 20 or later
- npm
- Git
- MongoDB, either locally or through MongoDB Atlas
- A code editor such as Visual Studio Code

Verify the installations:

```bash
node --version
npm --version
git --version
```

### 1. Clone the Repository

```bash
git clone https://github.com/alalker789/slate.git
cd slate
```

### 2. Configure the Backend

Open a terminal in the project root:

```bash
cd server
npm install
```

Create a `.env` file by copying the example configuration.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

Open `server/.env` and configure the environment variables.

For local MongoDB:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/slate
CLIENT_ORIGIN=http://localhost:5173
```

If using MongoDB Atlas, replace the local MongoDB URI with your Atlas connection string.

### 3. Configure the Frontend

Open another terminal:

```bash
cd client
npm install
```

The Vite configuration proxies API requests to the local backend during development. The default backend address is:

```text
http://localhost:5000
```

### 4. Start the Backend

From the `server` directory:

```bash
npm run dev
```

The backend should start on port `5000`, unless another port is configured.

### 5. Start the Frontend

From the `client` directory, in a second terminal:

```bash
npm run dev
```

Vite prints the local development URL. Open:

```text
http://localhost:5173
```

You should now be able to use the Slate interface and explore the visualizers.

---

## Environment Variables

The backend reads configuration from `server/.env`.

| Variable        | Description                   | Example                           |
| --------------- | ----------------------------- | --------------------------------- |
| `PORT`          | Port on which Express listens | `5000`                            |
| `MONGO_URI`     | MongoDB connection string     | `mongodb://127.0.0.1:27017/slate` |
| `CLIENT_ORIGIN` | Allowed frontend origin(s)    | `http://localhost:5173`           |

For multiple allowed frontend origins, the backend configuration supports comma-separated values.

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/slate
CLIENT_ORIGIN=http://localhost:5173
```

Never commit actual database credentials to GitHub. Keep the `.env` file private and use the hosting provider's environment-variable settings in production.

---

## Running the Application

### Run the Frontend

```bash
cd client
npm run dev
```

### Build the Frontend

```bash
cd client
npm run build
```

Vite generates production assets in:

```text
client/dist/
```

### Preview the Production Build

```bash
cd client
npm run preview
```

### Run the Backend in Development Mode

```bash
cd server
npm run dev
```

### Run the Backend in Production Mode

```bash
cd server
npm start
```

---

## Backend API

The Express backend exposes a small REST API for health checks and progress persistence.

### Base URL

Local development:

```text
http://localhost:5000
```

Production:

```text
https://YOUR-BACKEND-URL
```

Replace the example production address with your actual Render backend URL.

### 1. Health Check

**Endpoint**

```http
GET /api/health
```

**Purpose:** Check whether the backend process is responding.

**Example response**

```json
{
  "ok": true,
  "service": "slate-api"
}
```

### 2. Retrieve Progress

**Endpoint**

```http
GET /api/progress
```

**Purpose:** Retrieve the stored progress object.

**Example response**

```json
{
  "progress": {}
}
```

The actual progress object depends on the data previously saved.

### 3. Save Progress

**Endpoint**

```http
PUT /api/progress
Content-Type: application/json
```

**Example request**

```json
{
  "progress": {
    "card-example": {
      "repetitions": 2,
      "intervalDays": 3
    }
  }
}
```

**Example response**

```json
{
  "ok": true
}
```

The endpoint requires `progress` to be a JSON object. If MongoDB is unavailable, the endpoint returns a service-unavailable response.

### Error Responses

| Status | Meaning                   |
| ------ | ------------------------- |
| `400`  | Invalid progress payload  |
| `500`  | Internal server error     |
| `503`  | Database is not connected |

### Additional Route Definitions

The project also contains definitions for flashcard and learner-specific review-progress operations in `server/src/routes/api.js`, including:

- `GET /api/flashcards`
- `POST /api/flashcards`
- `GET /api/progress/:learnerId`
- `PUT /api/progress/:learnerId/:cardId`

These routes are not automatically available simply because they exist in a file. They must be mounted in the Express application before they can be used.

---

## Database

Slate uses MongoDB for persistent learning-progress storage.

### Local MongoDB

The default local connection string is:

```text
mongodb://127.0.0.1:27017/slate
```

The database name is `slate`.

### MongoDB Atlas

For cloud deployment:

1. Create a MongoDB Atlas project and database cluster.
2. Create a database user with a secure password.
3. Configure the network access rules for your backend host.
4. Obtain the database connection string.
5. Replace the username and password placeholders.
6. Add the completed URI to the backend's `MONGO_URI` environment variable.
7. Redeploy the backend.

Do not expose the MongoDB connection string in frontend code or public repositories.

### Progress Persistence

The current backend stores progress through a MongoDB document. Browser localStorage is also used as a fallback by the frontend.

The current progress endpoint uses a single default progress record and does not implement user authentication or per-user isolation. It should not be treated as a production multi-user learning account system without additional backend work.

---

## Deployment

Slate can be deployed using GitHub, Render, and MongoDB Atlas.

### Step 1: Push the Code to GitHub

```bash
git add .
git commit -m "Update Slate application"
git push origin main
```

Repository:

https://github.com/alalker789/slate

### Step 2: Configure MongoDB Atlas

Create the cloud database and configure its connection string in the backend environment variables.

### Step 3: Deploy the Backend on Render

Create a new Web Service and connect the GitHub repository.

Recommended settings:

| Setting        | Value         |
| -------------- | ------------- |
| Branch         | `main`        |
| Root Directory | `server`      |
| Build Command  | `npm install` |
| Start Command  | `npm start`   |

Add the required environment variables in Render's Environment settings:

```env
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_ORIGIN=your_frontend_origin
```

The hosting platform provides the `PORT` variable in most deployments, so the backend should use `process.env.PORT`.

After deployment, test:

```text
https://YOUR-BACKEND-URL/api/health
```

### Step 4: Deploy the Frontend on Render

Create a Static Site using the same GitHub repository.

Recommended settings:

| Setting           | Value                          |
| ----------------- | ------------------------------ |
| Branch            | `main`                         |
| Root Directory    | `client`                       |
| Build Command     | `npm install && npm run build` |
| Publish Directory | `dist`                         |

### Step 5: Connect the Frontend to the Backend

The local Vite proxy only applies during development. In production, the frontend must send API requests to the deployed backend URL.

For a production deployment, configure the frontend's API base URL and CORS settings appropriately. Update the frontend request logic and Vite configuration as needed so API calls reach the deployed backend rather than the static-site origin.

After changing the configuration:

1. Update the frontend API URL.
2. Set `CLIENT_ORIGIN` on the backend to the deployed frontend origin.
3. Redeploy the backend.
4. Redeploy the frontend.
5. Test both the health endpoint and progress persistence.

**Important:** A frontend being live does not automatically mean that its API and database integration are working. Verify each part independently.

---

## Troubleshooting

### `npm error Missing script: "start"`

Check the Render service's root directory.

For the backend, it should be `server`, where `server/package.json` defines the `start` script.

### MongoDB Authentication Failed

Check the following:

- Database username and password
- Correct database connection string
- URL-encoded special characters in credentials
- MongoDB Atlas network access configuration
- Backend `MONGO_URI` environment variable

Never share a screenshot containing your full database credentials.

### Frontend Loads but Progress Does Not Save

Check:

- Whether the backend health endpoint responds
- Whether the production frontend uses the correct API URL
- Whether `MONGO_URI` is configured
- Whether the backend can connect to MongoDB
- Whether CORS allows the deployed frontend origin
- Browser Developer Tools → Network and Console

### Changes Do Not Appear on the Live Website

Check whether the latest commit was pushed to GitHub and whether Render completed the latest deployment.

Try a hard refresh:

```text
Ctrl + Shift + R
```

For favicon changes, the browser may continue displaying a cached icon temporarily.

### Vite Build Fails

Run the production build locally:

```bash
cd client
npm install
npm run build
```

Read the first meaningful error in the terminal. Resolve dependency, import, or syntax issues before redeploying.

---

## Limitations

- The existing visualization engine is implemented primarily in vanilla JavaScript rather than being rewritten as fully componentized React logic.
- The custom code tracer executes JavaScript, not compiled C, C++, or Java.
- Backend progress storage currently uses a default record rather than authenticated, user-specific accounts.
- Browser localStorage is a local fallback, not a replacement for reliable server-side persistence.
- The frontend requires explicit production API configuration to communicate with the separately deployed backend.
- Authentication, authorization, and multi-user account management are not included in the current basic backend.

---

## Future Improvements

Potential improvements include:

- User registration, login, and secure authentication
- Individual learning profiles and isolated progress records
- A dedicated flashcard API integrated with the frontend
- More algorithms, including Dijkstra's shortest-path algorithm, topological sorting, and dynamic programming
- Additional data structure visualizations
- Persistent learning streaks and progress dashboards
- XP, achievements, and leaderboards
- Unit and integration tests
- Automated CI/CD checks
- Improved accessibility and keyboard navigation
- A fully componentized React architecture
- More robust error handling and production monitoring

---

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the frontend build and backend behavior.
5. Commit your changes with a descriptive message.
6. Open a pull request describing the changes.

Example:

```bash
git checkout -b feature/new-visualizer
git add .
git commit -m "Add new algorithm visualizer"
git push origin feature/new-visualizer
```

---

## License

No license has been specified in the repository documentation yet. Add an appropriate `LICENSE` file before granting explicit reuse or redistribution permissions.

---

**Built with React, Vite, Express, MongoDB, and a passion for making DSA easier to understand.**

GitHub Repository: https://github.com/alalker789/slate
