# CodeArena - Premium Coding Platform

A modern, dark-themed coding platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Authentication System
- **Login**: Secure email/password authentication
- **Signup**: Account creation with username, email, and password validation
- **Password Recovery**: Email-based password reset functionality
- **Session Management**: Persistent authentication with automatic session handling

### Dashboard
- **User Statistics**: Track problems solved, submissions, acceptance rate, and streaks
- **Activity Charts**: Visual representation of weekly coding activity
- **Recent Activity**: View your latest submissions with detailed status
- **Personal Stats**: Global rank, total points, and average completion time

### Problems List
- **Advanced Filtering**: Filter by difficulty (easy, medium, hard), category, status, and tags
- **Search Functionality**: Search problems by title or description
- **Sorting Options**: Sort by title, difficulty, acceptance rate, or submission count
- **Problem Cards**: Detailed problem previews with stats and tags

### Problem Detail Page
- **Multi-Language Support**: JavaScript, Python, Java, and C++ with starter code
- **Code Editor**: Syntax-highlighted code editor with tab support
- **Test Runner**: Run test cases to validate your solution
- **Submission System**: Submit solutions and track results
- **Discussion Section**: Community discussions for each problem
- **Problem Statement**: Clear description with examples and constraints

### Leaderboard
- **Global Rankings**: See top performers and your position
- **Time Filters**: View leaderboards for all-time, monthly, or weekly
- **User Badges**: Special badges for top performers (Champion, Runner-up, Top 10)
- **Detailed Stats**: Points, problems solved, and streak information
- **Interactive Table**: Hover effects and current user highlighting

### UI/UX Features
- **Dark Theme**: Eye-friendly dark color scheme throughout
- **Smooth Animations**: Fade-in, slide-in, and hover animations
- **Responsive Design**: Fully responsive across all device sizes
- **Custom Scrollbars**: Styled scrollbars matching the dark theme
- **Loading States**: Elegant loading indicators
- **Error Handling**: User-friendly error messages with validation

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── StatsCard.tsx
│   │   ├── ActivityChart.tsx
│   │   └── RecentActivity.tsx
│   ├── problems/
│   │   ├── ProblemsPage.tsx
│   │   ├── ProblemCard.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ProblemDetailPage.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── TestResults.tsx
│   │   └── DiscussionSection.tsx
│   ├── leaderboard/
│   │   └── LeaderboardPage.tsx
│   └── layout/
│       └── Navbar.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   The `.env` file is already configured with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://cwttvnzsuokngvplswdn.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Database Setup**

   The database schema has been automatically created with the following tables:
   - `profiles` - User profile information
   - `problems` - Coding problems
   - `submissions` - User code submissions
   - `user_problem_status` - Track solved/attempted problems
   - `discussions` - Problem discussions
   - `discussion_replies` - Discussion replies
   - `activity_log` - User activity tracking

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

## Database Schema

### Tables

1. **profiles**
   - User information and statistics
   - Links to auth.users
   - Tracks rank, points, problems_solved, streak_days

2. **problems**
   - Coding problem details
   - Difficulty levels, categories, tags
   - Starter code for multiple languages
   - Test cases and examples

3. **submissions**
   - User code submissions
   - Status tracking (accepted, wrong_answer, etc.)
   - Runtime and memory metrics

4. **user_problem_status**
   - Tracks which problems users have attempted/solved
   - Links users to problems

5. **discussions**
   - Community discussions for problems
   - Upvoting system

6. **discussion_replies**
   - Replies to discussion threads
   - Nested conversation support

7. **activity_log**
   - Tracks user activity for dashboard analytics

### Security

All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only view/edit their own data
- Problems and discussions are publicly viewable
- Submissions are private to the user

## Usage Guide

### Creating an Account

1. Click "Sign Up" on the login page
2. Enter username (at least 3 characters, alphanumeric + underscores)
3. Enter email and password (minimum 6 characters)
4. Confirm password
5. Click "Create Account"

### Solving Problems

1. Navigate to "Problems" in the navbar
2. Use filters to find problems by difficulty, category, or tags
3. Click on a problem to view details
4. Select your preferred programming language
5. Write your solution in the code editor
6. Click "Run Tests" to validate against test cases
7. Click "Submit" to submit your solution

### Viewing Leaderboard

1. Navigate to "Leaderboard" in the navbar
2. View top performers with their stats
3. Filter by time period (All Time, This Month, This Week)
4. Find your position in the rankings

### Participating in Discussions

1. Open any problem detail page
2. Click the "Discussion" tab
3. Click "New Post" to start a discussion
4. View and upvote existing discussions

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run typecheck` - Check TypeScript types

## Sample Data

The database includes 5 sample problems:
1. Two Sum (Easy)
2. Add Two Numbers (Medium)
3. Longest Substring Without Repeating Characters (Medium)
4. Median of Two Sorted Arrays (Hard)
5. Valid Parentheses (Easy)

## Design Features

### Color Scheme
- Background: Gray-950, Gray-900
- Borders: Gray-800, Gray-700
- Text: White, Gray-400
- Accent: Blue-500, Cyan-500 gradients
- Status Colors: Green (accepted), Red (wrong), Yellow (time limit), Orange (error)

### Animations
- Fade-in effects for new content
- Shake animation for errors
- Hover scale effects on cards
- Smooth transitions on all interactive elements

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Troubleshooting

### Authentication Issues
- Ensure Supabase credentials are correct in `.env`
- Check browser console for errors
- Verify email confirmation is disabled in Supabase settings

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `node_modules` and reinstall if issues persist
- Check for TypeScript errors with `npm run typecheck`

### Database Connection
- Verify Supabase project is active
- Check that migrations have been applied
- Ensure RLS policies are properly configured

## Future Enhancements

- Real code execution using sandboxed environments
- More programming language support
- Contest mode with timed challenges
- Premium badges and achievements
- Social features (follow users, share solutions)
- Code comparison and analysis
- AI-powered hints and explanations

## License

This project is a demonstration application for portfolio purposes.

## Support

For issues or questions, please check the documentation or contact the development team.
