# Getting Started

This guide walks a new developer through setting up and running the full Rare stack locally.

## Prerequisites

Install these before you begin:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — runs the PostgreSQL database
- [Python 3.12+](https://www.python.org/downloads/) — runs the Django API (check "Add Python to PATH" during install)
- [Node.js](https://nodejs.org/) — runs the React client

Verify your installs:

```powershell
docker --version
py --version
node --version
```

---

## 1. Database setup

The database runs in Docker. From the `rare-api` directory:

```powershell
cd rare-api
docker compose up -d
```

This starts a PostgreSQL 16 container on `localhost:5432` with:
- **Database:** `rare`
- **User:** `rare_user`
- **Password:** `rare_password`

To stop it later: `docker compose down` (data is preserved in the `rare_db_data` volume).

---

## 2. API setup

**Activate the virtual environment** (from the project root):

```powershell
.\.venv\Scripts\Activate.ps1
```

If you get a scripts-disabled error, run this once to allow it:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Install dependencies** (from `rare-api`):

```powershell
cd rare-api
pip install django djangorestframework django-cors-headers psycopg2-binary
```

**Run migrations:**

```powershell
python manage.py migrate
```

---

## 3. Seed the database

Load the fixture data to populate users, posts, categories, tags, and reactions:

```powershell
python manage.py loaddata rareapi/fixtures/initial_data.json
```

---

## 4. Start both servers

You need two terminals open — one for the API, one for the client.

**Terminal 1 — API** (from `rare-api`, with `.venv` activated):

```powershell
python manage.py runserver
```

API runs at `http://localhost:8000`.

**Terminal 2 — Client** (from `rare-client`):

```powershell
cd rare-client
npm install
npm start
```

Client runs at `http://localhost:3000` and opens in your browser automatically.

---

## 5. Login credentials

All seeded users share the same password. If the fixture was generated with `password1`, try that first — if it doesn't work, register a new account via the UI or use the `/register` endpoint in Postman.

| Username | Role |
|---|---|
| `admin_sarah` | Admin (is_staff = true) |
| `admin_marcus` | Admin (is_staff = true) |
| `dev_diana` | Regular user |
| `wanderlust_joe` | Regular user |
| `chef_maya` | Regular user |
| `bookworm_alex` | Regular user |
| `fit_jordan` | Regular user |
| `gamer_priya` | Regular user |
| `eco_oliver` | Regular user |
| `music_luna` | Regular user |
| `startup_raj` | Regular user |
| `photo_emma` | Regular user |

Admin accounts auto-publish posts. Regular user posts enter a moderation queue and must be approved by an admin before they appear in public listings.

---

## 6. Testing the API with Postman

Download [Postman](https://www.postman.com/downloads/) if you don't have it.

### Register or log in

All requests to the API (except `/register` and `/login`) require an auth token. Get one by registering a new account or logging in with a seeded user.

**Register — `POST http://localhost:8000/register`**

- Body tab → raw → JSON:
```json
{
  "username": "testuser",
  "password": "testpassword",
  "first_name": "Test",
  "last_name": "User",
  "email": "test@test.com",
  "bio": "Optional bio"
}
```

**Login — `POST http://localhost:8000/login`**

- Body tab → raw → JSON:
```json
{
  "username": "admin_sarah",
  "password": "your_password_here"
}
```

Both return a response like:
```json
{
  "valid": true,
  "token": "abc123yourtokenhere",
  "user_id": 1,
  "is_staff": true
}
```

Copy the `token` value — you'll need it for all other requests.

### Add the token to authenticated requests

For any endpoint that requires authentication, add a header to your request:

- Headers tab → add a new row:
  - **Key:** `Authorization`
  - **Value:** `Token abc123yourtokenhere`

### Save the token in a Postman environment (recommended)

Rather than pasting the token into every request manually:

1. Click **Environments** in the left sidebar → **+** to create a new environment called `Rare Local`
2. Add a variable: **Variable** `token`, **Initial value** `abc123yourtokenhere`
3. In each request's Authorization header, use `Token {{token}}` instead of the raw value

### Key endpoints to test

| Method | URL | Auth required | Notes |
|---|---|---|---|
| POST | `/register` | No | Create a new account |
| POST | `/login` | No | Returns token |
| GET | `/posts` | Yes | Lists approved, published posts |
| POST | `/posts` | Yes | Create a post |
| GET | `/posts/1` | Yes | Get a single post |
| PUT | `/posts/1` | Yes | Edit a post (owner only) |
| DELETE | `/posts/1` | Yes | Delete a post (owner or admin) |
| GET | `/categories` | Yes | List all categories |
| GET | `/tags` | Yes | List all tags |
| GET | `/profiles` | Yes | List all users |
| GET | `/me` | Yes | Get current user info |
| GET | `/unapprovedposts` | Yes (admin only) | Posts awaiting moderation |
| PUT | `/posts/1/approve` | Yes (admin only) | Approve a post |

---

## Troubleshooting

**"No module named django"** — the virtual environment isn't activated. Run `.\.venv\Scripts\Activate.ps1` from the project root first.

**"could not connect to server"** on migrate — Docker isn't running or the container hasn't started yet. Run `docker compose up -d` from `rare-api`.

**Login/register fails in the UI** — check that both servers are running and that `rare-client/src/managers/api.js` has the API URL set to `http://localhost:8000`.

**Posts not appearing after creating them** — regular user posts require admin approval. Log in as `admin_sarah` or `admin_marcus` to approve them.
