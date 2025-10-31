# Kaokai Furniture Frontend

Frontend application for Kaokai Furniture e-commerce website built with React.

## Features

- 🛍️ Product browsing and search
- 🛒 Shopping cart
- 👤 User authentication and profiles
- ❤️ Favorites/Wishlist
- 💳 Payment integration (Stripe)
- 📦 Order management
- 👨‍💼 Admin dashboard
- 📱 Responsive design

## Backend API

This frontend connects to the backend API at:
- **Production**: `https://kaokai-backend.onrender.com`
- **Development**: Can be overridden using `REACT_APP_API_URL` environment variable

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Environment Variables

Create a `.env` file in the root directory for local development:

```
REACT_APP_API_URL=http://localhost:5050
```

For production on Vercel, the backend URL is automatically configured.

## Deployment

This project is configured for deployment on Vercel. 

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect React and build the project
3. The frontend will connect to `https://kaokai-backend.onrender.com` automatically

## Project Structure

```
src/
├── components/      # Reusable components (Header, Footer, etc.)
├── pages/          # Page components
├── config/         # Configuration files (API settings)
└── App.js          # Main app component
```

## License

Copyright © 2025 Kaokai Furniture
