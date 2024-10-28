
---

# Simple API App

This is a simple API app built with **Node.js**, **TypeScript**, **Express**, **PostgreSQL**, and **TypeORM**. It features user authentication via **Google OAuth** and traditional email/password login, along with email verification using **SendGrid**. 

Documentation Live Demo: https://simple-api-7624-155de3f88874.herokuapp.com/api-docs/

## Features

- **User Sign-up**: Users can sign up using their email and password or Google OAuth.
- **Email Confirmation**: Users receive a confirmation email with a verification link. Once clicked, the user's account is verified.
- **Login**: Users can log in using email/password or Google OAuth.
- **Profile Management**: Users can retrieve and update their profile information.
- **Session Handling**: User sessions are managed using cookies for authenticated routes.

## Technologies

- **Node.js**: JavaScript runtime environment
- **TypeScript**: For type-safe development
- **Express**: Web framework for Node.js
- **PostgreSQL**: Relational database for storing user information
- **TypeORM**: ORM for database management
- **Passport.js**: Authentication middleware for Node.js
- **SendGrid**: Service for sending email verification links
- **Swagger**: API documentation

## Routes

- `POST /signup`: Sign up a new user and send a confirmation email.
- `GET /confirm-email/:token`: Verify email using a confirmation token.
- `POST /login`: Log in with email and password.
- `GET /auth/google`: Redirect to Google OAuth login.
- `GET /auth/google/callback`: Google OAuth callback route.
- `GET /profile`: Get the user's profile (requires authentication).
- `POST /profile`: Update user's profile (requires authentication).
- `GET /stats`: Retrieve user statistics (requires authentication).

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/yourrepo.git
   cd yourrepo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables in a `.env` file:
   ```bash
   DB_HOST=your_db_host
   DB_PORT=your_db_port
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_SENDER_MAIL=your_sendgrid_sender_mail
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   LOGIN_PAGE_URL=your_frontend_login_page_url
   HOME_PAGE_URL=your_frontend_home_page_after_login_url
   BASE_URL=http://localhost:3000
   ```

4. Run the migrations:
   ```bash
   npm run typeorm migration:run
   ```

5. Start the app:
   ```bash
   npm run dev
   ```

6. Access Swagger API documentation at:
   ```
   http://localhost:3000/api-docs
   ```

## License

This project is licensed under the MIT License.

---
