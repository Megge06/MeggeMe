# IndieWeb Site

Personal website featuring game-inspired themes and static page sections.

## Features

Each section has a unique aesthetic inspired by different games and media:

- **Home** - Persona 3 inspired menu
- **About Me** - Milk Outside a Bag of Milk Outside a Bag of Milk
- **Blog** - Needy Streamer Overload style blog page
- **Photos** - Wii Menu inspired photo gallery
- **Links** - Minecraft 3D panorama with social links

## Structure

```text
/                   Root HTML files (home, about_me, links)
├── blog/           Eleventy-powered blog
│   └── src/        Source files
└── photos/         Eleventy-powered photo gallery
    └── src/        Source files
```

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

Stop the container:

```bash
docker compose down
```

## Deployment

Self-hosted on a Raspberry Pi. Built files are served directly from the repository.
