# Next.js BFF Architecture Guidelines

This document outlines the strict flow and architectural rules for the Next.js Backend-For-Frontend (BFF) pattern. It specifically answers how data flows from the React UI all the way to the NestJS microservices.

---

## 🌊 The Overall Flow

```
1. React Component → 2. Redux Thunk → 3. Next.js API Route → 4. Next.js Service Layer → 5. NestJS Microservice
```

### Step 1: Client UI -> Next.js API (The Redux Thunk)

**What to send:**
The React components and Redux thunks should only send the _literal data_ required for the action.

- **POST/PUT/PATCH (Mutations):** Send the data in the **JSON `body`**. Example: `{ email: "x", password: "y" }` or `{ content: "new post" }`.
- **GET (Queries):** Send the data in the **URL Search Params** (e.g., `/api/posts?page=2`) or **URL Path** (e.g., `/api/posts/123`).

**How tokens are handled:**

- **CRITICAL RULE:** The client UI **never** manually attaches `accessToken` or [refreshToken](file:///d:/Projects/Main%20Projects/comment-application/apps/auth-service/src/users/users.controller.ts#57-69) to the `Authorization` header or body.
- Because the tokens are stored as `HttpOnly` cookies, the browser automatically and securely attaches them to every single request made to `/api/*`.

### Step 2: Next.js API Route Handlers (`src/app/api/...`)

**Purpose:** These are the "traffic cops". They receive the browser request, extract the data, check auth, and pass it to the brains.
**Method Handling:** Next.js uses file-based routing. You export functions named `export async function GET`, `POST`, `PUT`, etc. The browser's fetch method dictates which function runs.

**Extracting Data in the Route Handler:**

1. **Body (POST/PUT):** `const body = await request.json();`
2. **Query (GET):** `const { searchParams } = new URL(request.url); const page = searchParams.get('page');`
3. **Params (Dynamic Routes):** Handled via the second argument: `export async function GET(req, { params }) { const id = params.id; }`

**Connecting to the Service:**
The Route Handler must **never** contain heavy business logic or raw Axios calls. It extracts the data using the rules above, runs [authGuard(request)](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/server/bff/auth-guard.ts#11-37) to get the [AuthContext](file:///d:/Projects/Main%20Projects/comment-application/apps/frontend/src/server/bff/auth-guard.ts#5-10) (who the user is), and directly passes them to the Service Layer:

```typescript
const { userId } = await authGuard(request);
const result = await PostsService.createPost(userId, body);
return NextResponse.json(result.data, { status: result.error ? 400 : 200 });
```

### Step 3: The Service Layer (`src/server/services/...`)

**Purpose:** This is the bridge between Next.js and NestJS. It holds the pre-configured Axios clients and normalizes all results.

**Input Format:**
It takes strictly typed arguments. E.g., `createPost(userId: string, targetUserId: string, payload: CreatePostDto)`.

**Format Out (Success):**
It should return a predictable tuple or result object so the Route Handler doesn't need to try/catch:

```typescript
return { data: response.data, error: null };
```

**Format Out (Error):**
If the Axios call fails, the Service Layer catches it, extracts the `CustomErrorResponseDto` sent by your NestJS backend, and formats it cleanly:

```typescript
catch (error) {
   // Extracts the exact error emitted by NestJS
   return { data: null, error: { message: "Invalid Post", errorCode: "VALIDATION_FAILED", statusCode: 400 } };
}
```

---

## 🚫 Common Mistakes (What NOT To Do)

1. **Junior Mistake: Passing tokens in the body**
   - _Wrong:_ `fetch('/api/auth/logout', { body: JSON.stringify({ refreshToken }) })`
   - _Right:_ The browser sends the cookie automatically. The Route Handler reads it via `cookies().get('refreshToken')`.
2. **Junior Mistake: "Fat" Route Handlers**
   - _Wrong:_ Putting `try/catch`, `axios.post()`, and error mapping directly inside `src/app/api/auth/login/route.ts`.
   - _Right:_ The Route Handler should just be 10 lines of code. It delegates to `AuthService.login()`.
3. **Junior Mistake: Leaking Axios Errors to the UI**
   - _Wrong:_ Catching an error and doing `return NextResponse.json({ error: err })`. This dumps a giant, confusing network object to the frontend.
   - _Right:_ The Service layer catches the Axios error, shapes it to match `CustomErrorResponseDto`, and the Route Handler returns exactly that shape so the UI can check `if (error.errorCode === 'EXPIRED')`.
4. **Junior Mistake: Server Components calling `/api/`**
   - _Wrong:_ In a Next.js React Server Component (`app/dashboard/page.tsx`), doing `fetch('http://localhost:3000/api/profile')`.
   - _Right:_ Server Components are already on the server! They should bypass the Route Handler completely and just call `ProfileService.getProfile(userId)`.
