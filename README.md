# 🚀 Ajira AI Admin Portal

<div align="center">

**A comprehensive admin dashboard for managing the Ajira AI job platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.84-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **Ajira AI Admin Portal** is a powerful, feature-rich administrative dashboard designed to manage all aspects of the Ajira AI job platform. Built with modern web technologies, it provides administrators with comprehensive tools to monitor, manage, and optimize the platform's operations.

### Key Highlights

- 📊 **Real-time Analytics** - Comprehensive dashboards with growth metrics and insights
- 👥 **User Management** - Manage job seekers, companies, and admin accounts
- 💼 **Job Management** - Approve, reject, and feature job postings
- 💰 **Financial Management** - Track earnings, credits, subscriptions, and referrals
- 🤖 **AI Features** - Monitor AI chat interactions and resume generation
- 🔔 **Notifications** - Send and manage platform-wide notifications
- ⚙️ **Settings** - Configure platform settings, admins, and activity logs

---

## ✨ Features

### 📊 Dashboard & Analytics
- **Overview Dashboard** - Real-time metrics and KPIs
- **User Analytics** - Track user growth, engagement, and activity
- **Job Analytics** - Monitor job postings, applications, and trends
- **Financial Analytics** - Revenue tracking, earnings, and financial insights
- **AI Chat Analytics** - Monitor AI assistant usage and performance
- **Application Analytics** - Track application statuses and trends
- **Interview Analytics** - Monitor interview scheduling and completion

### 👥 User Management
- **Job Seekers** - View, manage, and block user accounts
- **Companies** - Manage company profiles, verification, and subscriptions
- **Admin Accounts** - Create and manage admin users with role-based access

### 💼 Job Management
- **Job Listings** - View all job postings
- **Pending Jobs** - Review and approve/reject job submissions
- **Featured Jobs** - Promote jobs to featured status
- **Job Categories** - Manage job categories and classifications

### 💰 Financial Management
- **Earnings** - Track platform revenue and earnings
- **Credits** - Monitor credit transactions and balances
- **Subscriptions** - Manage company subscription plans
- **Referrals** - Track referral programs and rewards
- **Transactions** - View all financial transactions

### 🤖 AI Features
- **AI Chat** - Monitor AI assistant conversations and analytics
- **Resume Generation** - Track AI-powered resume generation

### 🔔 Notifications
- **Send Notifications** - Broadcast messages to users
- **Notification Analytics** - Track notification delivery and engagement
- **Notification History** - View all sent notifications

### 📝 Content Management
- **Categories** - Manage job categories
- **Locations** - Manage location data
- **Skills** - Manage skill tags and categories

### ⚙️ Settings & Configuration
- **General Settings** - Platform-wide configuration
- **Admin Settings** - Manage admin accounts and permissions
- **Activity Logs** - Track all administrative actions
- **Platform Settings** - Configure features and limits

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Tremor** - Analytics dashboard components
- **Recharts** - Data visualization library
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service (Database, Auth, Storage)
- **Firebase Admin SDK** - Server-side Firebase operations

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Deployment
- **Docker** - Containerization
- **Coolify** - Self-hosted deployment platform
- **GitHub Actions** - CI/CD workflows

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **pnpm** (recommended) or npm/yarn
- **Git**
- **Docker** (for containerized deployment)
- **Supabase Account** - For database and backend services
- **Firebase Project** - For admin SDK operations

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kefamgaya/Admin-panel-AjiraAi.git
cd admin-portal
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Copy the environment template and fill in your values:

```bash
cp env.local.template .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# AdMob Configuration (if applicable)
ADMOB_APP_ID=your_admob_app_id
ADMOB_PUBLISHER_ID=your_admob_publisher_id
```

### 4. Run Database Migrations

Ensure your Supabase database is set up with the required schema:

```bash
# Migrations are located in supabase/migrations/
# Apply them through Supabase dashboard or CLI
```

### 5. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will be available at [http://localhost:3003](http://localhost:3003)

### 6. Access Admin Portal

