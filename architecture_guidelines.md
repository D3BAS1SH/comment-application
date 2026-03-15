# Next.js Frontend Architecture Guidelines

Welcome to the codebase! This document serves as the single source of truth for how the frontend is structured. It covers where files go, how data flows, and how we handle errors.

---

## 🏗️ 1. Directory Structure Conventions

The frontend strictly separates what runs in the **Browser** vs what runs on the **Node Server**.

### `src/server/` (Strictly Server-Side)

Files here do the heavy lifting of talking to microservices and reading secure cookies. The browser can **never** import anything from here.

- [src/server/http/clients.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/server/http/clients.ts): Configures the raw Axios instances pointing to NestJS microservices.
- `src/server/services/*.service.ts`: The BFF (Backend-for-Frontend) abstraction layer. Formats outgoing requests and normalizes incoming errors.
- [src/server/bff/auth-guard.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/server/bff/auth-guard.ts): Secures API Route Handlers by reading `HttpOnly` tokens.
- `src/server/jwt/verify.ts`: Uses secrets from `.env` to verify tokens (Notice how we correctly moved this out of `src/lib/` since it uses server secrets).

### `src/app/api/` (Next.js API Route Handlers)

These act as the "controllers" for the Next.js server.

- They **do not** contain business logic.
- They extract JSON bodies or query params, call a `src/server/service/*`, and return standard JSON.
- They attach the `Set-Cookie` headers for auth.

### `src/features/` (Feature Slices - Client & Server Components)

We group UI code by feature, not by technical type. If you are building the "Chat" system, everything goes into `src/features/chat`:

- `features/chat/components/`: React components specific to chat (`ChatWindow`, `MessageBubble.tsx`). Try to use Server Components where feasible, use `'use client'` when interactivity is required.
- `features/chat/hooks/`: Client-side data fetching or UI state logic (`useChat.ts`).
- `features/chat/types/`: TypeScript definitions (`Message.interface.ts`).

### `src/lib/` (Shared Cross-Environment Configuration)

Libraries and configurations that both the Browser and the Server might need to safely import.

- [src/lib/constants/error-codes.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/constants/error-codes.ts): The master list of error strings.
- `src/lib/redux/`: Global client-side state management (Store, slices).
- [src/lib/errors/app-error.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/errors/app-error.ts): Custom client-side error classes.

### `src/utils/` (Pure Helper Functions)

Small, pure functions. No side effects.

- Formatting dates, regex validators, math helpers.
- [src/utils/service-error.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts): Simple error formatting class used by the `src/server/services/`.

---

## 🚨 2. Error Handling Pipeline

It is vital to understand the difference between backend API errors and frontend client errors.

### The API Error Flow ([ServiceError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#4-19))

If the microservice throws an error (e.g., "Invalid Password"):

1. The microservice returns a `400 Bad Request` with `{ message: "...", errorCode: "INVALID_CREDENTIALS" }`.
2. The [src/server/services/auth.service.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/server/services/auth.service.ts) catches the Axios failure. It passes it to [handleAxiosError()](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#20-36).
3. [handleAxiosError()](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#20-36) returns a strictly typed [ServiceError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#4-19) object.
4. The Route Handler (`src/app/api/auth/login/route.ts`) sees the [ServiceError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#4-19) and forwards its `message` and `errorCode` as JSON to the browser.
5. The Redux Thunk throws the `message` using `rejectWithValue(data.message)`.

### When do we show UI Toasts?

**In the UI Hook or Component!** The Redux Thunk's job is purely state. Do not put `toast.error()` inside a Redux slice.

```tsx
// Inside features/auth/hooks/use-login.ts
const dispatch = useAppDispatch();

const handleLogin = async (credentials) => {
  const resultAction = await dispatch(loginUser(credentials));

  if (loginUser.fulfilled.match(resultAction)) {
    toast.success('Welcome back!');
    router.push('/dashboard');
  } else {
    // resultAction.payload contains the string message from the ServiceError!
    toast.error(resultAction.payload || 'Login failed');
  }
};
```

### What about [AppError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/errors/app-error.ts#3-13)?

If [ServiceError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#4-19) handles all backend API problems, what is [src/lib/errors/app-error.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/errors/app-error.ts) for?
It is used for **before-the-request** or purely structural frontend errors.

Examples where a component or hook might throw an [AppError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/errors/app-error.ts#3-13):

- The user tries to upload an image, but it exceeds 5MB. You catch it before it even hits Redux and throw an [AppError('File too large', 'VALIDATION_ERROR')](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/errors/app-error.ts#3-13).
- Local UI state corruption or missing critical browser APIs (like LocalStorage failing).

---

## 💡 3. Quick Do's and Don'ts

- **DON'T** make an Axios call to `http://localhost:4000` from the browser or Redux. The browser only calls Next.js `/api/...`.
- **DON'T** manually manage `accessToken` cookies on the client side. `HttpOnly` cookies are invisible to JavaScript. Let the browser send them automatically.
- **DO** keep API Route Handlers (`route.ts`) small. Delegate the work to `src/server/services/`.
- **DO** use `toast.error` inside React components or standard React hooks, keep visual notifications out of Redux and Route handlers.
- **DO** write Server Components whenever possible to fetch initial data directly from `src/server/services/` without needing an `/api/` route at all!
