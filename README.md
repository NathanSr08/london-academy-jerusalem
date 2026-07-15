# London Academy Jerusalem — Web Platform

Full-stack platform for a boutique English & Mathematics tutoring agency (ages 4–10).
Built with **Next.js (App Router)**, **MongoDB / Mongoose**, **Tailwind CSS**, JWT auth
(bcrypt + `jose`), and packaged for **Docker + Traefik**.

## Modules

| Portal | Route | Who |
|---|---|---|
| Public landing + multi-step quote form | `/` | Parents |
| Teacher application | `/apply` | Prospective tutors |
| Login | `/login` | Teachers & Admin |
| Teacher portal (dashboard, calendar, students, earnings) | `/teacher` | Tutors (`tutor`) |
| Super-Admin portal (dashboard, leads, teachers, matchmaking) | `/admin` | Rachel (`admin`) |

## 1. Quick start (Docker + Traefik) — production

Prerequisites: a running Traefik with an external Docker network named `admin_default`
and a cert resolver named `myresolver` (as in your existing setup).

```bash
cp .env.example .env
#   -> edit JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD (and SMTP_* if you want alerts)

docker compose up -d --build
```

That's it. The app is served at **https://budget.aws.uned.live** through Traefik
(container port 3000). On first boot the Super-Admin account is created automatically
from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Optional demo data (a demo teacher + a demo lead):

```bash
docker compose exec web node scripts/seed.mjs
# demo teacher login: teacher@londonacademy.co.il / Teacher123!
```

## 2. Local development

```bash
cp .env.example .env      # set MONGODB_URI=mongodb://localhost:27017/london_academy
npm install
# start a local MongoDB (or: docker run -p 27017:27017 mongo)
npm run dev               # http://localhost:3000
```

## 3. Architecture

```
london-academy-jerusalem/
├── Dockerfile                 # multi-stage, Next.js standalone, non-root
├── docker-compose.yml         # web + mongo, Traefik labels
├── .env.example
├── scripts/seed.mjs           # optional demo data
└── src/
    ├── middleware.js          # Edge JWT guard for /admin & /teacher (+ their APIs)
    ├── lib/
    │   ├── db.js              # cached Mongoose connection + auto Super-Admin bootstrap
    │   ├── auth.js            # bcrypt hashing + JWT (jose) sign/verify + cookie opts
    │   ├── apiAuth.js         # role guard for route handlers
    │   ├── session.js         # server-component auth helpers (requireRole)
    │   ├── pricing.js         # ★ Pricing Matrix & commission logic
    │   ├── constants.js       # shared UI constants + formatters
    │   └── mailer.js          # NodeMailer alerts (no-op if SMTP unset)
    ├── models/                # Mongoose: User, TeacherProfile, Lead, ClassSession
    ├── components/            # QuoteForm, PortalShell, LogoutButton
    └── app/
        ├── page.js            # landing + pricing + quote form
        ├── login/ apply/      # auth + teacher sign-up
        ├── admin/             # Super-Admin portal
        ├── teacher/           # Teacher portal
        └── api/               # all REST endpoints
```

## 4. Security

- Passwords hashed with **bcrypt** (cost 12).
- Auth via **JWT** stored in an **httpOnly, SameSite=Lax, Secure** cookie.
- **Edge middleware** enforces role separation (`admin` vs `tutor`) on both pages and
  API namespaces (`/api/admin/*`, `/api/teacher/*`); route handlers re-check via `guard()`.
- Teacher accounts start as `pending` and cannot log in until approved by the admin.
- CV upload restricted to PDF ≤ 5 MB; downloads are admin-only and path-traversal safe.
- App container runs as a **non-root** user.

## 5. Pricing Matrix (`src/lib/pricing.js`)

Single source of truth used by the public quote API, the matchmaking preview, and the
snapshot stored on every `ClassSession` (so historical earnings never change).

| Age | Format | Parent price /h | Teacher pay /h | Margin /h |
|---|---|---|---|---|
| 4–6 | Private | 150 | 100 | 50 |
| 4–6 | Group (3–5) | 70 /child | 150 | up to 200 |
| 7–8 | Private | 180 | 120 | 60 |
| 7–8 | Group (3–5) | 80 /child | 160 | up to 240 |
| 9–10 | Private | 200 | 130 | 70 |
| 9–10 | Group (4–6) | 90 /child | 180 | up to 360 |

`netMargin = grossRevenue − teacherPayout`, where for groups
`grossRevenue = parentPrice × numChildren`.

## 6. Environment variables

See `.env.example`. Key ones: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, and optional `SMTP_*` for email alerts to Rachel on new
leads / teacher applications.
```
```
