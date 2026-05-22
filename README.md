This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## API Client

Lightweight `fetch` wrapper at `src/api/index.ts`. Cookie-based auth (`credentials: 'include'`). Auto JSON serialize/parse, query params, `ApiError` on non-2xx, single 401 retry via `/auth/refresh`.

```ts
import { API, ApiError } from '@/api';

// GET
const user = await API.get<User>('/profile');

// GET with query params
const list = await API.get<User[]>('/users', {
  params: { page: 1, limit: 20, search: 'john' },
});

// POST JSON
const created = await API.post<User>('/users', {
  name: 'John',
  email: 'john@example.com',
});

// PUT / PATCH
await API.put<User>('/users/42', { name: 'Jane' });
await API.patch<User>('/users/42', { name: 'Jane' });

// DELETE
await API.delete<void>('/users/42');

// FormData (skips JSON serialization)
const fd = new FormData();
fd.append('file', file);
await API.post('/upload', fd);

// Custom headers and abort
const controller = new AbortController();
const data = await API.get<Thing>('/thing', {
  headers: { 'X-Custom': '1' },
  signal: controller.signal,
});

// Error handling
try {
  await API.get('/secret');
} catch (e) {
  if (e instanceof ApiError) {
    console.log(e.status, e.data);
  }
}

// Raw escape hatch
await API.request<T>('/path', { method: 'POST', body: { foo: 1 } });
```

Behavior:
- Cookies sent on every request — no token storage on the client.
- `X-Timezone` header auto-set from `Intl.DateTimeFormat`.
- JSON body auto-serialized; `Content-Type: application/json` set unless body is `FormData` / `Blob` / `string`.
- Response auto-parsed: JSON when `Content-Type` includes `application/json`, otherwise text.
- 401 → calls `GET /auth/refresh` once, retries original request. Second 401 throws.
- Non-2xx throws `ApiError { status, data }`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
