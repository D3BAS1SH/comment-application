# Error Handling & File Organization Guidelines

## Part 1: End-to-End Error Handling (The Chaining)

The error handling starts deep inside your NestJS microservices and propagates all the way up to your React components. Here is the exact path it travels:

### 1. The Microservice Layer (NestJS)

Your NestJS `auth-service` has three powerful exception filters configured in `src/common/filters/`:

- [prisma-exception.filter.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/auth-service/src/common/filters/prisma-exception.filter.ts) (Catches database errors)
- [jwt-exception.filter.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/auth-service/src/common/filters/jwt-exception.filter.ts) (Catches token expiration)
- [global-exception.filter.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/auth-service/src/common/filters/global-exception.filter.ts) (Catches everything else, including your generic [AppException](file:///d:/Projects/Main%20Projects/comment-application/apps/auth-service/src/common/exceptions/app.exception.ts#8-26) class).

**The Magic:** No matter _what_ crashes the backend, these filters catch it and force the error into this exact mathematical shape (defined by `CustomErrorResponseDto`):

```json
{
  "statusCode": 401,
  "message": "Token expired",
  "errorCode": "ACCESS_TOKEN_EXPIRED",
  "path": "/auth/profile"
}
```

### 2. The Next.js BFF Service Layer (`src/server/services/*.service.ts`)

The [AuthService](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/server/services/auth.service.ts#18-76) makes an Axios call to the microservice. Axios sees the `401` status code and throws an [AxiosError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#20-36).
Your new [handleAxiosError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#20-36) utility catches that exact error. It looks inside the `AxiosError.response.data`, sees the `CustomErrorResponseDto` from NestJS, and wraps it in a strongly typed [ServiceError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#4-19) class.
The Service layer then returns `return { data: null, error: ServiceError }`.

### 3. The Next.js Route Handler (`src/app/api/...`)

The Route handler looks at the result:

```typescript
if (result.error) {
  // It takes the exact status and message from the ServiceError (originally from NestJS)
  return NextResponse.json(
    { message: result.error.message, errorCode: result.error.errorCode },
    { status: result.error.statusCode }
  );
}
```

_Note: We never throw errors here. We gracefully return them as JSON so the browser `fetch` doesn't crash catastrophically._

### 4. The Client UI Redux Thunk (`loginUser`)

The Redux Thunk uses `fetch('/api/auth/login')`.
It explicitly checks:

```typescript
if (!response.ok) {
  const data = await response.json(); // Extracts `{ message, errorCode }`
  return rejectWithValue(data.message); // Throws the exact string back to the React component
}
```

### What about [src/lib/errors/app-error.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/errors/app-error.ts)?

This was a generic placeholder you had inside the frontend codebase before this pure BFF architectural switch. Going forward, the [ServiceError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts#4-19) acts as the single source of truth for all API-failure exceptions. [AppError](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/errors/app-error.ts#3-13) can safely be ignored or deleted unless you want to use it for strictly client-side problems (e.g., throwing a validation error _before_ the request even leaves the browser).

---

## Part 2: File Organization Conventions

It's common to get confused about where a file belongs in a Next.js App Router codebase. Here are the hard rules:

### 1. `src/utils/` vs `src/server/` vs `src/lib/`

| Directory         | Purpose                                                                                                                                                                                                                                                                        | Can run in Browser? | Can run in Node (Server)? |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ | :------------------------ |
| **`src/utils/`**  | Generic helper functions. Pure math, string formatting, reusable date formatters, and pure error mappers like [service-error.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/utils/service-error.ts). They do not "do" anything infrastructural. | ✅ Yes              | ✅ Yes                    |
| **`src/lib/`**    | Core business logic, constants, configured libraries (like Redux, specialized validation, UI libraries). Think "libraries" you write or wrap for the whole app.                                                                                                                | ✅ Yes              | ✅ Yes                    |
| **`src/server/`** | **STRICTLY SERVER.** If it imports `next/headers`, `cookies()`, `jose`, or uses raw Axios to call a microservice, it goes here. The browser must never import from this folder.                                                                                                | ❌ No               | ✅ Yes                    |

### 2. Addressing your specific file questions:

- **Is [auth-guard.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/server/bff/auth-guard.ts) a utility?**
  No. A utility is a generic, reusable helper (like `capitalizeString()`). [auth-guard.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/server/bff/auth-guard.ts) is an architectural pillar of your BFF security. It reads server-only request objects and parses JWTs using Node libraries. It perfectly belongs in `src/server/bff/` (Backend-For-Frontend).

- **Where do `lib/constants` go?**
  They stay exactly in `src/lib/constants`. Since those constants (like `ErrorCodes` strings) need to be imported by the Redux Thunk (Browser) _and_ the Route Handler (Server), `src/lib/` is the correct place for cross-environment shared logic.

- **Where does [lib/jwt/verify.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/jwt/verify.ts) go?**
  Technically, because it relies on the `jose` library to verify backend secrets using `process.env`, it is a **server-only** file. Moving it from [src/lib/jwt/verify.ts](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/lib/jwt/verify.ts) to `src/server/jwt/verify.ts` would be the most architecturally pure decision to prevent accidental client-side imports.
