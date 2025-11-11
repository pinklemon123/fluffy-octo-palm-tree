# Backend (Express + Neon)

This backend exposes a lightweight Express API that talks directly to a Neon/PostgreSQL database. It is used for username/password authentication, posts, follows and file metadata.

## Environment variables

Create a `.env` file (or configure the variables in your hosting provider) with the following keys:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | The full Neon PostgreSQL connection string. Example: `postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require` |
| `JWT_SECRET` | Secret used to sign login tokens. Generate a random string. |
| `CORS_ORIGIN` | Optional. Comma separated list of origins allowed to call the API. Defaults to `*`. |
| `PGPOOL_MAX` | Optional. Override connection pool size (defaults to `10`). |
| `PGPOOL_IDLE_TIMEOUT` | Optional. Idle timeout in milliseconds (defaults to `30000`). |
| `PGPOOL_CONNECTION_TIMEOUT` | Optional. Connection timeout in milliseconds (defaults to `5000`). |

When deploying to Vercel, add at least `DATABASE_URL` and `JWT_SECRET` to your Project → Settings → Environment Variables. Use the Neon connection string that starts with `postgresql://...` (the same one you would pass to `psql`).

## Local development

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in your Neon connection details
3. Start the API: `npm start`
4. The server will boot on port `3000` by default

The `/api/health` endpoint performs a simple query so you can confirm the connection works.