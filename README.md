# FlavorSouth

[![CI](https://github.com/tPrakash2305/FlavorSouth/actions/workflows/ci.yml/badge.svg)](https://github.com/tPrakash2305/FlavorSouth/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Svelte](https://img.shields.io/badge/Svelte-5.0-orange.svg)](https://svelte.dev/)

A modern food ordering platform for authentic South Indian cuisine. Order delicious idli, dosa, vada, and more with seamless payment integration and real-time order management.

## Live Demo

**[View Live Application](https://flavor-south.vercel.app)**

> Deployed on Vercel with automatic deployments from GitHub.

## Screenshots

<details>
<summary>Click to view screenshots</summary>

### Homepage

![Homepage](docs/screenshots/homepage.png)
_Modern landing page with menu preview_

### Shopping Cart

![Cart](docs/screenshots/cart.png)
_Intuitive cart with quantity management_

### Checkout & Payment

![Checkout](docs/screenshots/checkout.png)
_Secure Stripe payment integration_

### Staff Dashboard

![Dashboard](docs/screenshots/dashboard.png)
_Admin panel for order management_

### Mobile Responsive

![Mobile](docs/screenshots/mobile.png)
_Fully responsive on all devices_

</details>

> **TODO:** Add screenshots to `docs/screenshots/` folder after capturing your app.

## Features

- **Phone Authentication** - OTP-based login via Twilio
- **Shopping Cart** - Add items, manage quantities with localStorage persistence
- **Stripe Payments** - Secure payment processing
- **Order Management** - Track order status in real-time
- **Staff Dashboard** - Admin interface for managing orders
- **Responsive Design** - Works on all devices
- **Modern UI** - Built with shadcn/ui components

## Tech Stack

- **Framework:** SvelteKit 5
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Better Auth with Twilio
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Twilio account (for SMS OTP)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/tPrakash2305/FlavorSouth.git
cd FlavorSouth
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory (use `.env.example` as reference):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flavorsouth"

# Stripe Payment
STRIPE_SECRET_KEY="sk_test_..."
PUBLIC_STRIPE_KEY="pk_test_..."

# Twilio SMS
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_VERIFY_SERVICE_SID="..."

# Better Auth
PUBLIC_BETTER_AUTH_URL="http://localhost:5173"
BETTER_AUTH_SECRET="your_random_secret"
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app!

## Testing

Run the test suite:

```bash
npm test              # Run tests in watch mode
npm run test:ui       # Open Vitest UI for interactive testing
npm run test:run      # Run tests once (CI mode)
npm run test:coverage # Run tests with coverage report
```

**Current Test Coverage:** 8 tests across cart utilities

## Usage

### For Customers:

1. Visit the homepage and click "View Menu"
2. Sign in with your phone number (OTP verification)
3. Browse menu items and add to cart
4. Checkout and complete payment via Stripe
5. Track your order status in the dashboard

### For Staff:

1. Navigate to `/staff-dashboard`
2. View all orders
3. Filter by status (Pending, Completed, Cancelled)
4. Update order status

## Project Structure

```
FlavorSouth/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── lib/
│   │   ├── components/ui/     # shadcn/ui components
│   │   ├── services/          # Business logic
│   │   ├── stores/            # Svelte stores
│   │   ├── auth.ts            # Authentication setup
│   │   └── prisma.ts          # Database client
│   ├── routes/
│   │   ├── api/               # API endpoints
│   │   ├── auth/              # Auth pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Payment flow
│   │   ├── dashboard/         # User dashboard
│   │   └── staff-dashboard/   # Admin panel
│   └── app.html               # HTML template
├── static/                     # Static assets
└── package.json
```

## Deployment

This project is optimized for **Vercel** deployment with zero configuration:

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard (all variables from `.env.example`)
3. **Deploy automatically** on every push to main

```bash
# Or deploy manually
npm run build
npx vercel --prod
```

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

- `DATABASE_URL` - Your PostgreSQL connection string
- `STRIPE_SECRET_KEY` & `PUBLIC_STRIPE_KEY` - Stripe API keys
- `TWILIO_*` - Twilio credentials for SMS verification
- `BETTER_AUTH_SECRET` - Strong random secret (use `openssl rand -base64 32`)
- `PUBLIC_BETTER_AUTH_URL` - Your production URL

## Code Quality

- ✅ **TypeScript** for type safety
- ✅ **ESLint + Prettier** for code formatting
- ✅ **Automated CI/CD** via GitHub Actions
- ✅ **Unit Tests** with Vitest
- ✅ **Prisma ORM** for database type safety

## Security Features

- **Phone-based OTP authentication** via Twilio
- **Session management** with Better Auth
- **PCI-compliant payment processing** (Stripe)
- **Environment variables** for sensitive data
- **CSRF protection** via SvelteKit
- **No passwords stored** (phone auth only)

## Performance

- Server-side rendering with SvelteKit
- Optimized builds with Vite
- Code splitting and lazy loading
- Tailwind CSS for minimal bundle size
- Efficient database queries with Prisma

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/tPrakash2305/FlavorSouth/issues).

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linting (`npm run lint`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request
