# Crave - Recipe Sharing Platform

## Overview
Crave is a user-friendly platform designed for food enthusiasts to share and discover new recipes. Users can sign up, upload their favorite dishes, browse community recipes, and engage with others through comments.

## Features
- **User Authentication**: Secure login and signup using JWT and HTTP-only cookies.
- **Recipe Management**: Users can add, edit, and delete their own recipes.
- **Browsing & Discovery**: Explore recipes shared by other users.
- **Comments Section**: Engage with the community by commenting on recipes.

## Tech Stack
### Frontend:
- **Next.js** – Modern React framework for UI development.
- **Axios** – Simplifies API requests.
- **Sass** – Enhances styling capabilities.

### Backend:
- **Express.js** – Handles REST API requests.
- **MySQL** – Stores user and recipe data efficiently.
- **JWT & HTTP-only Cookies** – Ensures secure authentication.

## Installation & Setup
1. **Clone the repository**
   ```sh
   git clone https://github.com/your-repo/crave.git
   cd crave
   ```
2. **Install dependencies**
   ```sh
   # Frontend
   cd frontend
   npm install
   ```
   ```sh
   # Backend
   cd backend
   npm install
   ```
3. **Configure environment variables**
   - Set up `.env` files for both frontend and backend.
4. **Run the application**
   ```sh
   # Start backend
   npm run dev
   ```
   ```sh
   # Start frontend
   npm run dev
   ```

## API Endpoints
### Authentication
- `POST /users/user-signup` - User registration
- `POST /users/user-login` - User login
- `GET /users/user-logout` - User logout
- `GET /users/is-loged-in` - Check if user is logged in
- `GET /users/get-user` - Get current user details
- `GET /users/get-user-by-id` - Get user details by ID

### Recipes
- `POST /users/add-recipe` - Add a new recipe
- `POST /recipes/update-recipe` - Edit a recipe
- `POST /recipes/get-recipe-by-id` - Get a recipe by ID
- `GET /recipes/get-recipes` - Fetch all recipes
- `GET /recipes/get-user-recipes` - Fetch all recipes by a user
- `GET /recipes/delete-recipe/:id` - Delete a recipe

### Comments
- `POST /comments/add/:id` - Add a comment to a recipe
- `POST /comments/update/:id` - Edit a comment
- `GET /comments/get-recipe-comments/:id` - Fetch comments for a recipe
- `GET /comments/delete/:id` - Delete a comment

## License
This project is open-source and free to use.

