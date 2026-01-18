# GeoNotes

GeoNotes is a location-aware note-taking platform designed to attach thoughts, memories, and information to real-world places.

This repository represents **GeoNotes v2**, a production-oriented rebuild focused on clean backend architecture, scalability, and multi-client support (web and mobile), combined with a deliberately crafted, minimal user experience.

The project evolves from a legacy Firebase-only implementation into a structured backend-driven system with a strong emphasis on clarity, calm design, and long-term maintainability.

---

## Why GeoNotes v2 Exists

The original version of GeoNotes was built quickly on Firebase and Firestore. While functional, it exposed several limitations:

* No user system
* No clear ownership of notes
* No privacy or sharing rules
* Frontend tightly coupled to Firebase
* Difficult to scale to social features such as friends, groups, or public notes

GeoNotes v2 addresses these issues by introducing:

* A real backend as the single source of truth
* Explicit domain rules for ownership, visibility, and access
* A clean migration path from Firestore to SQL
* A shared API usable by both web and mobile clients
* A thoughtfully designed UI focused on readability and ease of use

---

## Design Philosophy and UX

GeoNotes follows a **clean, cappuccino-inspired design language**.

The interface is intentionally calm and restrained, using dark-first surfaces, soft contrast, and a limited color palette that is easy on the eyes during long usage sessions. Accent colors are used sparingly to guide attention rather than dominate it.

Key UX principles:

* Dark-first theme with comfortable contrast
* Soft surfaces instead of harsh borders
* Minimal visual noise
* Clear hierarchy and spacing
* Motion used only where it improves clarity
* Navigation that adapts naturally between desktop and mobile

The result is an interface that feels modern and expressive without being distracting, with interactions that feel fast, intentional, and “rad” without relying on gimmicks.

---

## High-Level Architecture

Clients never talk directly to the database.

```
Web (React) / Mobile (Flutter)
        ↓
Firebase Authentication (Google Sign-In)
        ↓
NestJS Backend (API)
        ↓
Firestore (legacy) + PostgreSQL (new)
```

The backend is responsible for all validation, authorization, and business rules.

---

## Tech Stack

### Frontend

* React
* React Router
* Tailwind CSS
* Dark-first custom theme
* Google Fonts (Poppins)

### Backend

* NestJS
* TypeScript
* Firebase Admin SDK for authentication verification
* REST-based API
* Centralized error handling

### Authentication

* Firebase Auth
* Google Sign-In only
* Backend verifies Firebase ID tokens
* No authentication logic in the frontend beyond login

### Databases

* Firestore for legacy data support
* PostgreSQL for new production data
* Clear repository separation to allow migration without API changes

### Infrastructure

* Ubuntu VPS (Hostinger)
* Custom domain: geonotes.in
* PostgreSQL hosted on the VPS
* Backend served behind a reverse proxy

---

## Domain Rules (Core Design Principles)

These rules define how the system behaves, independent of the database.

### Users

* Every new note belongs to exactly one user
* Users are identified by Firebase UID
* Legacy notes may temporarily exist without an owner

### Notes

* Single owner per note
* Only the owner can edit or delete a note
* No shared editing
* Notes always have a geographic location

### Visibility

Each note has exactly one visibility state:

* private: visible only to the owner
* friends: visible to accepted friends
* public: visible to anyone
* group: visible to members of a group

Visibility is enforced strictly by the backend.

### Friends

* Friendship is mutual
* Requests must be accepted
* Removing a friend immediately revokes access to friends-only notes

### Groups

* Groups have an owner and members
* Group notes are visible only to group members
* Group ownership controls membership, not note ownership

### Legacy Notes

* Legacy Firestore notes are treated as group-visible
* A special “Legacy GeoNotes” group provides controlled access
* Legacy data is supported but not extended

---

## Backend Responsibilities

The backend is the only authority in the system.

It handles:

* Authentication verification
* Ownership checks
* Visibility enforcement
* Input validation
* Error handling
* Admin overrides

The frontend never decides who can see or modify data.

---

## Admin Access

Admin access exists from the start for debugging and maintenance.

* Admins are identified via an allowlist of Firebase UIDs
* Admins can bypass visibility rules
* Admin behavior is implemented using backend guards, not UI roles

---

## API Design

The API is REST-based and client-agnostic.

Examples:

* `GET /me`
* `POST /notes`
* `GET /notes/nearby`
* `PATCH /notes/:id/visibility`
* `POST /friends/request`
* `POST /groups`

The same API is used by:

* React web application
* Flutter mobile application

---

## Frontend Structure

The frontend combines a portfolio site with the GeoNotes web application.

Routes:

* `/` – GeoNotes landing and hero page
* `/web` – GeoNotes web application
* `/about` – Personal portfolio
* `/projects` – Additional projects

Navigation adapts between devices:

* Desktop uses a centered navigation pill
* Mobile uses a vertical floating navigation control

This approach keeps navigation accessible while maintaining a distinctive visual identity.

---

## Migration Strategy

GeoNotes v2 is designed for incremental migration.

Phase 1:

* Backend with Firestore support
* Legacy data readable and usable
* New structure enforced via backend rules

Phase 2:

* PostgreSQL introduced for new features
* Friends, groups, and visibility stored in SQL
* API remains unchanged

Phase 3:

* Firestore fully deprecated
* One-time migration scripts
* Clients remain unaffected

---

## Project Goals

* Demonstrate real backend architecture
* Show clear separation of concerns
* Support multiple clients from a single API
* Handle legacy systems responsibly
* Combine strong system design with thoughtful UX
* Reflect production-grade decision making

This project is designed as a realistic, long-term system rather than a short-lived demo.

---

## Status

GeoNotes v2 is actively under development.

Architecture, domain rules, and design foundations are finalized before feature implementation to avoid future rewrites and UX inconsistencies.


