# C3 Platform — Tech Stack Notes

## Frontend

| Tech | Why used | Cost |
|---|---|---|
| **React + Vite** | Fast dev server, instant HMR, already comfortable with it from HMS | Free forever — open source |
| **Tailwind v4** | Utility-first, fast to style, already debugged v3/v4 config issues once | Free forever — open source |
| **React Router v6** | Client-side routing, role-based protected routes | Free forever — open source |
| **Axios** | Cleaner API calls than fetch, interceptors for auth token | Free forever — open source |
| **Context API** | Built into React, no need for Redux at this scale | Free — part of React |

**Verdict:** Zero cost, zero risk of pricing changes. These are all open-source libraries you self-host as static files.

---

## Backend

| Tech | Why used | Cost |
|---|---|---|
| **Node.js + Express** | Familiar from HMS backend build, huge ecosystem, simple REST API | Free forever — open source |
| **MongoDB Atlas** | Already know the setup (cluster, IP whitelist, Mongoose connection) | **Free tier: M0 cluster, 512MB storage, forever free** — no card required. Only costs money if you upgrade to M2+ for more storage/performance, which a college club will never need |
| **Mongoose** | ODM for MongoDB, schema validation, cleaner queries | Free forever — open source |
| **JWT (jsonwebtoken)** | Stateless auth tokens for login sessions | Free forever — open source |
| **bcrypt** | Password hashing | Free forever — open source |

**Verdict:** MongoDB Atlas free tier (M0) has no expiry and no card requirement. 512MB is genuinely a lot for text data like sessions/attendance/events — you'd need thousands of records before it's a concern.

---

## Image Handling (new piece for this project)

| Tech | Why used | Cost |
|---|---|---|
| **Multer** | Handles multipart form-data (the file) before sending onward | Free forever — open source |
| **Cloudinary** | Stores + serves event cover images, gives you a URL back, no server disk management | **Free tier: 25GB storage + 25GB bandwidth/month, forever free** — no card required. Auto-optimizes images too |

**Why Cloudinary over just storing files on your own server:**
- Render's free tier has an *ephemeral filesystem* — meaning uploaded files get wiped on every redeploy or restart. If you used `multer` alone to save to disk, your event images would randomly vanish. Cloudinary avoids that entirely.
- 25GB is enormous for a club — even hundreds of event cover images (a few MB each) won't come close.

**Verdict:** Free tier is genuinely sufficient long-term for a college club's scale, not a "free trial that runs out."

---

## Deployment

| Tech | Why used | Cost |
|---|---|---|
| **Render (backend)** | Already using it for IARRD event sites, free web service tier | **Free tier**: sleeps after 15 min inactivity, wakes on next request (~30-50s cold start). No cost, no card needed |
| **Vercel or Netlify (frontend)** | Static site hosting, auto-deploys from GitHub | **Free tier**: generous bandwidth, no card needed, no realistic way a club site hits the limit |

**The only real "cost" here isn't money — it's the cold-start delay** on Render's free backend (first request after inactivity takes ~30-50 seconds). Not a dealbreaker for a club platform used a few times a day, but worth knowing so it doesn't confuse you or members later ("why is it slow the first time").

---

## Later / Optional (Phase 5+)

| Tech | Why used | Cost |
|---|---|---|
| **Recharts** | Attendance trend charts, analytics dashboard | Free forever — open source, just an npm package |

---

## Summary — Nothing in this stack has a hidden bill

Every single piece here is either:
1. **Open source and self-hosted** (React, Express, Mongoose, etc.) — literally cannot charge you, ever.
2. **A free tier from a company, but one designed to stay free at hobby/small-org scale** (MongoDB Atlas M0, Cloudinary free, Render free, Vercel free) — none of these require a credit card to sign up, which is your safety net. If a card isn't on file, nothing can auto-charge you even if you somehow exceeded a limit — the service just pauses or throttles, it won't silently bill you.

**One thing worth doing regardless:** when you sign up for Atlas/Cloudinary/Render, use a personal or club email (not a shared one), and don't add a payment method unless you deliberately decide to scale up later. That way there's zero chance of an accidental charge.
