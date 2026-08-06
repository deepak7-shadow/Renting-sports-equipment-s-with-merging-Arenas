# ArenaHub Backend

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, and Razorpay keys
npm run dev             # requires nodemon (installed as devDependency)
```

Needs a running MongoDB instance (local `mongod` or a MongoDB Atlas URI in `.env`).

## API surface

All routes are mounted under `/api`. Roles are enforced via `middleware/auth.js` (`protect` + `authorize(...roles)`).

| Resource | Routes |
|---|---|
| Auth | `POST /register`, `POST /login` |
| Arena | `GET /arenas` (public, approved only), `GET /arenas/mine` (owner, any status), `GET /arenas/all` (admin, any status), `GET /arenas/:id`, `POST /arena`, `PUT /arena/:id`, `DELETE /arena/:id` |
| Court | `GET /courts?arenaId=`, `POST /court`, `PUT /court/:id`, `POST /court/:id/slots` (owner adds bookable slots) |
| Equipment | `GET /equipment?arenaId=&sport=`, `POST /equipment` |
| Equipment Rental | `POST /rental`, `GET /rental` (scoped by role), `PUT /rental/:id/return` |
| Booking | `POST /booking` (atomic slot-locking, prevents double-booking), `GET /booking` (scoped by role) |
| Payment | `POST /payment/order`, `POST /payment/verify` (Razorpay) |
| Review | `GET /arenas/:arenaId/reviews`, `POST /arenas/:arenaId/reviews`, `DELETE /reviews/:id` — auto-syncs `Arena.rating` |
| Admin | `GET /users?role=`, `PUT /users/:id/verify`, `DELETE /users/:id`, `GET /admin/reports` |

## Important flow notes

- A court has zero bookable slots until the owner calls `POST /court/:id/slots` — creating a court alone does not make it bookable.
- `GET /arenas` always filters to `status: 'approved'`; owners must use `/arenas/mine` and admins `/arenas/all` to see pending/rejected listings.
- Arena owner accounts start with `isVerified: false`; admin verifies them via `PUT /users/:id/verify`. This is separate from arena approval (`status` field on the Arena, set via `PUT /arena/:id`).
- Booking flow: `POST /booking` claims the slot and creates a `pending` booking → `POST /payment/order` → client-side Razorpay checkout → `POST /payment/verify` flips it to `confirmed`.

## Not yet built

- Image upload wiring (multer is installed, not yet connected to a route)
- AI service (separate FastAPI service per the original plan — recommendations, cheapest slot, crowd prediction, chatbot)

## Quick test with curl

```bash
# Register an arena owner
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Owner","email":"owner@test.com","password":"pass123","role":"arena_owner"}'

# Login (grab the token from the response)
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@test.com","password":"pass123"}'

# Create an arena (use the token)
curl -X POST http://localhost:5000/api/arena \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Test Arena","location":{"address":"123 St","city":"Bengaluru"},"sportsAvailable":["cricket"]}'
```
