# Self-hosting LinkCliq

LinkCliq is one Next.js server and one SQLite file. Anything that can run a Docker container with a persistent folder can run it. If you would rather not run a server, use it free at [linkcliq.com](https://linkcliq.com).

- [What you need](#what-you-need)
- [Docker Compose](#docker-compose)
- [Your own domain with HTTPS](#your-own-domain-with-https)
- [Railway](#railway)
- [Node without Docker](#node-without-docker)
- [Vercel and Turso](#vercel-and-turso)
- [After the first sign-up](#after-the-first-sign-up)
- [Password reset emails](#password-reset-emails)
- [Country analytics](#country-analytics)
- [Backups](#backups)
- [Upgrading](#upgrading)
- [Configuration reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

## What you need

- Docker, or Node.js 20 or newer.
- A domain or subdomain for your pages, such as `links.example.com`. Your bio links will look like `links.example.com/yourname`.
- About 256 MB of memory. The database grows by roughly 200 bytes per page view or click.

Your own domain matters for more than looks. TikTok and Instagram sometimes warn about or block shared link in bio domains, and a domain only you use avoids being caught up in that.

## Docker Compose

```bash
mkdir linkcliq && cd linkcliq
curl -O https://raw.githubusercontent.com/ndesv21/linkcliq/main/docker-compose.yml
docker compose up -d
```

Open [localhost:3000](http://localhost:3000) and create your account.

What happens on first boot:

- The image `ghcr.io/ndesv21/linkcliq:latest` is pulled. It is built for amd64 and arm64, so it also runs on a Raspberry Pi or an ARM cloud server.
- A session secret is generated and saved in the `linkcliq-data` volume, next to the database. Keep the volume and you keep your logins and stored API keys.
- The database is created and migrated.

To build the image from source instead, clone the repository and run `docker compose up -d --build`.

Settings go in a `.env` file next to `docker-compose.yml`. Compose reads it automatically:

```bash
BETTER_AUTH_URL=https://links.example.com
ADMIN_EMAILS=you@example.com
```

Run `docker compose up -d` again after changing it.

## Your own domain with HTTPS

Point an `A` record for your domain at the server, then put any reverse proxy in front of port 3000. With [Caddy](https://caddyserver.com), which gets the certificate for you, add it to the same compose file:

```yaml
services:
  linkcliq:
    image: ghcr.io/ndesv21/linkcliq:latest
    restart: unless-stopped
    environment:
      BETTER_AUTH_URL: https://links.example.com
    volumes:
      - linkcliq-data:/app/data

  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    command: caddy reverse-proxy --from links.example.com --to linkcliq:3000
    volumes:
      - caddy-data:/data

volumes:
  linkcliq-data:
  caddy-data:
```

`BETTER_AUTH_URL` must be the exact address people type, with `https://` and no trailing slash. Sign-in fails with "Invalid origin" when it does not match.

Behind Nginx or Traefik, forward the `Host` and `X-Forwarded-Proto` headers. If your proxy cannot forward `Host`, set `PUBLIC_URL` to the same address.

## Railway

1. Create a project and add a service from the image `ghcr.io/ndesv21/linkcliq:latest`, or from your fork of this repository (Railway builds the Dockerfile).
2. Add a volume mounted at `/app/data`.
3. Set these variables:

   | Variable | Value |
   | --- | --- |
   | `BETTER_AUTH_URL` | `https://your-domain` |
   | `BETTER_AUTH_SECRET` | output of `openssl rand -base64 32` |
   | `RAILWAY_RUN_UID` | `0` |

   Railway mounts volumes as root, and the image runs as an unprivileged user. `RAILWAY_RUN_UID=0` lets it write to the volume. Without it the container stops with "/app/data is not writable".
4. Under Networking, add your custom domain and create the DNS records Railway shows you.

## Node without Docker

```bash
git clone https://github.com/ndesv21/linkcliq.git
cd linkcliq
npm ci
cp .env.example .env      # set BETTER_AUTH_SECRET and BETTER_AUTH_URL
npm run build
npm start                 # listens on port 3000, set PORT to change it
```

Keep it running with systemd, pm2 or your host's process manager. The database lives in `./data/linkcliq.db` unless you change `DATABASE_URL`.

## Vercel and Turso

Vercel cannot keep a SQLite file between requests, so use a [Turso](https://turso.tech) database:

```bash
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://your-app.vercel.app
```

Import the repository in Vercel, add these variables and deploy. Migrations run when the server starts.

## After the first sign-up

1. Create your account and your page.
2. Close sign-ups unless you want strangers to create pages on your server: `DISABLE_SIGNUP=true`.
3. Add yourself as an admin: `ADMIN_EMAILS=you@example.com`. Admins get an **Admin** item in the sidebar with every page on the instance, its owner and its traffic, and can suspend a page. A suspended page returns 404 and its links stop redirecting, and its owner cannot republish it.
4. If other people use your instance, set `CONTACT_EMAIL`. Public pages then show a small Report link that opens an email to that address.

## Password reset emails

Without email, people who forget their password need you to reset it. To turn on self-service reset links:

1. Create a [Resend](https://resend.com) account and verify your domain there.
2. Set:

   ```bash
   RESEND_API_KEY=re_...
   EMAIL_FROM="LinkCliq <no-reply@your-domain>"
   ```

A "Forgot password?" link then appears on the sign-in page. Reset links work once and expire after an hour, and resetting signs the account out everywhere else.

## Country analytics

LinkCliq reads the visitor's country from your CDN when it sends one (`cf-ipcountry` from Cloudflare, `x-vercel-ip-country` from Vercel, `fly-client-country` from Fly.io). Everywhere else it looks the IP address up in the bundled [DB-IP Lite](https://db-ip.com) database, on your own server, without sending anything out. The IP address is never stored.

DB-IP Lite is licensed under CC BY 4.0. The dashboard shows the required "IP Geolocation by DB-IP" credit; keep it if you change the layout.

## Backups

Everything lives in the `linkcliq-data` volume: the database and the generated secret. For a consistent copy, stop the container while you archive it:

```bash
docker compose stop linkcliq
docker run --rm -v linkcliq_linkcliq-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/linkcliq-$(date +%F).tgz -C /data .
docker compose start linkcliq
```

The volume is named after the folder that holds `docker-compose.yml`; `docker volume ls` shows the exact name. To restore, stop the container and extract the archive back into the volume.

On Railway, turn on scheduled backups in the volume settings.

## Upgrading

```bash
docker compose pull
docker compose up -d
```

Database migrations run automatically when the new version starts. Read the release notes before upgrading across a major version.

## Configuration reference

| Variable | Default | |
| --- | --- | --- |
| `BETTER_AUTH_URL` | `http://localhost:3000` | The public address of your instance. Required in production. |
| `BETTER_AUTH_SECRET` | generated by the Docker image | Signs sessions and encrypts stored API keys. Required outside Docker. Never change it once set. |
| `DATABASE_URL` | `file:./data/linkcliq.db` | SQLite file, or `libsql://` for Turso and libSQL servers. |
| `DATABASE_AUTH_TOKEN` | | Turso or libSQL token. |
| `DISABLE_SIGNUP` | `false` | Close public sign-ups. |
| `ADMIN_EMAILS` | | Comma-separated accounts that can open the admin view. |
| `RESEND_API_KEY` | | Turns on password reset emails, together with `EMAIL_FROM`. |
| `EMAIL_FROM` | | Sender for emails, on a domain verified in Resend. |
| `CONTACT_EMAIL` | | Shows a Report link on public pages. |
| `TRUSTED_ORIGINS` | | Extra origins allowed to call the auth API, comma separated. |
| `PUBLIC_URL` | from the request | Address used for page links when your proxy does not forward `Host`. |
| `IP_ADDRESS_HEADERS` | `x-forwarded-for` (`x-real-ip` on Railway) | Headers that carry the visitor's IP for sign-in rate limiting, comma separated. List only headers your proxy overwrites. Behind Cloudflare, use `cf-connecting-ip`. |
| `SKIP_MIGRATIONS` | `false` | Skip automatic migrations if you run `npm run db:migrate` yourself. |
| `PORT` | `3000` | Port the server listens on. |

## Troubleshooting

**"Invalid origin" when signing in.** `BETTER_AUTH_URL` does not match the address in the browser. Check `http` against `https`, `www`, and the port. To accept a second address, add it to `TRUSTED_ORIGINS`.

**"/app/data is not writable" and the container stops.** The volume belongs to another user. On Railway set `RAILWAY_RUN_UID=0`. Elsewhere, run `chown -R 1001:1001` on the volume's folder.

**Everyone was signed out after a redeploy.** The secret changed. With Docker, the volume was probably recreated. Set `BETTER_AUTH_SECRET` explicitly so it survives.

**The Countries report shows "Unknown".** Requests from private networks (such as testing on your LAN) have no country. Public traffic should resolve.

**Links in the dashboard show the wrong domain.** Your proxy is not forwarding the `Host` header. Fix the proxy or set `PUBLIC_URL`.

Something else? [Open an issue](https://github.com/ndesv21/linkcliq/issues).
