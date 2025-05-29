Final Year Project - AutoPart Genius

This repository contains the code for my final year project, which includes a full-stack application (Final Platform) with separate frontend and backend components, a Flask-based model hosting project (Flask Model Hosting Project), and an ML model integration (ML Model Codings).
Project Structure

    Final Platform: Contains the main full-stack application.
        frontend: React-based frontend.
        backend: Node.js-based backend.
    Flask Model Hosting Project: Flask application for hosting the ML model.
    ML Model Codings: Contains the ML trained model and related scripts.

Prerequisites

    Node.js and npm installed for the Final Platform frontend and backend.
    Python 3.x installed for the Flask application.
    Virtualenv for creating a Python virtual environment (optional but recommended).
    A compatible browser for running the React frontend.

Setup Instructions
1. Clone the Repository
bash
git clone <repository-url>
cd Final-Platform
2. Final Platform Setup (Frontend & Backend)
Frontend Setup

    Navigate to the frontend folder:
    bash

cd Final-Platform/frontend
Install dependencies:
bash
npm install

    If you encounter a node_modules error (e.g., missing dependencies), delete the node_modules folder and package-lock.json, then re-run:
    bash

    npm install

Run the development server:
bash

    npm run dev
        This will start the React frontend. Check the terminal for the local URL (usually http://localhost:3000).

Backend Setup

    Open a new terminal and navigate to the backend folder:
    bash

cd Final-Platform/backend
Install dependencies:
bash
npm install

    If you encounter a node_modules error, delete the node_modules folder and package-lock.json, then re-run:
    bash

    npm install

Start the backend server:
bash

    npm start
        The backend should now be running (default port is often http://localhost:5000, but check your configuration).

3. Testing the Application
Frontend Testing

    In the frontend folder, run:
    bash

    npm run test
        This will execute the frontend test suite.

Backend Testing

    In the backend folder, run:
    bash

    npm run test
        This will execute the backend test suite.

4. Flask Model Hosting Project Setup
Download and Setup

    Navigate to the Flask project folder:
    bash

    cd Flask-Model-Hosting-Project
    Download the ML trained model from the following link: "https://drive.google.com/file/d/1OXz_z3UGnxHX_6elLH03w300JauboSyU/view?usp=drive_link".
    Place the downloaded ML model file into the Flask-Model-Hosting-Project folder.

Create a Virtual Environment

    Create a Python virtual environment:
    bash

python -m venv venv
Activate the virtual environment:

    On Windows:
    bash

venv\Scripts\activate
On macOS/Linux:
bash

        source venv/bin/activate

Install Dependencies

    Install the required dependencies from requirements.txt:
    bash

    pip install -r requirements.txt
        This will automatically install all necessary Python dependencies for the Flask app.

Run the Flask Application

    Run the Flask app:
    bash

flask run

    Alternatively, if the Flask app is set up with a specific script (e.g., app.py), run:
    bash

        python app.py
        The Flask backend should now be running (default is http://localhost:5000, but check your configuration).

5. ML Image Processing with React Frontend

    Once the Flask Python backend is running and the ML model is integrated, the React frontend in Final-Platform/frontend can interact with it for ML image processing.
    Ensure both the Flask backend and React frontend are running simultaneously.
    Test the integration by performing an image processing task through the frontend UI (refer to the frontend documentation for specific endpoints or features).

Troubleshooting

    Node.js Errors: If you encounter issues with node_modules in either the frontend or backend, delete the node_modules folder and package-lock.json, then re-run npm install.
    Flask Errors: Ensure the virtual environment is activated and all dependencies in requirements.txt are installed. Check for errors in the terminal when running flask run.
    ML Model Issues: Verify that the ML model file is correctly placed in the Flask-Model-Hosting-Project folder and that the Flask app is configured to load it.

Dependencies

The following dependencies are automatically installed during setup:

    Final Platform (Frontend & Backend): Managed via package.json (Node.js dependencies like React, Express, etc.).
    Flask Model Hosting Project: Managed via requirements.txt (Python dependencies like Flask, NumPy, etc.).

If additional dependencies are required, they have been added to the respective package.json or requirements.txt files.
