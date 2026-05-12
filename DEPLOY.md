# Deployment Guide — Vercel (Frontend + Backend) + MongoDB Atlas + Cloudinary

This project deploys as **two separate Vercel projects** sharing one GitHub repo:

| Project | Root Directory | Framework |
|---|---|---|
| Frontend | `frontend` | Create React App |
| Backend  | `backend`  | Python (FastAPI on Fluid Compute) |

Storage: **MongoDB Atlas** (data) + **Cloudinary** (uploaded images).

All services have free tiers that comfortably fit this app.

---

## 1. MongoDB Atlas

Already set up — see your existing cluster. Keep the connection string handy.
If you need to start over: https://www.mongodb.com/cloud/atlas/register → create an `M0 FREE` cluster → create a DB user → allow `0.0.0.0/0` in Network Access → copy the connection string.

Required values:
- `MONGO_URL` — `mongodb+srv://USER:PASS@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
- `DB_NAME` — `propiedades_turisticas`

---

## 2. Cloudinary (image uploads)

Vercel's serverless filesystem is read-only, so admin-panel image uploads can't write to disk. Cloudinary stores them externally.

1. Sign up at https://cloudinary.com/users/register/free (free tier: 25 GB storage / 25 GB bandwidth).
2. Go to **Dashboard** → **API Keys** tab.
3. Click the copy icon next to **API Environment variable**. The value looks like:
   ```
   cloudinary://123456789012345:abcDEF-ghiJKL-mnoPQRstu@yourcloudname
   ```
4. Save it — you'll paste it into Vercel as `CLOUDINARY_URL`.

> **Tip:** locally you can omit `CLOUDINARY_URL` from [backend/.env](backend/.env) — uploads will fall back to the on-disk [backend/uploads/](backend/uploads/) folder.

---

## 3. Push the repo to GitHub

If you haven't already:
```powershell
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

---

## 4. Deploy the **backend** on Vercel

1. https://vercel.com/new → import the repo.
2. **Configure project**:
   - **Project Name**: `propiedades-rd-backend` (or anything)
   - **Root Directory**: click **Edit** → select `backend`
   - **Framework Preset**: Other (Vercel auto-detects `vercel.json` + Python)
3. **Environment Variables** → add all five:

   | Key | Value |
   |---|---|
   | `MONGO_URL` | (your Atlas connection string) |
   | `DB_NAME` | `propiedades_turisticas` |
   | `JWT_SECRET` | a long random string (≥ 32 chars) |
   | `CLOUDINARY_URL` | (from step 2) |
   | `CORS_ORIGINS` | `*` for now — you'll restrict it in step 6 |

4. Click **Deploy**.
5. Once deployed, copy the URL (e.g. `https://propiedades-rd-backend.vercel.app`). Verify it works:
   ```
   https://propiedades-rd-backend.vercel.app/api/
   ```
   You should see `{"message":"Propiedades Turísticas RD API"}`.

---

## 5. Deploy the **frontend** on Vercel

1. https://vercel.com/new → import the **same repo** again as a separate project.
2. **Configure project**:
   - **Project Name**: `propiedades-rd` (or anything)
   - **Root Directory**: click **Edit** → select `frontend`
   - **Framework Preset**: Create React App (auto-detected)
3. **Environment Variables**:

   | Key | Value |
   |---|---|
   | `REACT_APP_BACKEND_URL` | The backend URL from step 4 (no trailing slash) |

4. Click **Deploy**.
5. Copy the public URL (e.g. `https://propiedades-rd.vercel.app`).

---

## 6. Lock down CORS

Back to the **backend** project on Vercel:

1. **Settings** → **Environment Variables** → edit `CORS_ORIGINS`:
   ```
   https://propiedades-rd.vercel.app,http://localhost:3000
   ```
   (Add your custom domain too, if you have one.)
2. **Deployments** → click the latest → **Redeploy** so the new env var takes effect.

---

## 7. First-time data setup

The first time the home page loads, the frontend automatically calls `POST /api/seed`, which idempotently inserts 6 sample properties and 8 locations.

To create the default admin user, hit:
```
https://propiedades-rd-backend.vercel.app/api/auth/setup
```
(POST request — easiest via the FastAPI docs at `https://propiedades-rd-backend.vercel.app/docs`)

Default credentials: `admin` / `admin123` — **change them immediately** from the admin panel.

---

## 8. Custom domain (optional)

Frontend project → **Settings** → **Domains** → add your domain. Vercel handles SSL automatically.

Don't forget to add the new domain to `CORS_ORIGINS` on the backend.

---

## Env-var cheat sheet

### Backend
| Variable | Required | Notes |
|---|---|---|
| `MONGO_URL` | ✅ | Atlas connection string with `retryWrites=true&w=majority` |
| `DB_NAME` | ✅ | `propiedades_turisticas` |
| `JWT_SECRET` | ✅ | ≥ 32 random chars |
| `CLOUDINARY_URL` | ✅ on Vercel | Falls back to disk locally if unset |
| `CORS_ORIGINS` | ✅ | Comma-separated origin list |

### Frontend
| Variable | Required | Notes |
|---|---|---|
| `REACT_APP_BACKEND_URL` | ✅ | Backend Vercel URL, no trailing slash |

---

## Notes & caveats

- **Existing local uploads** ([backend/uploads/](backend/uploads/), 65 files) are excluded from the Vercel deploy via [backend/.vercelignore](backend/.vercelignore). Any property/agency-settings doc in MongoDB that references `/api/uploads/<file>` will 404 in production. The seeded sample data uses Unsplash URLs, so the demo works out of the box. Re-upload your own assets through the admin panel to push them to Cloudinary.
- **Cold starts**: Vercel Hobby plan scales to zero; the first request after idle adds ~1–3 s. Fluid Compute keeps subsequent requests warm.
- **Function size**: [backend/requirements.txt](backend/requirements.txt) was slimmed from 124 packages → 10 to fit Vercel's 250 MB limit. If you re-add heavy deps (pandas, boto3, etc.) check the deploy log for size warnings.
- **Logs**: Vercel dashboard → Project → **Logs** tab. Watch this on first deploy to catch any env-var or Mongo connection issues.
