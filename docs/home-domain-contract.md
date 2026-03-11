# Home Domain Contract

This file documents the boundaries for the main home page MVP so four teammates can merge with less conflict.

## Route ownership

- `/home`: home dashboard domain owner
- `/calendar`: detailed calendar domain owner
- `/reserved/page-two`: reserved placeholder for teammate 3
- `/my-page`: my-page owner
- `/auth`: shared entry route, currently implemented by the home-domain branch because login must gate access to `/home`

## Frontend files owned by the home domain branch

- `frontend/src/App.tsx`
- `frontend/src/assets/duck-face-pictogram.svg`
- `frontend/src/components/HomeKeywordSubscriptionPanel.tsx`
- `frontend/src/components/MainNavigationBar.tsx`
- `frontend/src/constants/app-routes.ts`
- `frontend/src/pages/AuthGatewayPage.tsx`
- `frontend/src/pages/HomeDashboardPage.tsx`
- `frontend/src/pages/MyProfilePage.tsx`
- `frontend/src/types/auth.ts`
- `frontend/src/types/home.ts`

## Backend files owned by the home domain branch

- `backend/src/routes/auth-route.js`
- `backend/src/routes/home-route.js`
- `backend/src/services/auth-service.js`
- `backend/src/services/home-service.js`
- `backend/src/services/home-web-search-service.js`
- `backend/src/repositories/auth-repository.js`
- `backend/src/data/mock-home-content.js`

## API contracts introduced here

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `PATCH /api/auth/subscriptions`
- `GET /api/home/dashboard`
- `GET /api/home/search?q=keyword`

## Naming conventions

- Use `Home*`, `Auth*`, `Reserved*`, or `MainNavigation*` prefixes for files that belong to the main home experience.
- Keep route constants in `frontend/src/constants/app-routes.ts` so path changes happen in one file.
- Keep placeholder routes stable until the teammate responsible for that domain replaces only the page implementation, not the path.
- Keep live web search logic isolated in `backend/src/services/home-web-search-service.js` so home search can evolve without touching calendar routes.
