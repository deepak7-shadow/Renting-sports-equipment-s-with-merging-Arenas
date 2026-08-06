# ArenaHub

Sports arena booking platform — customers search/book courts and rent equipment, arena owners manage listings, admins verify and moderate.

## Run locally

```bash
# Terminal 1
cd backend && npm install && cp .env.example .env  # fill in values
npm run dev

# Terminal 2
cd frontend && npm install && cp .env.example .env
npm run dev
```

Backend on `:5000`, frontend on `:5173` (Vite default).

See `backend/README.md` and `frontend/README.md` for details on each side.

## Status

- **Backend**: complete against the Phase 3 spec — all 7 collections have full CRUD, plus admin user-management/reports.
- **Frontend**: full customer, owner, and admin flows built and wired to the API. Booking end-to-end via Razorpay test checkout.
- **Not built**: the AI service (recommendations, cheapest-slot, crowd prediction, chatbot) and image upload wiring.
