# Confidant

A modern web application for child development and family engagement, built with React and Cloudflare.

## 🚀 Tech Stack

- **Frontend**: React + Vite
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2
- **Authentication**: Google/Apple OAuth
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Form Handling**: React Hook Form + Zod
- **UI Components**: shadcn/ui

## 🛠️ Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
confidant/
├── src/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific components and logic
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Page components
│   ├── providers/     # Context providers
│   ├── styles/        # Global styles
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
└── worker/           # Cloudflare Worker backend
```

## 🔐 Environment Variables

Required environment variables:

```env
VITE_CLOUDFLARE_ACCOUNT_ID=
VITE_CLOUDFLARE_API_TOKEN=
VITE_GOOGLE_CLIENT_ID=
VITE_APPLE_CLIENT_ID=
VITE_STRIPE_PUBLISHABLE_KEY=
```

## 📝 License

MIT