# SkillSync Frontend

This is the frontend application for SkillSync, built with Next.js, React, TypeScript, and TailwindCSS.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/              # Next.js app directory (pages and layouts)
├── components/       # React components
│   ├── common/      # Reusable UI components
│   ├── features/    # Feature-specific components
│   └── providers/   # Context providers
├── lib/             # Utility functions and configurations
│   ├── api/         # API client and services
│   └── utils/       # Helper functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── styles/          # Global styles and theme

```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
