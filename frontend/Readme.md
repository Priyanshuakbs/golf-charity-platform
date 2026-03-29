# Golf Charity Subscription Platform

A subscription-driven web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine. Built with the MERN stack.

---

## Tech Stack

**Frontend:** React, Tailwind CSS, Axios, React Router v6  
**Backend:** Node.js, Express.js, MongoDB (Mongoose)  
**Payments:** Stripe  
**Deployment:** Vercel (frontend + backend), MongoDB Atlas (database)

---

## Project Structure

```
golf-charity-platform/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── stripe.js              # Stripe initialisation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── scoreController.js
│   │   ├── drawController.js
│   │   ├── charityController.js
│   │   ├── paymentController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + adminOnly
│   │   ├── subscription.js        # Active subscription gate
│   │   └── upload.js              # Multer proof upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Score.js
│   │   ├── Charity.js
│   │   ├── Draw.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── scores.js
│   │   ├── draws.js
│   │   ├── charities.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── sendEmail.js           # Nodemailer email utility
│   │   ├── seedAdmin.js           # Seed first admin user
│   │   ├── prizePool.js           # Prize pool calculations
│   │   └── drawEngine.js          # Draw algorithm (random + weighted)
│   ├── uploads/                   # Winner proof images (gitignored)
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ScoreCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Subscribe.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ScoreEntry.jsx
│   │   │   ├── Charities.jsx
│   │   │   ├── CharityDetail.jsx
│   │   │   ├── DrawResults.jsx
│   │   │   ├── MyWins.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       ├── AdminDraws.jsx
│   │   │       ├── AdminCharities.jsx
│   │   │       ├── AdminWinners.jsx
│   │   │       └── AdminReports.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios instance
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
├── .gitignore
├── vercel.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Stripe account (test mode)
- Gmail account (for email notifications)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/golf-charity-platform.git
cd golf-charity-platform
```

---

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env` file with real values (MongoDB URI, Stripe keys, JWT secret, email credentials).

**Seed the admin user:**
```bash
npm run seed
```

**Start the backend dev server:**
```bash
npm run dev
# Runs on http://localhost:5000
```

---

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Fill in `REACT_APP_API_URL` and `REACT_APP_STRIPE_PUBLISHABLE_KEY`.

**Start the frontend dev server:**
```bash
npm start
# Runs on http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRE` | JWT expiry e.g. `30d` |
| `CLIENT_URL` | Frontend URL for CORS |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_MONTHLY_PRICE_ID` | Monthly plan Price ID from Stripe |
| `STRIPE_YEARLY_PRICE_ID` | Yearly plan Price ID from Stripe |
| `EMAIL_HOST` | SMTP host e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port e.g. `587` |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password / app password |
| `PRIZE_POOL_PERCENTAGE` | Fraction of subscription into prize pool (e.g. `0.60`) |
| `CHARITY_MIN_PERCENTAGE` | Minimum charity contribution (e.g. `0.10`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Scores (requires auth + subscription)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/scores` | Get my last 5 scores |
| POST | `/api/scores` | Add a new score |
| PUT | `/api/scores/:id` | Edit a score |
| DELETE | `/api/scores/:id` | Delete a score |

### Draws
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/draws` | List all published draws |
| GET | `/api/draws/latest` | Get latest draw result |
| GET | `/api/draws/:id` | Get draw by ID |
| POST | `/api/draws/simulate` | Admin: simulate draw |
| POST | `/api/draws/run` | Admin: run official draw |
| PUT | `/api/draws/:id/publish` | Admin: publish draw result |

### Charities
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/charities` | List all charities |
| GET | `/api/charities/featured` | Featured charities |
| GET | `/api/charities/:id` | Charity detail |
| POST | `/api/charities` | Admin: create charity |
| PUT | `/api/charities/:id` | Admin: update charity |
| DELETE | `/api/charities/:id` | Admin: delete charity |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments/plans` | Get subscription plans |
| POST | `/api/payments/create-checkout-session` | Start Stripe checkout |
| GET | `/api/payments/subscription-status` | Check subscription |
| POST | `/api/payments/cancel-subscription` | Cancel subscription |
| POST | `/api/payments/webhook` | Stripe webhook handler |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id` | Edit user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/winners` | All winners |
| PUT | `/api/admin/winners/:id/verify` | Verify winner proof |
| PUT | `/api/admin/winners/:id/paid` | Mark winner paid |
| GET | `/api/admin/reports` | Analytics report |

---

## Key Features

### Score System
- Users enter Stableford scores (1–45)
- Only the latest 5 scores are kept — new score replaces the oldest
- Each score must have a date

### Draw Engine
- Three draw modes: random, weighted by most frequent scores, weighted by least frequent
- Match tiers: 5-match (jackpot), 4-match, 3-match
- Prize split: 40% / 35% / 25%
- Jackpot rolls over if no 5-match winner
- Admin can simulate before publishing

### Prize Pool
- 60% of each subscription goes to the prize pool (configurable)
- Auto-calculated based on active subscriber count
- Multiple winners in the same tier split the prize equally

### Charity System
- Users select a charity at signup
- Minimum 10% of subscription donated
- Users can voluntarily increase their charity %

### Winner Verification
- Winners upload screenshot proof
- Admin reviews and approves/rejects
- Payment tracked: Pending → Paid

---

## Deployment (Vercel)

### Backend
1. Create a new Vercel project, import the repo
2. Set root directory to `backend`
3. Add all environment variables from `.env.example`
4. Deploy

### Frontend
1. Create another Vercel project, import the same repo
2. Set root directory to `frontend`
3. Set `REACT_APP_API_URL` to your deployed backend URL
4. Deploy

> Use **new** Vercel accounts and a **new** Supabase/MongoDB Atlas project as required by the PRD.

---

## Testing Checklist

- [ ] User signup & login
- [ ] Subscription flow (monthly and yearly)
- [ ] Score entry — 5-score rolling logic
- [ ] Draw system logic and simulation
- [ ] Charity selection and contribution calculation
- [ ] Winner verification flow and payout tracking
- [ ] User Dashboard — all modules functional
- [ ] Admin Panel — full control and usability
- [ ] Data accuracy across all modules
- [ ] Responsive design on mobile and desktop
- [ ] Error handling and edge cases

---

## Default Admin Credentials

After running `npm run seed`:

```
Email:    admin@golfcharity.com
Password: Admin@123456
```

> Change these immediately after first login in production.

---

Built for Digital Heroes — Full-Stack Development Trainee Selection Process.