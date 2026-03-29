# Golf Charity Platform - Setup Status ✅

## Project Analysis Complete

This is a **MongoDB + Express + React + Node.js (MERN)** full-stack application for golf charity subscriptions with payment processing and draw features.

---

## ✅ Completed Setup

- **Backend dependencies**: All installed and verified
- **Frontend dependencies**: Fixed and reinstalled (removed invalid versions)
- **Frontend `.env`**: Created with API URL and Stripe key placeholders
- **Backend `.env`**: Already configured with MongoDB & JWT

---

## ⚠️ What You Need to Add

### 1. Stripe Keys (Backend `.env` - lines 16-19)
Get from: https://dashboard.stripe.com/

```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
STRIPE_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_ID
STRIPE_YEARLY_PRICE_ID=price_YOUR_YEARLY_ID
```

### 2. Stripe Publishable Key (Frontend `.env` - line 2)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### 3. Gmail SMTP (Backend `.env` - lines 24-25)
```
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password  (get from Google Account settings)
```

---

## 🚀 How to Run

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
# (Configured to call http://localhost:5000/api)
```

---

## 🔧 Database & Admin Setup

MongoDB Atlas connection is already configured in backend/.env

**Create admin user:**
```bash
cd backend
npm run seed
```

Login credentials after seeding:
- Email: admin@golfcharity.com
- Password: Admin@123456

⚠️ **Change these immediately on first login!**

---

## Project Structure

```
golf-charity-platform/
├── backend/          # Express.js API
│   ├── config/       # DB & Stripe config
│   ├── models/       # MongoDB schemas (User, Score, Draw, etc.)
│   ├── routes/       # API endpoints
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth, validation
│   └── utils/        # Email sender, draw engine
│
├── frontend/         # React + Vite
│   └── src/
│       ├── pages/    # Home, Login, Dashboard, Admin, etc.
│       ├── components/
│       ├── context/  # AuthContext
│       └── services/ # Axios API client
```

---

## Features

✅ User signup & JWT authentication  
✅ Monthly/yearly subscriptions (Stripe)  
✅ Golf score entry (5-score rolling history)  
✅ Monthly draw with multiple prize tiers  
✅ Charity selection & contribution tracking  
✅ Admin dashboard (users, draws, charities, winners)  
✅ Winner verification with proof uploads  
✅ Email notifications  
✅ Full responsive UI (React Router, Tailwind)  

---

## Test API Health

Once backend is running:
```bash
curl http://localhost:5000/api/health
```

---

## Troubleshooting

**Port 5000 already in use:**
```bash
# Kill existing process
netstat -ano | find "5000"
taskkill /PID <PID> /F
```

**MongoDB connection error:**
- Verify `MONGO_URI` in backend/.env is correct
- Check MongoDB Atlas cluster is active

**Frontend can't reach API:**
- Ensure backend is running on http://localhost:5000
- Check `VITE_API_URL` in frontend/.env

