# Testing Guide & Implemented Testing Types

This document outlines the testing strategy, types of testing implemented across the application, and detailed instructions on how to execute them.

---

## 📌 Types of Testing Performed

The project adopts a multi-tiered testing strategy aligned with the **Testing Pyramid**, combining unit, integration, and end-to-end automation tests:

| Testing Type | Scope / Layer | Tool | Description & Implementation in Crave |
| :--- | :--- | :--- | :--- |
| **1. Unit Testing** | Utility functions, Middlewares, Python Logic | **Jest**, **Pytest** | Isolates individual components to verify correctness. Backend unit tests cover `authMiddleware` and controller validations (`tests/unit/`). Python unit tests verify recommender logic and mocked LLM outputs (`recommender/`). |
| **2. Integration Testing** | API Routes, Middleware Chains | **Supertest**, **Express** | Verifies combined behavior of Express routers, cookie parsers, and authentication middleware working together (`backend/tests/integration/api.test.js`). |
| **3. White-Box Testing** | Code branches, Conditionals, Error paths | **Jest** | Tests internal code paths, statement coverage, and branch decisions (e.g. valid vs. expired token handling, parameter presence checks in controllers). |
| **4. Black-Box Testing** | API Endpoints, UI Interactions | **Supertest**, **TestCafe** | Tests external interfaces based purely on specifications and inputs/outputs, without dependency on internal implementation details. |
| **5. Positive Testing** | Backend & Frontend | **Jest**, **Supertest**, **TestCafe** | Verifies that valid inputs produce expected successful outcomes (e.g. valid login, health check 200, authenticating with valid JWT, adding recipes, viewing favorites). |
| **6. Negative Testing** | Backend & Frontend | **Jest**, **Supertest**, **TestCafe** | Verifies resilience against invalid inputs, boundary errors, and unauthorized access (e.g. missing required fields, invalid/expired JWTs, wrong passwords, 400/401/204 status codes). |
| **7. End-to-End (E2E) / Automation Testing** | Full Browser UI flows | **TestCafe** | Automates real user journeys in a live browser (Google Chrome) covering login, adding recipes, favoriting, profile updates, and navigation. |
| **8. Regression Testing** | Entire Project | **Jest**, **Pytest**, **TestCafe** | Automated test suites can be executed continuously on code updates to ensure existing functionalities remain unbroken. |

---

## 0. Seed Database (Required for E2E Tests)
Before running automation / E2E tests, feed the required test users, recipes, and favorites into the database:
```bash
# From root directory:
npm run seed

# Or from backend directory:
cd backend && npm run seed
```
This populates:
- Primary test user `jay` (password: `12345678`)
- 14 recipes created by `jay` (enables both search and pagination tests)
- 12 favorite recipes for `jay` (enables favorites and pagination tests)
- Additional community users, recipes, comments, and chat messages.

---

## 1. Backend Tests (Unit and Integration)
The backend uses **Jest** and **Supertest** to verify individual utility functions and controllers (White-box testing) as well as API endpoints and middleware pipelines (Black-box testing).

The backend test suite is strictly partitioned into **Positive Testing** and **Negative Testing**:

### Positive Testing Scenarios
- **Health Check & Base Route**: Verifies GET `/` returns HTTP `200` with status `"Server is UP!"`.
- **Public Open Route Access**: Verifies that open routes (`/users/user-login`, `/users/user-signup`, `/recipes/get-recipes`, `/recipes/get-recipe-by-id`, and static image paths `/images/*`) bypass authentication middleware without `401 Unauthorized`.
- **Authenticated Sessions**: Verifies that protected routes (`/users/is-loged-in`, `/users/user-logout`) correctly decode valid JWT tokens in cookies, attach user payload to `req.user`, and return HTTP `200`.
- **User Logout Session Termination**: Verifies that `/users/user-logout` clears the HttpOnly cookie by expiring it and returns HTTP `200`.

### Negative Testing Scenarios
- **Missing Authentication Tokens**: Verifies that protected endpoints (`/users/is-loged-in`, `/users/get-user-fav`, `/recipes/update-recipe`) return HTTP `401` with `"Access denied. No token provided."` when cookies are omitted.
- **Invalid / Tampered Tokens**: Verifies that malformed or signature-mismatched JWT tokens are rejected with HTTP `400` (`"Invalid token."`).
- **Expired Tokens**: Verifies that tokens past their expiration timestamp are rejected with HTTP `400` (`"Invalid token."`).
- **Signup Payload Validation**: Verifies that registration requests missing `fullName`, `username`, `email`, or `password` fail fast with HTTP `400` (`"All fields are required"`).
- **Login Credentials Validation**: Verifies that login attempts with empty bodies or missing passwords return HTTP `204` (`"Fill all credentials"`).
- **Recipe Endpoint Validation**: Verifies that recipe queries with missing IDs or update payloads with missing title/description return appropriate client validation errors (`204` / `400`).

