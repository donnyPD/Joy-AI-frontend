# Joy AI

React + TypeScript + Vite frontend application for Joy AI backend integration.

## Features

- ✅ React 19 with TypeScript
- ✅ Vite for fast development
- ✅ Tailwind CSS for styling
- ✅ ESLint for code quality
- ✅ React Router for navigation
- ✅ React Query for data fetching
- ✅ Axios for API calls
- ✅ Sign Up / Sign In flow
- ✅ Jobber OAuth integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
src/
  ├── pages/          # Page components
  │   ├── auth/       # Authentication pages
  │   └── Dashboard.tsx
  ├── services/       # API services
  ├── hooks/          # Custom React hooks
  └── App.tsx         # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

The frontend connects to the NestJS backend running on `http://localhost:3000` by default.

Make sure the backend is running before starting the frontend.
