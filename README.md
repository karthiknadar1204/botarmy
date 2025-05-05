Cron Job example 
# botarmy<img width="1058" alt="Screenshot 2025-03-15 at 2 50 01 AM" src="https://github.com/user-attachments/assets/272b03a8-dbe4-4b73-9372-0e87cb88a86c" />

# Coding Contest Tracker->waste

A full-stack application to track, bookmark, and get reminders for competitive programming contests across multiple platforms like Codeforces and LeetCode.,will also add one support for codechef

## Project Overview

This application helps competitive programmers stay updated with upcoming contests, bookmark their favorites, and set reminders. The project consists of two main parts AND MORE PARTS WILL BE ADDED LIKE codechef support:

- **Backend**: A FastAPI application that scrapes contest data from platforms like Codeforces and LeetCode.
- **Frontend**: A Next.js application with Clerk authentication and a modern UI built using Shadcn/UI components.

## Features

- **Contest Tracking**: View upcoming, ongoing, and past contests.
- **Platform Filtering**: Filter contests by platform (Codeforces, LeetCode).
- **Status Filtering**: Filter contests by their status (upcoming, ongoing, past).
- **Bookmarking**: Save contests for quick access.
- **Reminders**: Set email reminders for contests.
- **Dark/Light Mode**: Toggle between dark and light themes.
- **Responsive Design**: Optimized for desktop and mobile devices.

## User Flow

1. **Home Page**: 
   - View upcoming, ongoing, and past contests.
   - Filter contests by platform and status.
   - Bookmark contests (requires authentication).
   
2. **Authentication**: 
   - Sign up/sign in with Clerk.
   - User data synced with the backend database.
   
3. **Bookmarks Page**: 
   - View and manage bookmarked contests.
   - Filter bookmarked contests.
   

## Backend Components

### Main Application (main.py)
- Sets up database connections.
- Configures CORS middleware.
- Registers routers for contests, bookmarks, and users.
- Initializes scheduled scraping jobs.

### Scrapers
- **CodeForcesScraper**: Fetches contest data from the Codeforces API.
- **LeetCodeScraper**: Scrapes contest data from LeetCode.

### Models
- **Contest**: Represents programming contests with platform, timing, and status.
- **User**: Stores user information synced from Clerk.
- **Bookmark**: Links users to their bookmarked contests.

### Routers
- **contests.py**: Endpoints for listing and filtering contests.
- **bookmarks.py**: Endpoints for managing user bookmarks.
- **users.py**: Endpoints for user management and syncing with Clerk.

## Frontend Components

### Layout (layout.tsx)
- Wraps the application with `ClerkProvider` for authentication.
- Provides theme support with `ThemeProvider`.
- Renders the header with authentication buttons and theme toggle.

### Pages
- **Home (page.tsx)**: Main page displaying contests with filtering options.
- **Bookmarks (bookmarks/page.tsx)**: Page showing user's bookmarked contests.
- Authentication pages provided by Clerk.

### Components
- **UserSync**: Syncs Clerk user data with the backend.
- **BookmarkButton**: Toggles bookmarking for contests.
- **ContestSection**: Displays contests grouped by status.


## Setup and Installation

### Backend

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost/db
   CODEFORCES_API_KEY=your_key
   CODEFORCES_API_SECRET=your_secret
   ```

3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Technologies Used

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, APScheduler
- **Frontend**: Next.js, React, Clerk, Shadcn/UI, Tailwind CSS


## Future Enhancements

- Add more contest platforms (AtCoder, HackerRank, etc.).
- Implement calendar integration.
- Add contest difficulty ratings.
- Create personalized contest recommendations.
- Implement social features (sharing, comments).

## Environment Variables

Here are the essential environment variables you'll need:

Frontend
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`=
- `CLERK_SECRET_KEY`=
-` NEXT_PUBLIC_CLERK_SIGN_IN_URL`=/sign-in
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_UR`L=/
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`=/
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`=/sign-up
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`=/
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`=/

Backend
- `DATABASE_URL`: Database connection URL (PostgreSQL).
- `CODEFORCES_API_KEY`: Codeforces API key.
- `CODEFORCES_API_SECRET`: Codeforces API secret.



## Conclusion

This project aims to help competitive programmers stay organized and never miss important contests across multiple platforms. You can view, bookmark, and set reminders for contests with ease, ensuring you never miss a chance to participate.
