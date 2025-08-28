# Portfolio Management Dashboard

A modern web application for managing investment portfolios with user authentication, real-time portfolio tracking, transaction history, and investment management capabilities.

## Features

### 1. User Authentication
- JWT-based authentication via Supabase
- Secure login/logout functionality
- User registration with email confirmation
- Protected routes and session management

### 2. Portfolio Overview
- Real-time portfolio dashboard
- Summary of total portfolio value and performance
- Asset breakdown by type (stocks, bonds, mutual funds, ETFs, crypto)
- Gain/loss calculations with percentage changes
- Visual performance indicators

### 3. Investment Management
- Add new investments with detailed information
- Edit existing investments (quantity, current price)
- Delete investments with confirmation
- Support for multiple asset types
- Real-time value calculations

### 4. Transaction History
- Complete transaction log (buy/sell operations)
- Chronological transaction display
- Transaction details including quantity, price, and total value
- Visual transaction type indicators

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router** for navigation
- **React Hook Form** for form management
- **Lucide React** for icons

### Backend
- **Supabase** for backend services
- **PostgreSQL** database
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** capability

### Infrastructure
- **Docker** containerization
- **Nginx** web server
- **Multi-stage Docker builds** for optimization

## Database Schema

### Tables
- `profiles` - User profile information
- `portfolios` - User investment portfolios
- `investments` - Individual investment holdings
- `transactions` - Investment transaction history

### Security
- Row Level Security (RLS) enabled on all tables
- User-scoped data access policies
- Automatic profile and portfolio creation on signup

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Supabase account

### Environment Setup
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Configure your Supabase credentials:
   ```
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   VITE_SUPABASE_URL=your_project_url
   ```

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Docker Deployment

#### Using Docker
```bash
# Build the image
docker build -t portfolio-manager .

# Run the container
docker run -p 3000:80 portfolio-manager
```

#### Using Docker Compose
```bash
# Start the application
docker-compose up -d

# With reverse proxy (optional)
docker-compose --profile proxy up -d

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`

### Production Deployment

#### Docker Image
The Dockerfile uses a multi-stage build process:
1. **Builder stage**: Installs dependencies and builds the React app
2. **Production stage**: Serves the built app with Nginx

#### Features
- Optimized production build
- Nginx with gzip compression
- Security headers
- Health checks
- Single-page application routing support

## API Integration

The application connects to Supabase for all backend operations:
- Authentication via Supabase Auth
- Data persistence via Supabase Database
- Real-time updates via Supabase Realtime (future enhancement)

## Security Features

- JWT token-based authentication
- Row Level Security (RLS) policies
- User data isolation
- Secure API endpoints
- Input validation and sanitization

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── AddInvestmentDialog.tsx
│   ├── InvestmentsList.tsx
│   └── TransactionHistory.tsx
├── hooks/              # Custom React hooks
│   └── useAuth.tsx     # Authentication hook
├── pages/              # Application pages
│   ├── Index.tsx       # Landing page
│   ├── Auth.tsx        # Login/Register
│   ├── Dashboard.tsx   # Main dashboard
│   └── NotFound.tsx    # 404 page
├── integrations/       # External service integrations
│   └── supabase/       # Supabase configuration
└── lib/                # Utility functions
```

## Git Workflow

This project follows standard Git practices:
- Feature branches for new functionality
- Descriptive commit messages
- Regular commits showcasing development progress
- Merge requests for code review

---

## Lovable Project Info

**URL**: https://lovable.dev/projects/923e3b56-5eeb-46b3-863f-af6e8fe45e81

### How can I edit this code?

**Use Lovable**: Simply visit the [Lovable Project](https://lovable.dev/projects/923e3b56-5eeb-46b3-863f-af6e8fe45e81) and start prompting.

**Use your preferred IDE**: Clone this repo and push changes. You'll need Node.js & npm installed.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

### Deployment

Deploy via [Lovable](https://lovable.dev/projects/923e3b56-5eeb-46b3-863f-af6e8fe45e81) by clicking Share -> Publish, or use the provided Docker setup.
