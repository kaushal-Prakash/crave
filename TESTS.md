# How to Run Tests

This project includes different layers of testing following the testing pyramid approach. Here is how you can run them on your machine:

## 1. Backend Tests (Unit and Integration)
The backend uses **Jest** and **Supertest** to verify individual utility functions (White-box testing) and API endpoints (Black-box testing).

Because the backend uses ES modules, Jest must be run with an experimental flag. 

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the tests:
   ```bash
   # If using Command Prompt or bash:
   set NODE_OPTIONS=--experimental-vm-modules && npx jest
   
   # If using PowerShell:
   $env:NODE_OPTIONS="--experimental-vm-modules"; npx jest
   ```

## 2. Python Recommender Tests (Unit)
The Python recommender uses **Pytest** for testing chatbot logic with mocked external APIs.

1. Open your terminal from the root project directory and navigate to the recommender:
   ```bash
   cd recommender
   ```
2. Activate the virtual environment:
   ```bash
   # On Windows:
   .venv\Scripts\activate
   
   # On Mac/Linux:
   source .venv/bin/activate
   ```
3. Run the tests:
   ```bash
   pytest
   ```

## 3. Automation / E2E Tests (TestCafe)
The end-to-end (E2E) browser automation tests verify UI flows such as logging in with valid and invalid credentials.

1. Open your terminal in the **root directory** of the project (`crave`).
2. Run the npm test script:
   ```bash
   npm run test
   ```
*(Note: This command will automatically launch Chrome and execute the test scenarios.)*
