# Test Metrics and Quality Measurement

This document serves as a comprehensive guide for the testing lifecycle, metrics, and quality measurement for the project, aligned with standard software testing laboratory activities.

## 1. Test Planning and Estimation (IEEE-829 Format)

### 1.1 Test Plan Identifier
`TP-CRAVE-001`

### 1.2 Introduction
This test plan outlines the testing strategies (Unit, Integration, White-box, Black-box, and Automation) for the application, ensuring robustness and quality before deployment.

### 1.3 Features to be Tested
- User Authentication (Login/Registration)
- Recipe CRUD Operations
- AI Chatbot Recommendations

### 1.4 Verification Checklist
- [ ] Requirements are clearly defined and testable.
- [ ] Code follows standard formatting and linting rules.
- [ ] Unit tests cover at least 70% of core logic.

## 2. Test Metrics & Quality Measurement

Given a hypothetical scenario for lab demonstration:
- **Project Size:** 100 KLOC (Kilo Lines of Code)
- **Total Defects Found:** 50
- **Total Effort (Hours):** 500 hours

### 2.1 Defect Density
Defect Density measures the number of defects per 1,000 lines of code.
`Defect Density = (Total Defects / Project Size in KLOC)`
`Defect Density = 50 / 100 = 0.5 defects / KLOC`

### 2.2 Testing Productivity
Productivity measures the number of test cases executed or defects found per unit of effort.
`Defect Productivity = (Total Defects / Total Effort)`
`Defect Productivity = 50 / 500 = 0.1 defects / hour`

## 3. Defect Reporting and Tracking

### 3.1 Defect Life Cycle Table

| Status | Description |
| :--- | :--- |
| **New** | A defect is reported for the first time. |
| **Assigned** | Defect is assigned to a developer for resolution. |
| **Active/Open** | Developer has started analyzing and working on the defect. |
| **Fixed** | Developer has resolved the defect and pushed the code. |
| **Retest** | Tester retests the specific functionality. |
| **Closed** | Defect is verified as resolved and closed. |
| **Reopened** | Defect still exists after the fix, sent back to developer. |

## 4. Testing Techniques Implemented

- **Black-Box Testing:** API endpoints are tested using `supertest` without knowing the internal code logic. Branch and statement coverage are not the primary focus here; we focus on Input -> Output.
- **White-Box Testing:** Internal utility functions (e.g., token verification, controller validation) are tested to ensure specific code branches and statements execute correctly.
- **Positive & Negative Testing:**
  - *Positive Testing:* Verifies system behavior with valid data, genuine authentication tokens, open route accessibility, and successful operation completions (HTTP 200).
  - *Negative Testing:* Tests robustness against missing parameters, invalid/tampered/expired tokens, and boundary errors (HTTP 400, 401, 204).
- **Unit Testing:** Both frontend/backend functions and Python recommender logic are tested in isolation using Jest and PyTest.
- **Integration Testing:** Ensuring the database, backend routes, and services interact correctly.
- **Automation Testing (E2E):** Using TestCafe to simulate real user interactions in the browser (e.g., automated login test).
