# MeggeMe

Personal website featuring game-inspired pages.

## Features

Each section has a unique aesthetic inspired by different games and media:

- **Home** - Persona 3 inspired menu
- **About Me** - Milk Outside a Bag of Milk Outside a Bag of Milk
- **Blog** - Needy Streamer Overload style blog page
- **Photos** - Wii Menu inspired photo gallery
- **Links** - Minecraft 3D panorama with social links
- **Guestbook** - Persona 5 themed interactive guestbook with avatar selection

## Structure

```text
frontend/           All frontend/static content
├── about_me/       About Me page
├── blog/           Eleventy-powered blog
├── photos/         Eleventy-powered photo gallery
├── links/          Links page
├── guestbook/      Guestbook page
├── assets/         Static assets (favicons, images)
├── fonts/          Custom fonts
├── index.html      Home page
├── style.css       Home styles
├── script.js       Home scripts
└── reset.css       Global CSS reset

backend/            Go backend
├── Dockerfile
├── go.mod
├── go.sum
├── main.go         HTTP server, SQLite init, graceful shutdown
├── guestbook.go    Guestbook REST API (GET/POST /api/guestbook)
├── comments.go     Blog comments REST API (GET/POST /api/comments)
├── middleware.go   CORS middleware
└── ratelimit.go    IP-based rate limiting

nginx.conf          Reverse proxy config (static files + /api/)
docker-compose.yaml Multi-service compose (nginx + Go backend)
```

## Backend

The Go backend exposes the following REST endpoints:

| Method | Path                            | Description                        |
| ------ | ------------------------------- | ---------------------------------- |
| `GET`  | `/api/guestbook?page=N&limit=N` | Fetch paginated guestbook entries  |
| `POST` | `/api/guestbook`                | Submit a new guestbook entry       |
| `GET`  | `/api/comments?post=slug`       | Fetch all comments for a blog post |
| `POST` | `/api/comments`                 | Submit a new blog post comment     |

Data is stored in a SQLite database at `/data/guestbook.db` in two tables:

- `entries` — Guestbook entries (name, message, date, avatar)
- `blog_comments` — Blog comments (name, message, date, post slug)

All write endpoints share the same IP-based rate limiter (1 request per hour per IP).

## Development

Install dependencies:

```bash
npm install
```

Start all development servers:

```bash
npm start
```

Start individual sections:

```bash
npm run start:blog    # Blog only
npm run start:photos  # Photos only
```

Build for production:

```bash
npm run build           # Build all sections
npm run build:blog      # Blog only
npm run build:photos    # Photos only
```

Clean build artifacts:

```bash
npm run clean
```

### Using Docker

Build and run with Docker Compose:

```bash
docker compose up -d --build
```

Stop the containers:

```bash
docker compose down
```

## Deployment

Self-hosted on a Raspberry Pi. Docker Compose runs two services: a nginx container serving static files and proxying all `/api/` requests to the Go backend, which persists data to `/home/pi/data` on the host.