Navigate to `/admin/login` to access the admin login page.

---

## 📁 Project Structure

```
admin-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── users/          # User management
│   │   │   ├── jobs/           # Job management
│   │   │   ├── analytics/      # Analytics pages
│   │   │   ├── finance/        # Financial management
│   │   │   ├── settings/       # Settings pages
│   │   │   └── ...
│   │   ├── api/                # API routes
│   │   ├── actions/            # Server actions
│   │   └── page.tsx            # Root page (redirects to dashboard)
│   ├── components/             # React components
│   │   ├── admin/              # Admin-specific components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Utility libraries
│   ├── utils/                  # Helper utilities
│   └── middleware.ts           # Next.js middleware
├── supabase/
│   └── migrations/             # Database migrations
├── public/                     # Static assets
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose configuration
├── coolify.yml                 # Coolify deployment config
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.ts              # Next.js configuration
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret!) |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase private key (keep secret!) |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3003` |
| `ADMOB_APP_ID` | AdMob application ID | - |
| `ADMOB_PUBLISHER_ID` | AdMob publisher ID | - |

> ⚠️ **Security Note**: Never commit `.env.local` or `.env.production` to version control!

---

## 💻 Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Development Guidelines

1. **Code Style**: Follow the existing code style and use TypeScript
2. **Components**: Use functional components with TypeScript
3. **Styling**: Use Tailwind CSS utility classes
4. **State Management**: Use React hooks and server components
5. **API Calls**: Use server actions for data mutations
6. **Error Handling**: Implement proper error boundaries and handling

---

## 🚢 Deployment

### Docker Deployment

#### Build Docker Image

```bash
docker build -t ajira-admin-portal .
```

#### Run Container

```bash
docker run -d \
  -p 3003:3003 \
  --env-file .env.production \
  --name ajira-admin-portal \
  ajira-admin-portal
```

### Docker Compose

```bash
docker-compose up -d --build
```

### Coolify Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed Coolify deployment instructions.

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

---

## 📚 API Documentation

### Server Actions

The application uses Next.js Server Actions for data operations:

- **User Management**: `src/app/actions/user-management.ts`
- **Job Management**: `src/app/actions/job-management.ts`
- **Analytics**: `src/app/actions/*-analytics.ts`
- **Settings**: `src/app/actions/settings.ts`

### API Routes

RESTful API routes are available under `/api/admin/`:

- `/api/admin/jobs/[id]/approve` - Approve job posting
- `/api/admin/jobs/[id]/reject` - Reject job posting
- `/api/admin/jobs/[id]/feature` - Feature/unfeature job
- `/api/admin/notifications/send` - Send notification
- `/api/admin/settings/*` - Settings management

---

## 🎨 UI Components

The project uses a combination of:

- **Radix UI** - Accessible, unstyled components
- **Custom Components** - Built on top of Radix UI
- **Tremor** - Analytics and dashboard components
- **Tailwind CSS** - Utility-first styling

### Component Structure

```
components/
├── ui/              # Base UI components (Button, Card, Input, etc.)
├── admin/           # Admin-specific components
│   ├── layout/      # Layout components (Sidebar, TopBar, etc.)
│   ├── dashboard/   # Dashboard components
│   ├── users/       # User management components
│   └── ...
```

---

## 🔒 Security

- **Authentication**: Supabase Auth with admin role verification
- **Authorization**: Role-based access control (RBAC)
- **Environment Variables**: Sensitive data stored in environment variables
- **API Security**: Server-side validation and authentication
- **CORS**: Configured for secure cross-origin requests

---

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Run tests in watch mode
pnpm test:watch
```

---

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🆘 Support

For support and questions:

- **Issues**: Open an issue on GitHub
- **Documentation**: Check the [DEPLOY.md](./DEPLOY.md) for deployment help
- **Email**: Contact the development team

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tremor](https://www.tremor.so/) - Analytics components

---

<div align="center">

**Built with ❤️ for Ajira AI**

[⬆ Back to Top](#-ajira-ai-admin-portal)

</div>
