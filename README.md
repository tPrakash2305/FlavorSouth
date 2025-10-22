# FlavorSouth 🍛

A modern food ordering platform for authentic South Indian cuisine. Order delicious idli, dosa, vada, and more with seamless payment integration and real-time order management.

## ✨ Features

- 🔐 **Phone Authentication** - OTP-based login via Twilio
- 🛒 **Shopping Cart** - Add items, manage quantities with localStorage persistence
- 💳 **Stripe Payments** - Secure payment processing
- 📦 **Order Management** - Track order status in real-time
- 👨‍💼 **Staff Dashboard** - Admin interface for managing orders
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Built with shadcn/ui components

## 🛠️ Tech Stack

- **Framework:** SvelteKit 5
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Better Auth with Twilio
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Deployment:** Vercel

## 🚀 Getting Started

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

Visit `http://localhost:5173` to see the app! 🎉

## 📱 Usage

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

## 📂 Project Structure

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

## 🔒 Environment Variables

All required environment variables are documented in `.env.example`. Make sure to:
- Never commit `.env` to version control
- Use strong secrets for production
- Update `PUBLIC_BETTER_AUTH_URL` for production deployment

## 🚢 Deployment

This project is configured for Vercel deployment:

```bash
npm run build
```

Make sure to set all environment variables in your Vercel project settings.

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ for South Indian food lovers
