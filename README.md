# Payan Admin

Payan Admin is the operations dashboard connecting the Payan passenger app and
the Payan Fleet rider app. It provides:

- Workspace sign-in with a browser-local prototype session.
- Permission-based access to rider verification and ride monitoring.
- Rider document review with explicit approval and resubmission transitions.
- Searchable live, completed, and cancelled booking records.
- Responsive layouts following the Payan Valencia Zest design system.

## Local development

```bash
npm install
npm run dev
```

Prototype sign-in accepts a valid `@payan.ph` email and a password of at least
eight characters. Passwords are not stored. Production authentication and
authorization must be enforced by the connected backend before real rider
documents or ride data are used.

## Google Maps

Set `GOOGLE_MAPS_WEB_API_KEY` in the local `.env` file to enable the dashboard
map. Enable Maps JavaScript API and restrict the key to the admin dashboard's
web origins. The Android and iOS Maps SDK keys remain isolated to their native
apps and are not exposed to the browser bundle.

## Verification

```bash
npm run lint
npm run build
```
