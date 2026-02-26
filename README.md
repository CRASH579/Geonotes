# Geonotes

A geo-tagged notes platform. Drop text notes on a map, share them with friends or groups, and discover nearby notes from your social circle.

---

## Architecture

```
Geonotes/
├── server/        NestJS REST API — auth, notes, friends, groups
├── react-web/     React + Vite web client — full-featured map UI
├── app/           Flutter mobile app 
└── docker-compose.yml
```

### Backend stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | NestJS 11 (TypeScript)              |
| Database    | PostgreSQL 16 + PostGIS 3.4         |
| ORM         | Prisma 5                            |
| Auth        | Firebase Admin SDK (ID token verify)|
| Spatial     | PostGIS geography, ST_DWithin       |
| Docs        | Swagger at `/api/docs`              |

### Frontend stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | React 18 + TypeScript + Vite                  |
| Maps        | Google Maps (`@vis.gl/react-google-maps`)      |
| Auth        | Firebase Web SDK                              |
| Styling     | Tailwind CSS                                  |
| Icons       | Lucide React                                  |

---

## Data model

### Core entities

```
User ──owns──> Note
User ──member of──> Group (via GroupMember)
Group ──access layer for──> Notes (visibility=GROUP)
User ──friendship with──> User (via Friendship)
```

### Visibility rules

| Visibility | Who can see the note                  |
|------------|---------------------------------------|
| `PRIVATE`  | Owner only                            |
| `FRIENDS`  | Owner + accepted friends              |
| `GROUP`    | Owner + all members of the note's group |
| `PUBLIC`   | Everyone within radius                |

**Invariant:** `visibility=GROUP` requires a `group_id`. All other visibilities must have `group_id=null`. This is enforced at the service layer.

### Group member roles

| Role    | Capabilities                              |
|---------|-------------------------------------------|
| `OWNER` | Delete group, promote admins, add/remove members |
| `ADMIN` | Add/remove members                        |
| `MEMBER`| View group notes, leave group             |

Group visibility (`PUBLIC` / `FRIENDS_ONLY`) controls who can discover the group — not yet used to filter note access (all group members see all group notes regardless of group visibility).

---

## Running locally

### Prerequisites

- Node.js 20+
- Docker + Docker Compose (for the database)
- Firebase project with Authentication enabled
- Google Maps API key (for the web client)

---

### 1. Start the database

```bash
docker compose up postgres -d
```

This starts PostgreSQL 16 with PostGIS at `localhost:5432`.

---

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL and add Firebase env vars
npm install
npm run prisma:migrate      # apply all migrations
npm run prisma:generate     # generate Prisma client
npm run start:dev           # watch mode on :3000
```

**Required `.env` values:**

```env
DATABASE_URL=postgresql://geonotes:secret@localhost:5432/geonotes
PORT=3000
NODE_ENV=development
```

Firebase is configured via `firebase-service-account.json` (place in `server/` root — not committed).

**Useful scripts:**

```bash
npm run start:dev       # development with hot reload
npm run start:prod      # production (requires build first)
npm run build           # compile to dist/
npm run prisma:studio   # open Prisma Studio on :5555
npm run prisma:migrate  # run pending migrations
npm run test            # unit tests
npm run test:e2e        # end-to-end tests
```

Swagger UI is available at `http://localhost:3000/api/docs`.

---

### 3. Frontend (React web)

```bash
cd react-web
cp .env.example .env
# Fill in Firebase and Google Maps keys
npm install
npm run dev             # dev server on :5173
```

**Required `.env` values:**

```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_GOOGLE_MAPS_API_KEY=your-maps-key
```

**Scripts:**

```bash
npm run dev       # development server
npm run build     # production build to dist/
npm run preview   # preview production build locally
```

---

### Docker (full stack)

To run both the database and backend together:

```bash
docker compose up -d
```

Note: place `firebase-service-account.json` in `server/` before building the Docker image, or mount it as a volume.

---

## API overview

All endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header, except `/api/auth/login`.

### Auth

| Method | Path              | Description                         |
|--------|-------------------|-------------------------------------|
| POST   | `/api/auth/login` | Verify Firebase token, upsert user  |

### Notes

| Method | Path                 | Description                              |
|--------|----------------------|------------------------------------------|
| POST   | `/api/notes`         | Create a note at coordinates             |
| GET    | `/api/notes/mine`    | Get own notes (max 200, newest first)    |
| GET    | `/api/notes/nearby`  | Get visible notes within radius          |
| GET    | `/api/notes/legacy`  | Fetch legacy Firestore notes (read-only) |
| PATCH  | `/api/notes/:id`     | Update own note (title, content, visibility) |
| DELETE | `/api/notes/:id`     | Soft-delete own note                     |