### Backend Test Coverage Matrix
| Test Suite | File | Category | Technique | Scenarios Covered |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Middleware** | `backend/tests/unit/auth.test.js` | Positive & Negative | White-Box | Valid tokens, open routes, static paths, missing token (401), invalid token (400), expired token (400) |
| **Controllers Validation** | `backend/tests/unit/controllers.test.js` | Positive & Negative | White-Box | Logout cookie clearing, session validity, missing required fields for signup, login, recipe addition/updates |
| **API Endpoints** | `backend/tests/integration/api.test.js` | Positive & Negative | Black-Box | Base health check, protected route access with/without JWT cookie, payload validation over HTTP |

### How to Run Backend Tests
Because the backend uses ES modules, Jest must be run with an experimental flag.

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the tests:
   ```bash
   # Recommended (Cross-platform across Bash, CMD, and PowerShell):
   npm test

   # Or if using Git Bash / Linux / macOS terminal:
   NODE_OPTIONS=--experimental-vm-modules npx jest

   # If using PowerShell:
   $env:NODE_OPTIONS="--experimental-vm-modules"; npx jest

   # If using Windows Command Prompt (CMD):
   set NODE_OPTIONS=--experimental-vm-modules && npx jest
   ```

---

## 2. Python Recommender Tests (Unit)
The Python recommender uses **Pytest** with mocked external dependencies (such as Google GenAI / LangChain) to verify conversation pipeline handling and fallback initializations.

### Recommender Test Scenarios
- **Lazy Chain Initialization (White-Box)**: Ensures `init_chatbot()` is triggered automatically if the RAG chain is uninitialized (`rag_chain is None`).
- **Conversation History Parsing (White-Box)**: Ensures chat history containing user and AI roles is correctly transformed into LangChain `HumanMessage` and `AIMessage` structures for model context.

### Recommender Test Coverage Matrix
| Test Suite | File | Category | Technique | Scenarios Covered |
| :--- | :--- | :--- | :--- | :--- |
| **Chatbot RAG Chain** | `recommender/tests/test_chatbot.py` | Positive & Unit | White-Box | Uninitialized RAG chain handling, conversion of user & AI dialog turns into LangChain message objects |

### How to Run Python Recommender Tests
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

---

## 3. Automation / E2E Tests (TestCafe)
The end-to-end (E2E) browser automation tests use **TestCafe** to drive Google Chrome against the live Next.js frontend, backend API, and database, simulating realistic user journeys.

### Positive Testing Scenarios
- **Valid User Authentication**: Logs in user `jay` with valid password, verifying successful session establishment and redirect to `/home`.
- **Recipe Creation & Rich Text**: Submits a new recipe with a title and formatted description via Quill editor, verifying database persistence and navigation.
- **Favorites & Pagination**: Loads user's favorited recipes, tests search input visibility, and verifies next/previous pagination buttons.
- **User Recipe Management**: Verifies the "My Recipes" dashboard correctly fetches and paginates through recipes created by the logged-in user.
- **Profile Data Verification**: Verifies that user profile fields (Full Name, Username, Email) correctly populate from backend user data.
- **Public Page Rendering**: Confirms that unauthenticated public pages (e.g. `/about-us`) render team member cards and headings without requiring a login session.

### Negative Testing Scenarios
- **Invalid User Credentials**: Submits invalid email and incorrect password on `/login`, verifying the user is denied access and kept on the `/login` page with an error.

### E2E Automation Test Coverage Matrix
| Test Suite | File | Category | Technique | Scenarios Covered |
| :--- | :--- | :--- | :--- | :--- |
| **User Login** | `tests/login.test.js` | Positive & Negative | Black-Box / E2E | Valid login with redirect to `/home`, invalid login with rejection staying on `/login` |
| **Add Recipe** | `tests/add-recipe.test.js` | Positive | Black-Box / E2E | Form completion, Quill rich-text editor inputs, submit button interaction, redirect to `/home` |
| **Favorite Recipes** | `tests/fav.test.js` | Positive | Black-Box / E2E | Favorite recipe cards display, search bar presence, pagination button navigation |
| **My Recipes** | `tests/my-recipes.test.js` | Positive | Black-Box / E2E | User-created recipe grid rendering, pagination across multiple recipe pages |
| **User Profile** | `tests/profile.test.js` | Positive | Black-Box / E2E | Profile page loading, validation of Full Name, Username, and Email labels and data values |
| **About Us** | `tests/about-us.test.js` | Positive | Black-Box / E2E | Public layout rendering, verification of team member headings and content blocks |

### How to Run Automation / E2E Tests
1. Ensure the development server is running in the root directory:
   ```bash
   npm run dev
   ```
2. Open a separate terminal in the **root directory** of the project (`crave`).
3. Run the npm test script:
   ```bash
   npm run test
   ```
*(Note: This command will automatically launch Chrome and execute the test scenarios.)*

