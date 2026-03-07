# Slotter

> Group slot booking, done right. Create a page, set your time slots, let multiple people book — up to your capacity limit.

Slotter is a self-hostable, open-source group booking platform. Organizers create booking pages with configurable time slots and share a link. Attendees pick a slot and book instantly — no accounts required. Slots close when full. Everyone gets notified.

## Features

- **Group booking** — multiple attendees per slot, up to a configurable capacity
- **No-friction booking** — attendees book with just a name and email; no account needed
- **Email OTP auth** — optional email verification for restricted booking pages
- **Allowlist support** — restrict bookings to a list of approved email addresses
- **Automatic emails** — confirmation sent on booking; cancellation notices sent to all affected attendees
- **Slot management** — cancel individual bookings or entire slots from the dashboard
- **CSV export** — download all bookings for any page
- **Neobrutalist UI** — bold, high-contrast design that's fast and accessible

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Database | SQLite via [Prisma](https://prisma.io) (swappable to PostgreSQL) |
| Auth | [Iron Session](https://github.com/vvo/iron-session) + Email OTP |
| Email | [Resend](https://resend.com) + [React Email](https://react.email) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Validation | [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Resend](https://resend.com) account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/slotter.git
cd slotter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path (`file:./dev.db`) or a PostgreSQL connection string |
| `SESSION_SECRET` | Random 32+ character string for session encryption |
| `RESEND_API_KEY` | Your Resend API key |
| `NEXT_PUBLIC_APP_URL` | The public URL of your deployment (e.g. `https://yourapp.com`) |
| `EMAIL_FROM` | Sender address (e.g. `Slotter <no-reply@yourdomain.com>`) |

### 4. Set up the database

```bash
npm run db:migrate
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database

Slotter uses SQLite by default (zero setup). To switch to PostgreSQL, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run `npm run db:migrate`.

### Prisma commands

```bash
npm run db:migrate   # run migrations
npm run db:studio    # open Prisma Studio (visual DB browser)
npm run db:generate  # regenerate Prisma client
```

## Project Structure

```
src/
  app/
    api/             # API route handlers
    book/[slug]/     # Public booking pages
    dashboard/       # Organizer dashboard
    login/           # OTP login
  components/
    booking/         # Slot grid, slot cards, capacity bar
    dashboard/       # Page cards, slot manager, export button
    forms/           # Booking form, slot builder, OTP form
    layout/          # Navbar
    ui/              # Reusable primitives (Button, Input, Modal, Toast...)
  lib/
    email-templates/ # React Email templates
    email.ts         # Email sending helpers
    otp.ts           # OTP generation and validation
    prisma.ts        # Prisma client singleton
    session.ts       # Iron Session config
  types/             # Shared TypeScript types
prisma/
  schema.prisma      # Database schema
  migrations/        # Migration history
```

## Deployment

Slotter is a standard Next.js app and can be deployed anywhere:

**Vercel (recommended)**

```bash
vercel deploy
```

Set all environment variables in the Vercel dashboard. For the database, swap SQLite for a PostgreSQL provider (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com)).

**Self-hosted (Docker / VPS)**

```bash
npm run build
npm run start
```

Or use `next build --experimental-app` with the standalone output option.

## Environment File Example

Create a `.env.example` in your repo (safe to commit — no secrets):

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="change-me-to-a-random-32-character-string"
RESEND_API_KEY="re_your_api_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EMAIL_FROM="Slotter <onboarding@resend.dev>"
```

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a pull request

## License

[MIT](./LICENSE)