**Nearby query params:** `latitude`, `longitude`, `radiusMeters` (default 500,000m). Returns max 100 notes sorted by distance.

### Friends

| Method | Path                         | Description                        |
|--------|------------------------------|------------------------------------|
| POST   | `/api/friends/request`       | Send request by username           |
| PATCH  | `/api/friends/:id/respond`   | Accept or reject a request         |
| GET    | `/api/friends`               | List accepted friends              |
| GET    | `/api/friends/pending/received` | Incoming pending requests       |
| GET    | `/api/friends/pending/sent`  | Outgoing pending requests          |
| DELETE | `/api/friends/:id`           | Remove or cancel a friendship      |

### Groups

| Method | Path                                  | Description                          |
|--------|---------------------------------------|--------------------------------------|
| POST   | `/api/groups`                         | Create group (with optional visibility) |
| GET    | `/api/groups`                         | List groups I am a member of         |
| GET    | `/api/groups/:id`                     | Group details + member list          |
| POST   | `/api/groups/:id/members`             | Add member by username (owner/admin) |
| DELETE | `/api/groups/:id/members/:userId`     | Remove member or leave group         |
| PATCH  | `/api/groups/:id/members/:userId/promote` | Promote member to admin (owner) |
| DELETE | `/api/groups/:id`                     | Delete group (owner only)            |

### Users

| Method | Path                          | Description                     |
|--------|-------------------------------|---------------------------------|
| GET    | `/api/users/check-username`   | Check username availability     |
| PATCH  | `/api/users/me`               | Update own username             |

---

## Frontend UI

The web client is a single-page application centred on a fullscreen Google Map.

### Navigation

A dropdown pill (top-right) switches between five views:

- **Map** — fullscreen map with note pins; click to create a note
- **Notes** — searchable list with source filter chips (Mine / Friends / Groups / Public / Legacy)
- **Profile** — stats, settings, sign out
- **Friends** — manage friend requests and friend list
- **Groups** — create and manage groups, add/remove members

### Note pins

| Colour        | Source                          |
|---------------|---------------------------------|
| Brand (green) | Own notes (`mine`)              |
| Blue/lavender | Friend notes (`friend`)         |
| Orange        | Group notes (`group`) — any visibility=GROUP note gets an orange pin regardless of ownership |
| Red/pink      | Public notes from strangers     |
| Grey          | Legacy Firestore notes          |

Hovering a pin shows a tooltip with the note title and owner/group name.

### Note creation

- Click the map to pin a location, then fill in title + content + visibility.
- Or press the `+` FAB to use GPS.
- GROUP visibility shows a group selector (only groups you are a member of).

### Data freshness

- Nearby notes are re-fetched when the map view is activated (switching tabs → back to Map always pulls fresh data).
- Notes are also re-fetched after creating or deleting a note.

---

## Key design decisions

**Soft delete:** Notes are never hard-deleted — `deleted_at` is set instead. This allows future audit/restore without data loss.

**PostGIS raw SQL:** Prisma does not support geography types natively, so `$queryRaw` tagged templates are used for inserts and spatial queries. All other queries use the Prisma query builder.

**Visibility enforced in SQL:** The `findNearby` query evaluates all four visibility levels in a single `WHERE` clause. No post-fetch filtering in application code.

**group_id invariant:** `visibility=GROUP` requires `group_id != null`; all other visibilities require `group_id = null`. Enforced on create and on update. Changing a note's visibility away from GROUP automatically clears `group_id`.

**Group deletion cascade:** Deleting a group converts all its GROUP-visibility notes to PRIVATE before the group row is removed, preventing notes from becoming orphaned with an unresolvable visibility.

**Auth flow:** Firebase issues the ID token. Every API request verifies it via Firebase Admin SDK and resolves the PostgreSQL user profile. The first call to `/api/auth/login` upserts the user record; subsequent calls update email and avatar.

---

## Known limitations

- `CORS` is wide-open (`app.enableCors()` with no origin restriction) — suitable for development, restrict to your domain in production.
- Editing a note cannot change its group assignment. To move a note to a different group, delete it and recreate it.
- The nearby endpoint has a hardcoded 100-note limit. Pagination is not implemented.
- Legacy Firestore notes have no per-user filter (the original data has no `uid` field) — all authenticated users see the same legacy archive.
- The Flutter mobile app (`app/`) uses Firestore directly and does not integrate with the NestJS backend.
