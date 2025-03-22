# Confidant Frontend

The frontend application for Confidant, a platform that helps parents and children communicate better, track progress, and celebrate achievements together.

## Features

- Modern, responsive UI built with React and Tailwind CSS
- Authentication with email/password and Google OAuth
- Dashboard for tracking children's challenges and progress
- Journal entries for documenting achievements
- Profile management and subscription settings

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router
- Headless UI
- Heroicons

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd src/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── assets/        # Static assets
└── styles/        # Global styles and Tailwind CSS
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 