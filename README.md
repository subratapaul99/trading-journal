# TradeLog — MERN Trading Journal

A full-stack trading journal to log trades, identify mistakes, track performance, and get AI-powered insights.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Zustand, React Hook Form |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer + Cloudinary |
| AI Insights | Claude API (claude-sonnet-4-6) |

---

## Quick Start

### Option A — Manual

```bash
# Install all deps
npm run install:all

# Copy and fill env
cp server/.env.example server/.env

# Seed demo data
cd server && node src/utils/seed.js && cd ..

# Run both frontend + backend
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

### Option B — Docker (MongoDB only)

```bash
docker-compose up mongo -d
npm run install:all
npm run dev
```

---

## server/.env

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/trading-journal
JWT_SECRET=your_secret_32chars_min
JWT_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
CLIENT_URL=http://localhost:5173
```

---

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/trades` | List trades (filterable + paginated) |
| POST | `/api/trades` | Create trade |
| GET | `/api/trades/:id` | Single trade |
| PUT | `/api/trades/:id` | Update trade |
| DELETE | `/api/trades/:id` | Delete trade |
| POST | `/api/trades/:id/screenshots` | Upload screenshot |
| GET | `/api/analytics/summary` | KPIs |
| GET | `/api/analytics/equity-curve` | Equity data |
| GET | `/api/analytics/mistakes` | Mistake frequency |
| GET | `/api/analytics/calendar` | Daily P&L map |
| POST | `/api/journal` | Create journal entry |
| GET | `/api/journal` | List entries |
| PUT | `/api/journal/:id` | Update entry |
| DELETE | `/api/journal/:id` | Delete entry |
| POST | `/api/ai/analyze` | Claude insights |

All analytics routes support `?range=1W|1M|3M|6M|All`

---

## Demo Seed

```bash
cd server && node src/utils/seed.js
# Login: demo@tradelog.io / password123
# Generates ~130 trades over 90 days + 30 journal entries
```

---

## Deployment

- **Frontend** → Vercel (`npm run build`, deploy `dist/`)
- **Backend** → Railway or Render (`node src/index.js`)
- **Database** → MongoDB Atlas (`MONGO_URI=mongodb+srv://...`)
test 
